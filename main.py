from dotenv import load_dotenv
from pydantic import BaseModel, ValidationError
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.prompts import MessagesPlaceholder
from langchain.agents import create_tool_calling_agent, AgentExecutor
from functools import partial
from tools import *
from chroma_db import *
import re 
from typing import List, Dict, Any
import logging
import json
import argparse

load_dotenv()

logging.basicConfig(
    filename='llm_output.log',  # Output file name
    level=logging.INFO,         # Log level
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("my_app_logger")

def extract_json_block(text):
    match = re.search(r'({.*})', text, re.DOTALL)
    if match:
        return match.group(1)
    raise ValueError("No JSON block found")

# === Output Model ===
class UserStory(BaseModel):
    description: str
    acceptance_criteria: List[str]
    priority: str

class Screen(BaseModel):
    name: str
    purpose: str
    key_ui_elements: List[str]
    navigation_targets: List[str]

class UIComponent(BaseModel):
    name: str
    purpose: str
    customization_options: List[str]
    documentation_link: str = ""

class APIEndpoint(BaseModel):
    http_method: str
    url_path: str
    description: str
    required_parameters: List[Dict[str, str]]
    example_request: Dict[str, Any]
    example_response: Dict[str, Any]

class UserStoriesResponse(BaseModel):
    user_stories: List[UserStory]

class ComponentsResponse(BaseModel):
    screens: List[Screen]
    ui_components: List[UIComponent] 
    api_endpoints: List[APIEndpoint]

# === Prompt ===#
user_stories_prompt = """
You are an expert app planner. Generate an exhaustive list of user stories for the given app, following the INVEST principles. For each story, include:
- description
- acceptance_criteria (as a list)
- priority (High, Medium, Low)

Below is the parser model the output must conform too
class UserStory(BaseModel):
    description: str
    acceptance_criteria: List[str]
    priority: str

class UserStoriesResponse(BaseModel):
    user_stories: List[UserStory]

Return only a valid JSON object with a single key 'user_stories', whose value is a list of user story objects. Do not include any extra text or explanation.
"""
prompt_stories = ChatPromptTemplate.from_messages([

    ("system", user_stories_prompt),
    ("human", "{input}"),
    MessagesPlaceholder("agent_scratchpad")
])

components_prompt = """
You are an expert app planner. Given the following user stories in JSON format, generate a comprehensive plan for the required screens, UI components, and RESTful API endpoints for the app. For each, provide detailed metadata as described below.

Return only a valid JSON object with the following keys: screens, ui_components, api_endpoints. Do not include any extra text or explanation.

For each screen, include: name, purpose, key_ui_elements (list), navigation_targets (list).
For each ui_component, include: name, purpose, customization_options (list), documentation_link.
For each api_endpoint, include: http_method, url_path, description, required_parameters (list), example_request (object), example_response (object).

Below is the output pydanticmodel the output must conform too in order to be parsed. Always follow the pydanticmodel even if this requires putting empty lists for certain keys.
class Screen(BaseModel):
    name: str
    purpose: str
    key_ui_elements: List[str]
    navigation_targets: List[str]

class UIComponent(BaseModel):
    name: str
    purpose: str
    customization_options: List[str]
    documentation_link: str = ""

class APIEndpoint(BaseModel):
    http_method: str
    url_path: str
    description: str
    required_parameters: List[Dict[str, str]]
    example_request: Dict[str, Any]
    example_response: Dict[str, Any]

class ComponentsResponse(BaseModel):
    screens: List[Screen]
    ui_components: List[UIComponent] 
    api_endpoints: List[APIEndpoint]

"""
prompt_components = ChatPromptTemplate.from_messages([
    ("system", components_prompt),
    ("human", "{input}" ),
    MessagesPlaceholder("agent_scratchpad")
])

# === Main Run ===
def run_agent_with_rag_tool(query: str, parser: PydanticOutputParser, prompt: ChatPromptTemplate, tools: list):
    # === Agent ===
    llm = ChatAnthropic(model="claude-3-5-sonnet-20241022")
    #parser = PydanticOutputParser(pydantic_object=PlannerResponse)


    agent = create_tool_calling_agent(llm=llm, tools=tools, prompt=prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
    result = agent_executor.invoke({"input": query})
    output = result["output"]
    if isinstance(output, list) and output and "text" in output[0]:
        output_text = output[0]["text"]
    elif isinstance(output, dict) and "text" in output:
        output_text = output["text"]
    else:
        output_text = str(output)
    try:
        json_str = extract_json_block(output_text)
    except Exception as e:
        print("failed to extract json blocks:", e)
        raise
    return parser.parse(json_str)

# === Main Function ===
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--add-new", action="store_true", help="Add new documents to the vectorstore")
    args = parser.parse_args()

    embedding = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vectorstore = prepare_vectorstore(embedding, config, args.add_new)
    retriever = vectorstore.as_retriever(
        search_type="mmr",
        search_kwargs={"k": config.search_k}
    )
    rag_tool_with_retriever = make_rag_tool(retriever)
    tools = [rag_tool_with_retriever]
    tools = [rag_tool_with_retriever]

    query = "Develop a Todo app with login"
    try:
        user_stories_response = run_agent_with_rag_tool(
            query=query,
            parser=PydanticOutputParser(pydantic_object=UserStoriesResponse),
            prompt=prompt_stories,
            tools=tools
        )
        user_stories_response_json = user_stories_response.json()
        logging.info("User Stories:")
        logging.info(json.dumps(json.loads(user_stories_response_json), indent=2))

        components_response = run_agent_with_rag_tool(
            query=user_stories_response_json,
            parser=PydanticOutputParser(pydantic_object=ComponentsResponse),
            prompt=prompt_components,  # This is your instruction template with user stories injected
            tools=tools
        )

        logging.info("\nComponents, Screens, and API Endpoints:")
        logging.info(json.dumps(components_response.dict(), indent=2))


    except ValidationError as e:
        logger.error(f"Validation failed: {e}")
    except Exception as e:
        logger.critical(f"Execution failed: {e}")

if __name__ == "__main__":
    main()
