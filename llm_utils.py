import json
import re
from typing import Any, Type, Union
import logging
from pydantic import BaseModel, ValidationError
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_xai import ChatXAI
from langchain_google_genai import ChatGoogleGenerativeAI

logger = logging.getLogger("my_app_logger")

# If you use logger or extract_json_block elsewhere, import them too:
# from your_logger_module import logger
# from your_json_utils import extract_json_block

def escape_curly_braces(prompt: str) -> str:
    """
    Escapes all curly braces in a prompt string.
    """
    return prompt.replace("{", "{{").replace("}", "}}")

def extract_json(output: str) -> Any:
    """
    Extracts the first valid JSON object from an LLM output string.
    """
    match = re.search(r"\{.*\}", output, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    return None

def remove_key_from_llm_output(output: dict, key: str) -> dict:
    """
    Returns the dict without the specified key.
    """
    if key in output:
        output = output.copy()
        output.pop(key)
    return output

def parse_llm_output_to_model(output: str, model: Type[BaseModel]) -> Any:
    """
    Parses LLM output (string or dict) to a specific Pydantic model.
    """
    if isinstance(output, str):
        data = extract_json(output)
    else:
        data = output
    try:
        return model.parse_obj(data)
    except ValidationError as e:
        print(f"Validation error: {e}")


def build_prompt(template: str) -> ChatPromptTemplate:
    return ChatPromptTemplate.from_messages([
        ("system", template),
        ("human", "{input}"),
        MessagesPlaceholder("agent_scratchpad")
    ])

def parse_json_or_log(output_text, model_cls):
    try:
        json_str = extract_json(output_text)
        data = json.loads(json_str)
        result = model_cls(**data)
        return result
    except Exception as e:
        logger.error(f"Failed to parse JSON: {e}\nOutput was:\n{output_text}")
        raise

def extract_json_from_llm(llm_output, key="output"):
    """
    If llm_output is a dict with a key whose value is a JSON string or dict,
    extract and return the JSON object.
    """
    if isinstance(llm_output, dict) and key in llm_output:
        value = llm_output[key]
        if isinstance(value, str):
            return extract_json(value)
        elif isinstance(value, dict):
            return value
    # If output is a string, try to extract JSON
    if isinstance(llm_output, str):
        return extract_json(llm_output)
    return llm_output

def call_agent(llm: Union[ChatOpenAI, ChatAnthropic, ChatXAI, ChatGoogleGenerativeAI], prompt_template: ChatPromptTemplate, input_text: str, tools: list, memory=None, verbose: bool = True) -> str:
    agent = create_tool_calling_agent(llm=llm, tools=tools, prompt=prompt_template)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=verbose)
    # Properly extract chat history from memory object
    if memory and hasattr(memory, "load_memory_variables"):
        messages = memory.load_memory_variables({}).get("chat_history", [])
    else:
        messages = memory if memory else []
    result = agent_executor.invoke({"input": input_text, "chat_history": messages})
    output = result.get("output", result)
    if isinstance(output, list) and output and "text" in output[0]:
        return output[0]["text"]
    elif isinstance(output, dict) and "text" in output:
        return output["text"]
    return str(output)
