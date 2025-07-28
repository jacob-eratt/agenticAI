import json
import os
import re
from typing import Any, Type, Union
import logging
import ast
from pydantic import BaseModel, ValidationError
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_xai import ChatXAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.documents import Document

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
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=verbose, max_iterations=30)  # Increase max_iterations if needed
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



def serialize_container(container_dict):
    return {
        box_name: {
            "id": box.id,
            "name": box.name,
            "description": box.description,
            "stories": box.stories
        }
        for box_name, box in container_dict.items()
    }

def save_containers_to_files(containers, folder_path="containers"):
    os.makedirs(folder_path, exist_ok=True)
    for container_name, box_dict in containers.items():
        file_path = os.path.join(folder_path, f"{container_name}.json")
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(serialize_container(box_dict), f, indent=2)




def serialize_ui_boxes(ui_boxes):
    return {
        box_name: {
            "id": box.id,
            "name": box.name,
            "description": box.description,
            "stories": box.stories
        }
        for box_name, box in ui_boxes.items()
    }

def save_ui_boxes_to_json(ui_boxes, filename="ui_boxes.json"):
    """
    Serialize and save the UI component boxes to a JSON file.
    """
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(serialize_ui_boxes(ui_boxes), f, indent=2)
    print(f"UI boxes saved to {filename}")


def load_boxes_from_jsons(containers_folder="containers"):
    """
    Load all boxes from all container JSON files.
    Returns a list of dicts, each representing a box with its container.
    """
    boxes = []
    for fname in os.listdir(containers_folder):
        if fname.endswith(".json"):
            container_name = fname.replace(".json", "")
            with open(os.path.join(containers_folder, fname), "r", encoding="utf-8") as f:
                container = json.load(f)
                for box_name, box in container.items():
                    # Use the id, name, description, and stories as-is from the JSON
                    box_id = box.get("id")
                    if not box_id:
                        continue  # Skip if no id
                    boxes.append({
                        "id": box_id,
                        "name": box.get("name", box_name),
                        "description": box.get("description", ""),
                        "stories": box.get("stories", []),
                        "container": container_name
                    })
    return boxes


def add_boxes_to_vectordb(boxes, vectorstore):
    """
    Add all boxes to the vector DB, storing only story IDs in metadata (as a JSON string).
    """
    box_docs = []
    for box in boxes:
        story_ids = [story["id"] for story in box.get("stories", []) if "id" in story]
        doc = Document(
            page_content=box["description"],
            metadata={
                "id": box["id"],
                "name": box["name"],
                "container": box["container"],
                "story_ids": json.dumps(story_ids),  # <-- Serialize as JSON string
                "type": "box"
            }
        )
        box_docs.append(doc)
    print(f"Adding {len(box_docs)} boxes to vectorstore (with story IDs only)...")
    vectorstore.add_documents(box_docs)
    print("Boxes added to vectorstore.")

def get_frontend_boxes(containers_folder="containers"):
    """
    Load all boxes from the frontend.json container file.
    Returns a list of box dicts.
    """
    frontend_file = os.path.join(containers_folder, "frontend.json")
    if not os.path.isfile(frontend_file):
        print("frontend.json not found in containers folder.")
        return []
    with open(frontend_file, "r", encoding="utf-8") as f:
        container = json.load(f)
        # Each value in the dict is a box
        return [box for box in container.values()]

def save_screens_to_json(screens, filename="screens.json"):
    """
    Serialize and save the screens to a JSON file.
    """
    screens_dict = {name: screen.to_dict() for name, screen in screens.items()}
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(screens_dict, f, indent=2)
    print(f"Screens saved to {filename}")

def load_screens_from_json(filename="screens.json"):
    """
    Load screens from a JSON file and return a dict of Screen objects.
    """
    from llm_tools.stories_to_box_tools import Screen  # Import your Screen class
    screens = {}
    if os.path.isfile(filename):
        with open(filename, "r", encoding="utf-8") as f:
            screens_dict = json.load(f)
            for name, data in screens_dict.items():
                screen = Screen(name, data.get("description", ""))
                for box in data.get("boxes", []):
                    screen.add_box(box)
                screens[name] = screen
    return screens

def add_screens_to_vectordb(screens, vectorstore):
    """
    Add all screens to the vector DB, storing box IDs in metadata as a JSON string.
    """
    screen_docs = []
    for screen in screens.values():
        box_ids = [box["id"] for box in screen.boxes]
        doc = Document(
            page_content=screen.description,
            metadata={
                "name": screen.name,
                "boxes": json.dumps(box_ids),  # <-- Serialize as JSON string
                "type": "screen"
            }
        )
        screen_docs.append(doc)
    print(f"Adding {len(screen_docs)} screens to vectorstore...")
    vectorstore.add_documents(screen_docs)
    print("Screens added to vectorstore.")


def serialize_screen(screen, component_instances):
    return {
        "id": screen.id,
        "name": screen.name,
        "description": screen.description,
        "component_instance_ids": screen.component_instance_ids,
        "components": [
            {
                "id": instance.id,
                "type_id": instance.type_id,
                "props": instance.props,
                "usage_count": instance.usage_count
            }
            for instance_id in screen.component_instance_ids
            if (instance := component_instances.get(instance_id))
        ]
    }

def serialize_component_type(component_type):
    return {
        "id": component_type.id,
        "name": component_type.name,
        "description": component_type.description,
        "supported_props": component_type.supported_props
    }

def serialize_component_instance(instance):
    return {
        "id": instance.id,
        "type_id": instance.type_id,
        "props": instance.props,
        "usage_count": instance.usage_count
    }

def save_ui_state_to_json(screens, component_types, component_instances):
    # Serialize screens
    screens_json = [
        serialize_screen(screen, component_instances)
        for screen in screens.values()
    ]
    with open("screens.json", "w", encoding="utf-8") as f:
        json.dump(screens_json, f, indent=2)

    # Serialize component types
    component_types_json = [
        serialize_component_type(ct)
        for ct in component_types.values()
    ]
    with open("component_types.json", "w", encoding="utf-8") as f:
        json.dump(component_types_json, f, indent=2)

    # Serialize component instances
    component_instances_json = [
        serialize_component_instance(inst)
        for inst in component_instances.values()
    ]
    with open("component_instances.json", "w", encoding="utf-8") as f:
        json.dump(component_instances_json, f, indent=2)

def safe_parse_props(props):
    if isinstance(props, dict):
        return props
    if isinstance(props, str):
        try:
            result = ast.literal_eval(props)
            if isinstance(result, dict):
                return result
            raise ValueError("Parsed props string is not a dict")
        except Exception as e:
            raise ValueError(f"Could not parse props string as dict: {e}")
    raise ValueError("props must be a dict or a string representing a dict")

def safe_parse_supported_props(supported_props):
    if isinstance(supported_props, list):
        return supported_props
    if isinstance(supported_props, str):
        try:
            result = ast.literal_eval(supported_props)
            if isinstance(result, list):
                return result
            raise ValueError("Parsed supported_props string is not a list")
        except Exception as e:
            raise ValueError(f"Could not parse supported_props string as list: {e}")
    raise ValueError("supported_props must be a list or a string representing a list")


def save_dict_to_file(data, filename):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def load_dict_from_file(filename):
    if os.path.exists(filename):
        with open(filename, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}