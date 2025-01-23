import random
import requests
import re
import json
import os
import json 

OPENAI_API_KEY = os.getenv("API-KEY1")
LLAMA_API_KEY = os.getenv("LLAMA-key1")
OPENAI_URL = "https://api.openai.com/v1/chat/completions"
LLAMA_URL="https://api.groq.com/openai/v1/chat/completions"


# Load environment variables from .env file
api_keys = [os.getenv(f"API-KEY{i}") for i in range(1, 4)]
llama_keys = [os.getenv(f"LLAMA-key{i}") for i in range(1, 3)]

def generate_check_stories_prompt(stories, framework):
    stories_formatted = ''
    
    for index, story in enumerate(stories):
        if not isinstance(story, dict):
            print(f"Error: Story at index {index} is not a dictionary: {story}")
            continue
        
        # Ensure 'status' key is handled properly
        stories_formatted += (
            f"- Story ID {story['key']}: "
            f"'{story['user_story']}' "
            f"{story['epic']} "
            f"{story['description']} "
            f"{story.get('status', '')}\n"
        )

    return (
        "You are a meticulous assistant capable of evaluating user stories based on established frameworks.\n"
        f"Given the following list of user stories, evaluate each one to ensure it adheres to the principles of the {framework} framework.\n"
        "For each user story, provide the following details:\n"
        "1. User Story: The original user story.\n"
        "2. Framework: The framework used for evaluation ({framework}).\n"
        "3. Compliance: Whether the user story complies with the framework.\n"
        "4. Issues: If not compliant, list the specific issues.\n\n"
        "5. Description: The original description.\n"
        "6. Status: The original status.\n"
        "7. Epic: The original epic.\n"
        "Please use the following format for each evaluation:\n"
        "### User Story X:\n"
        "- User Story: <original_user_story>\n"
        "- Framework: {framework}\n"
        "- Compliance: <yes/no>\n"
        "- Issues: <list_of_issues>\n\n"
        "- Description: <original_description>\n"
        "- Status: <original_status>\n"
        "- Epic: <original_epic>\n"
        f"{stories_formatted}"
    )
    

def check_stories_with_framework(stories, framework, model, headers):
    prompt = generate_check_stories_prompt(stories, framework)

    if model == "llama3-70b-8192" or model == "mixtral-8x7b-32768":
        url = LLAMA_URL
        headers["Authorization"] = f"Bearer {LLAMA_API_KEY}"
    else:
        url = OPENAI_URL
        headers["Authorization"] = f"Bearer {OPENAI_API_KEY}"

    # headers = {"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"}
    post_data = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You are a meticulous assistant capable of evaluating user stories based on established frameworks."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }

    response = requests.post(url, json=post_data, headers=headers)
    if response.status_code == 200:
        completion = response.json()
        completion_text = completion['choices'][0]['message']['content']
        print(completion_text)
        checked_stories = parse_checked_stories(completion_text)
        return checked_stories
    else:
        raise Exception("Failed to process the request with OpenAI")

def parse_checked_stories(completion_text):
    pattern = re.compile(
        r"### User Story \d+:\n"
        r"- User Story: (.*?)\n"
        r"- Framework: (.*?)\n"
        r"- Compliance: (.*?)\n"
        r"- Issues: (.*?)\n"
        r"- Description: (.*?)\n"
        r"- Status: (.*?)\n"
        r"- Epic: (.*?)(?=\n### User Story \d+|\Z)",
        re.DOTALL
    )

    matches = pattern.findall(completion_text)
    checked_stories = []

    for match in matches:
        checked_stories.append({
            "user_story": match[0].strip(),
            "framework": match[1].strip(),
            "compliance": match[2].strip().lower() == 'yes',
            "issues": match[3].strip(),
            "description": match[4].strip(),
            "status": match[5].strip(),
            "epic": match[6].strip(),
        })

    return checked_stories


def parse_prioritized_stories(completion_text):
    pattern = re.compile(
        r"Story ID (\d+): '([^']+)' \(([^)]+)\)"
        )

    prioritized_stories = []
    for match in pattern.finditer(completion_text):
        story_id, story, category = match.groups()
        prioritized_stories.append({
            "ID": int(story_id),
            "user_story": story,
            "epic": category
        })
    return prioritized_stories

def construct_ahp_prompt(data):
    # Adjusted to match the provided JSON object's structure
    stories_formatted = '\n'.join([f"- Story ID {story['key']}: '{story['user_story']}' ( {story['epic']}) " for story in data['stories']])
    criteria_formatted = ', '.join(data['criteria'])
    criteria_comparisons_formatted = json.dumps(data['criteriaComparisons'], indent=2)
    story_comparisons_formatted = {k: json.dumps(v, indent=2) for k, v in data['storyComparisons'].items()}
    
    prompt_content = (
        f"You are a helpful assistant. Using the Analytic Hierarchy Process (AHP), prioritize the following user stories based on the criteria of {criteria_formatted}.\n"
        "Here are the stories:\n"
        f"{stories_formatted}\n\n"
        "The criteria comparisons are as follows:\n"
        f"{criteria_comparisons_formatted}\n\n"
        "The story comparisons under each criterion are as follows:\n"
        f"{json.dumps(story_comparisons_formatted, indent=2)}\n\n"
        "Considering these criteria and their comparisons, along with the user story comparisons under each criterion, please return the prioritized list of user stories by their ID, in descending order of priority."
    )
    return prompt_content

def prioritize_stories_with_ahp(data, model):
 
    prompt = construct_ahp_prompt(data)
    headers = {"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"}
    post_data = {
        "model": "gpt-4o-mini",
        "messages": [{"role": "system", "content": "You are a helpful assistant trained in AHP."}, {"role": "user", "content": prompt}],
        "temperature": 0.7
    }
    response = requests.post(OPENAI_URL, json=post_data, headers=headers)
    print('response checking: ',response)
    if response.status_code == 200:
        completion = response.json()
        print('completion response',completion)
        completion_text = completion['choices'][0]['message']['content']
        print(completion_text)
        prioritized_stories = parse_prioritized_stories(completion_text)
        print('prioritized_stories ',prioritized_stories)
        return prioritized_stories
    else:
        raise Exception("Failed to process the request with OpenAI")

#***// Prioritize 100 dollar method // **#
def prioritize_stories_with_100_dollar_method(data):
    # Initialize an empty dictionary to store the total scores for each story
    story_scores = {}

    # Iterate over each story
    for story in data['stories']:
        total_score = 0
        
        # Calculate the score for each criterion based on the provided weights
        for criterion, weight in data['criteriaWeights'].items():
            # Assuming each criterion has a score associated with it for each story
            # You can replace this with your own scoring mechanism
            # Here, I'm just multiplying a random score (between 1 and 10) with the weight
            criterion_score = story.get(criterion, 0) * weight
            total_score += criterion_score
        
        # Assign the total score to the story
        story_scores[story['key']] = total_score
    
    # Sort the stories based on their total scores in descending order
    prioritized_stories = sorted(story_scores.items(), key=lambda x: x[1], reverse=True)
    
    # Convert the prioritized stories into the desired format
    prioritized_stories_formatted = []
    for story_id, total_score in prioritized_stories:
        # Find the story details based on its ID
        for story in data['stories']:
            if story['key'] == story_id:
                prioritized_stories_formatted.append({
                    'key': story_id,
                    'user_story': story['user_story'],
                    'epic': story['epic']
                })
                break
    
    return prioritized_stories_formatted



##### Moscow 
def construct_moscow_prompt(user_stories, method):
    stories_formatted = '\n'.join([f"- {story['ID']}: {story['Story']} (Context: {story['Context']})" for story in user_stories])
    prompt_content = (
        f"You are a helpful assistant trained in software development prioritization. "
        f"Using the {method} method, categorize the following user stories into Must have, Should have, Could have, and Won't have:\n\n"
        f"{stories_formatted}\n\n"
        "Please provide the categorization in a structured format."
    )
    return prompt_content

def categorize_stories_with_moscow(user_stories, method, model):

    prompt = construct_moscow_prompt(user_stories, method)
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    post_data = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }
    response = requests.post(OPENAI_URL, json=post_data, headers=headers)

    if response.status_code == 200:
        completion = response.json()
        completion_text = completion['choices'][0]['message']['content']
        # Implement parsing of completion_text to structure the MoSCoW categorization
        return parse_moscow_categorized_stories(completion_text)
    else:
        raise Exception("Failed to process the request with OpenAI")


def parse_moscow_categorized_stories(completion_text):
    categorized_stories = []

    # Adjusted regex pattern to match the format of your response
    pattern = re.compile(r"\*\*(Must have|Should have|Could have|Won't have):\*\*\n((?:\d+\..+?\n)+)")

    categories = pattern.findall(completion_text)
    for category, stories_text in categories:
        story_pattern = re.compile(r"(\d+)\. (.+?) \(Context: (.+?)\)")
        for story_match in story_pattern.finditer(stories_text.strip()):
            story_id, story, context = story_match.groups()
            categorized_stories.append({
                "ID": int(story_id),  # Assuming the ID refers to the position in the list rather than a unique identifier
                "Story": story,
                "Context": context,
                "Category": category
            })

    return categorized_stories

    
def generate_user_stories_with_epics( vision, mvp, model, headers):

    if model == "llama3-70b-8192" or model == "mixtral-8x7b-32768":
        url = LLAMA_URL
        headers["Authorization"] = f"Bearer {LLAMA_API_KEY}"
    else:
        url = OPENAI_URL
        headers["Authorization"] = f"Bearer {OPENAI_API_KEY}"


    # prompt_content = (
    # "You are a helpful assistant tasked with generating unique user stories and suggesting epics from any project description or objective provided.\n"
    # "Given the objective or project description: '{objective}', generate distinct user stories based upon the specified goals and requirements. Each user story should comprehensively address both the functional and technical aspects relevant to the project, ensuring uniqueness and avoiding duplication.\n"
    # "For each user story, provide the following details:\n"
    # "1. User Story: A clear and concise description that encapsulates a specific need or problem. Example: 'As a <role>, I want to <action>, in order to <benefit>'. Each story should be tailored to distinct functionalities or features identified in the project’s description.\n"
    # "2. Epic: The epic under which the user story falls. Each epic should cover a broad thematic area that may include multiple user stories sharing a similar scope or functionality. Epics help organize user stories into manageable groups.\n"
    # "3. Description: Detailed acceptance criteria for the user story, specifying what success looks like for the story to be considered complete.\n"
    # "4. Sub-tasks: Include sub-tasks only if they are essential to the implementation of the user story. If sub-tasks are not necessary, this section can be left blank. Describe only general steps or tasks necessary to achieve the user story when included.\n\n"
    # "Please use the following format for each story:\n"
    # "### User Story X:\n"
    # "- User Story: As a <role>, I want to <action>, in order to <benefit>.\n"
    # "- Epic: <epic>\n"
    # "- Description: Detailed and clear acceptance criteria that define the success of the user story.\n"
    # "- Sub-tasks:\n"
    # "  1. <Sub-task 1> - General description of an essential action or task (if applicable).\n"
    # "  2. <Sub-task 2> - Another necessary step for achieving the objectives of the user story (if applicable).\n"
    # "  3. <Sub-task 3> - Further actions required to complete the user story (if applicable).\n"
    # "  ...\n\n"
    # "When generating user stories, ensure they are clearly categorized under relevant epics based on the overarching themes or functionalities identified in the project description. This structure promotes organizational clarity and aids in efficient project management and implementation.\n"
    # ).format(objective=objective)

#     prompt_content = (
#     "You are a helpful assistant tasked with generating unique user stories and grouping them under relevant epics based on any project vision or MVP goal provided.\n"
#     "Given the project vision: '{vision}' and MVP goals: '{mvp}', generate distinct user stories that align with these core elements. Ensure each story comprehensively addresses both functional and technical aspects relevant to the project, with a focus on supporting the project's primary vision and achieving a functional MVP.\n"
#     "For each user story, provide the following details:\n"
#     "1. User Story: A clear and concise description that encapsulates a specific need or problem. Example: 'As a <role>, I want to <action>, in order to <benefit>'. Each story should directly support the project's vision or contribute towards a functional MVP.\n"
#     "2. Epic: The broad epic under which the user story falls. Each epic should cover a thematic area and can encompass multiple related user stories that share a similar scope or functionality. This structure helps organize user stories into meaningful groups that align with the project's vision.\n"
#     "3. Description: Detailed acceptance criteria for the user story, specifying what success looks like for the story to be considered complete, particularly in terms of MVP completion and alignment with the vision.\n"
#     "4. Sub-tasks: Include sub-tasks only if they are essential to the implementation of the user story. If sub-tasks are not necessary, this section can be left blank. Describe only general steps or tasks necessary to achieve the user story when included.\n\n"
#     "Please use the following format for each story:\n"
#     "### User Story X:\n"
#     "- User Story: As a <role>, I want to <action>, in order to <benefit>.\n"
#     "- Epic: <epic> (Note: This epic may encompass multiple related user stories)\n"
#     "- Description: Detailed and clear acceptance criteria that define the success of the user story, particularly in achieving MVP functionality and supporting the overall vision.\n"
#     "- Sub-tasks:\n"
#     "  1. <Sub-task 1> - General description of an essential action or task (if applicable).\n"
#     "  2. <Sub-task 2> - Another necessary step for achieving the objectives of the user story (if applicable).\n"
#     "  3. <Sub-task 3> - Further actions required to complete the user story (if applicable).\n"
#     "  ...\n\n"
#     "When generating user stories, ensure they are grouped under relevant epics based on the overarching themes, functionalities, or MVP goals identified. This structure promotes organizational clarity, supports efficient project management, and aligns with the project's vision and MVP goals."
# ).format(vision=vision, mvp=mvp)

    prompt_content = (
    "You are a helpful assistant tasked with generating unique user stories and grouping them under relevant epics based on any project vision or MVP goal provided.\n"
    "When generating user stories, ensure they are grouped under relevant epics based on overarching themes, functionalities, or MVP goals identified. Each epic should contain multiple user stories that cover various aspects of the same theme or functionality. "
    "Aim to generate as many stories as necessary to fully cover the scope of the project, with **no upper limit on the number of user stories**. Focus on breaking down large functionalities into individual, task-specific stories.\n\n"
    "Given the project vision: '{vision}' and MVP goals: '{mvp}', generate a comprehensive and distinct set of user stories that align with these core elements. "
    "Ensure each story comprehensively addresses both functional and technical aspects relevant to the project, with a focus on supporting the project's primary vision and achieving a highly detailed MVP.\n\n"
    "For each user story, provide the following details:\n"
    "1. User Story: A clear and concise description that encapsulates a specific need or problem. Example: 'As a <role>, I want to <action>, in order to <benefit>'. Each story should directly support the project's vision or contribute towards a functional MVP.\n"
    "2. Epic: The broad epic under which the user story falls. Each epic can encompass multiple related user stories that share a similar scope or functionality.\n"
    "3. Description: Detailed acceptance criteria for the user story, specifying what success looks like for the story to be considered complete, particularly in terms of MVP completion and alignment with the vision.\n\n"
    "Additional Guidance:\n"
    "- **Encourage atomic functionalities**: Create user stories for individual actions and small steps within each phase of the MVP.\n"
    "- **Ensure maximum detail**: Generate highly specific user stories that focus on even the smallest functionalities, such as scanning, logging in, generating reports, and handling errors.\n"
    "- **No upper limit**: Keep breaking down actions until all core and sub-tasks within the MVP are covered.\n\n"
    "Please use the following format for each story:\n"
    "### User Story X:\n"
    "- User Story: As a <role>, I want to <action>, in order to <benefit>.\n"
    "- Epic: <epic> (This epic may encompass multiple related user stories)\n"
    "- Description: Detailed and clear acceptance criteria that define the success of the user story, particularly in achieving MVP functionality and supporting the overall vision.\n"
).format(vision=vision, mvp=mvp)

    



    # Prepare the data for the POST request to OpenAI using the Chat API format
    post_data = json.dumps({
        "model": model,
        "messages": [
            {"role": "system", "content": "You are a helpful assistant capable of generating user stories and suggesting epics from the objective."},
            {"role": "user", "content": prompt_content}
        ],
        "temperature": 0.7
    })

    response = requests.post(url, data=post_data, headers=headers)
    
    if response.status_code == 200:
        response_data = response.json()
        generated_content = response_data['choices'][0]['message']['content']
        print(generated_content)
        parsed_stories = parse_user_stories(generated_content)
        print(parsed_stories)
        return parsed_stories
    else:
        raise Exception("Failed to process the request with OpenAI: " + response.text)


def parse_user_stories(text_response):
    # Adjusted pattern to match the structured numbered list format, including the last line without a newline
    pattern = re.compile(
        r"### User Story \d+:\n"
        r"- User Story: (.*?)\n"
        r"- Epic: (.*?)\n"
        r"- Description: (.*?)(?=\n### User Story \d+:|\Z)",
        re.DOTALL
    )

    matches = pattern.findall(text_response)
    user_stories = []

    for match in matches:
        user_stories.append({
            "user_story": match[0].strip(),
            "epic": match[1].strip(),
            "description": match[2].strip(),
        })

    if not user_stories:
        user_stories.append({
            "user_story": "User story not provided",
            "epic": "Epic not provided",
            "description": "Description not provided",
        })

    return user_stories



# Parsing the response

