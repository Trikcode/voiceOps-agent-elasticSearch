
import os
from dotenv import load_dotenv
from elasticsearch import Elasticsearch
from openai import OpenAI

load_dotenv()

ELASTICSEARCH_URL = os.getenv("ELASTICSEARCH_URL")
ELASTICSEARCH_API_KEY = os.getenv("ELASTICSEARCH_API_KEY")
LLM_API_KEY = os.getenv("LLM_API_KEY")
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://api.groq.com/openai/v1")
LLM_MODEL = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")
SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL", "")

JIRA_DOMAIN = os.getenv("JIRA_DOMAIN", "")
JIRA_EMAIL = os.getenv("JIRA_EMAIL", "")
JIRA_API_TOKEN = os.getenv("JIRA_API_TOKEN", "")
JIRA_PROJECT_KEY = os.getenv("JIRA_PROJECT_KEY", "VO")

es_client = Elasticsearch(ELASTICSEARCH_URL, api_key=ELASTICSEARCH_API_KEY)
llm_client = OpenAI(api_key=LLM_API_KEY, base_url=LLM_BASE_URL)