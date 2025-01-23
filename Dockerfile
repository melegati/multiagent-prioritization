FROM node:23-slim

RUN apt-get update \ 
    && apt-get install -y git python3.11 python3.11-venv python3-pip

RUN git clone https://github.com/melegati/multiagent-prioritization

WORKDIR /multiagent-prioritization
RUN python3 -m venv env
ENV PATH="/multiagent-prioritization/env/bin:$PATH"
RUN pip install -r requirements.txt
RUN npm i

ENTRYPOINT [ "uvicorn", "app:app", "--reload", "--host", "0.0.0.0", "--port", "8000" ]   