# helpers.py

import re
import random
import logging
import os
import csv
from starlette.datastructures import UploadFile
import httpx
from httpx import Timeout, AsyncClient
import asyncio
from starlette.websockets import WebSocket, WebSocketDisconnect, WebSocketState


# Load environment variables from .env file
api_keys = [os.getenv(f"API-KEY{i}") for i in range(1, 4)]

print("API Keys: in ", api_keys)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_random_temperature(low=0.1, high=0.7):
    return random.uniform(low, high)

def construct_greetings_prompt(prioritization_technique):
    prompt = (
        "PO: Hi QA and QA, hope you're both having a great day!\n"
        "QA: Hi PO, hi Developer! I’m doing well, thanks.\n"
        "Developer: Hey PO, hey QA! All good here.\n\n"
        "PO: We have some user stories pending in our backlog that we need to prioritize.\n"
        f"QA: Let's use the {prioritization_technique} technique for prioritization.\n"
        "Developer: Sounds good to me. Let's dive in."
    )
    return prompt

def construct_topic_prompt(stories, technique):
    stories_formatted = construct_stories_formatted(stories)
    prompt = (
        "PO, QA, and Developer, please discuss the following user stories and introduce the topic of the requirements:\n\n"
        f"{stories_formatted}\n\n"
        f"Please consider the prioritization technique: {technique}.\n\n"
    )
    return prompt

def construct_context_prompt(stories, technique):
    stories_formatted = construct_stories_formatted(stories)
    prompt = (
        "PO, QA, and Developer, please discuss the context and relevance of the following user stories:\n\n"
        f"{stories_formatted}\n\n"
        f"Please consider the prioritization technique: {technique}.\n\n"
    )
    return prompt

def construct_batch_100_dollar_prompt(data):
    stories_formatted = '\n'.join([
        f"- Story ID {story['key']}: '{story['user_story']}' {story['epic']} "
        for story in data['stories']
    ])
    
    prompt = (
        "You are a helpful assistant trained in prioritization techniques. "
        "We need to prioritize the following user stories by distributing 100 dollars (points) among them. "
        "The more important a story, the more dollars it should receive. "
        "Here are the stories:\n\n"
        f"{stories_formatted}\n\n"
        "Please distribute 100 dollars across these stories. Each dollar represents the relative importance of that story. "
        "Make sure the total adds up to 100 dollars. Format the output as:\n"
        "- Story ID X: Y dollars\n"
        "- Story ID Z: W dollars"
    )
    
    return prompt

def parse_100_dollar_response(response_text):
    pattern = re.compile(r"- Story ID (\d+): .*?(\d+) dollars")
    dollar_distribution = []

    for match in pattern.finditer(response_text):
        story_id, dollars = match.groups()
        dollar_distribution.append({
            'story_id': int(story_id),
            'dollars': int(dollars)
        })

    return dollar_distribution

def validate_dollar_distribution(dollar_distribution, stories):
    total_dollars = sum(dist['dollars'] for dist in dollar_distribution)
    story_ids = {story['key'] for story in stories}
    response_story_ids = {dist['story_id'] for dist in dollar_distribution}
    
    return total_dollars == 100 and story_ids == response_story_ids

def enrich_stories_with_dollar_distribution(original_stories, dollar_distribution):
    dollar_dict = {dist['story_id']: dist['dollars'] for dist in dollar_distribution}

    enriched_stories = []
    for story in original_stories:
        story_id = story['key']
        story['dollar_allocation'] = dollar_dict.get(story_id, 0)
        enriched_stories.append(story)

    # Sort the enriched stories by dollar_allocation in descending order
    enriched_stories.sort(key=lambda x: x['dollar_allocation'], reverse=True)
    
    return enriched_stories

def construct_stories_formatted(stories):
    return '\n'.join([
        f"- Story ID {story['key']}: '{story['user_story']}' {story['epic']} "
        for story in stories
    ])

def ensure_unique_keys(stories):
    seen = {}
    for story in stories:
        key = story['key']
        if key in seen:
            seen[key] += 1
            story['key'] = f"{key}_{seen[key]}"
        else:
            seen[key] = 0
    return stories

async def estimate_wsjf(data, websocket):
    headers = {
        "Authorization": f"Bearer {random.choice(api_keys)}",
        "Content-Type": "application/json"
    }
    
    prioritize_prompt = construct_batch_wsjf_prompt(data)
    #logger.info(f"Prioritize Prompt:\n{prioritize_prompt}")  # Debugging print
    estimated_factors = await send_to_llm(prioritize_prompt, headers)
    await stream_response_word_by_word(websocket, estimated_factors, "Final Prioritization")
    #logger.info(f"Estimated Factor:\n{estimated_factors}")
    
    wsjf_factors = parse_wsjf_response(estimated_factors)
    logger.info(f"wsjf_factors Factor:\n{wsjf_factors}")
    

    enriched_stories = enrich_original_stories_with_wsjf(data, wsjf_factors)
    logger.info(f"wsjf_factors Factor:\n{enriched_stories}")

    return enriched_stories
    
def construct_batch_wsjf_prompt(stories):
    stories_formatted = '\n'.join([
        f"- Story ID {story['key']}: '{story['user_story']}' {story['epic']} "
        for story in stories
    ])
    
    prompt = (
        "You are a helpful assistant trained in WSJF factor estimation. "
        "For each of the following user stories, please provide estimated numeric values (scale 1 to 10) for the WSJF factors:\n\n"
        f"Here are the stories:\n{stories_formatted}\n\n"
        "Please consider the following factors and provide values on a scale of 1 to 10, where 1 represents the lowest impact or effort and 10 represents the highest:\n"
        "- Business Value (BV): The relative importance of this story to the business or stakeholders.\n"
        "- Time Criticality (TC): The urgency of delivering this story sooner rather than later.\n"
        "- Risk Reduction/Opportunity Enablement (RR/OE): The extent to which delivering this story can reduce risks or enable new opportunities.\n"
        "- Job Size (JS): The amount of effort required to complete this story, typically measured in story points or ideal days.\n\n"
        "Format the output as:\n"
        "- Story ID X: (Epic: Y)\n"
        "  - Business Value (BV): Z\n"
        "  - Time Criticality (TC): W\n"
        "  - Risk Reduction/Opportunity Enablement (RR/OE): V\n"
        "  - Job Size (JS): U\n"
    )
    
    return prompt

def parse_wsjf_response(response_text):
    pattern = re.compile(
        r"- Story ID (\d+): \(Epic: .+?\)\n"  # Capture the story ID and the epic
        r"\s+- Business Value \(BV\): (\d+)\n"  # Capture Business Value
        r"\s+- Time Criticality \(TC\): (\d+)\n"  # Capture Time Criticality
        r"\s+- Risk Reduction/Opportunity Enablement \(RR/OE\): (\d+)\n"  # Capture Risk Reduction/Opportunity Enablement
        r"\s+- Job Size \(JS\): (\d+)"  # Capture Job Size
    )

    wsjf_factors = []
    for match in pattern.finditer(response_text):
        story_id, bv, tc, rr_oe, js = match.groups()
        wsjf_factors.append({
            'story_id': int(story_id),
            'wsjf_factors': {
                'BV': int(bv),
                'TC': int(tc),
                'RR/OE': int(rr_oe),
                'JS': int(js)
            }
        })

    return wsjf_factors

def validate_wsjf_response(wsjf_factors, stories):
    story_ids = {story['key'] for story in stories}
    response_story_ids = {factor['story_id'] for factor in wsjf_factors}
    
    if story_ids == response_story_ids:
        return True
    return False

def enrich_original_stories_with_wsjf(original_stories, wsjf_factors):
    wsjf_dict = {factor['story_id']: factor['wsjf_factors'] for factor in wsjf_factors}
    logger.info(f"Original stories:\n{original_stories}")
    logger.info(f"WSJF factors dictionary:\n{wsjf_dict}")

    enriched_stories = []
    for story in original_stories:
        story_id = story['key']
        if story_id in wsjf_dict:
            wsjf_data = wsjf_dict[story_id]
            story['wsjf_factors'] = wsjf_data
            bv = wsjf_data['BV']
            tc = wsjf_data['TC']
            rr_oe = wsjf_data['RR/OE']
            js = wsjf_data['JS']
            wsjf_score = (bv + tc + rr_oe) / js if js != 0 else 0  # Prevent division by zero
            story['wsjf_score'] = wsjf_score
            story['bv'] = bv
            story['tc'] = tc
            story['oe'] = rr_oe
            story['js'] =  js 

            logger.info(f"Story ID {story_id} WSJF factors: {wsjf_data}, WSJF score: {wsjf_score}")
        else:
            story['wsjf_factors'] = {
                'BV': 0,
                'TC': 0,
                'RR/OE': 0,
                'JS': 0
            }
            story['wsjf_score'] = 0
            story['bv'] = 0
            story['tc'] = 0
            logger.warning(f"Story ID {story_id} not found in WSJF factors")

        enriched_stories.append(story)

    enriched_stories = sort_stories_by_wsjf_in_place(enriched_stories)
    return enriched_stories

def sort_stories_by_wsjf_in_place(enriched_stories):
    return sorted(enriched_stories, key=lambda story: story.get('wsjf_score', 0), reverse=True)

   
    enriched_sorted_stories = sort_stories_by_wsjf_in_place(enriched_stories)
    logger.info(f"Append and Sorted:\n{enriched_sorted_stories}")
    return enriched_sorted_stories

def sort_stories_by_wsjf_in_place(enriched_stories):
    return sorted(enriched_stories, key=lambda story: story.get('wsjf_score', 0), reverse=True)


def save_uploaded_file(upload_folder, file: UploadFile):
    if not file.filename.endswith('.csv'):
        return None, 'Unsupported file type'

    file_path = os.path.join(upload_folder, file.filename)
    with open(file_path, 'wb') as f:
        f.write(file.file.read())
    return file_path, None

def parse_csv_to_json(file_path):
    with open(file_path, mode='r', encoding='utf-8') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        csv_data = list(csv_reader)  # Convert CSV file content to a list of dictionaries
    os.remove(file_path)  # Optional: remove the file after processing
    return csv_data

async def send_to_llm(prompt, headers, max_retries=1):
    for attempt in range(max_retries):
        try:
            post_data = {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {"role": "system", "content": "You are an expert in prioritization techniques."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7
            }

            timeout = Timeout(60.0, connect=60.0)
            async with AsyncClient(timeout=timeout) as client:
                response = await client.post("https://api.openai.com/v1/chat/completions", json=post_data, headers=headers)

                if response.status_code == 200:
                    completion = response.json()
                    return completion['choices'][0]['message']['content']
                else:
                    logger.error(f"Error: Received a non-200 status code: {response.status_code}")
                    logger.error(f"Response text: {response.text}")
        except httpx.RequestError as e:
            logger.error(f"HTTP Request failed: {str(e)}")
        logger.info(f"Retrying... ({attempt + 1}/{max_retries})")

    raise Exception("Failed to get response from OpenAI after multiple attempts")


async def stream_response_word_by_word(websocket, response, agent_type, delay=0.6):

    if websocket.application_state != WebSocketState.DISCONNECTED:
        await websocket.send_json({
            "agentType": agent_type,
            "message": response
        })
        await asyncio.sleep(delay)  # Delay to simulate streaming effect  