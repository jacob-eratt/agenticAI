# --- Standard Library ---
import json
import os

# --- Third-party ---
from langchain.tools import StructuredTool
from langchain.memory import ConversationBufferMemory
from langchain_google_genai import ChatGoogleGenerativeAI
import google.api_core.exceptions

# --- Local ---
from llm_utils import call_agent, build_prompt, escape_curly_braces, extract_json_from_llm, save_dict_to_file, load_dict_from_file
from pydantic_models import *
from prompts.ui_componenet_creation_prompts import trace_generation_with_sub_agent_instructions, sub_agent_tool_instructions
from llm_tools.flow_decomp_tools import (
    get_component_types,
    get_component_type_details,
    add_component_type,
    edit_component_type,
    delete_component_type,
    add_component_instance,
    edit_component_instance,
    delete_component_instance,
    add_screen,
    edit_screen,
    delete_screen,
    add_component_instance_to_screen,
    remove_component_instance_from_screen,
    get_screens,
    get_component_type_usage,
    get_screen_full_details,
    batch_add_component_instances_to_screen,
    batch_increment_instance_usage,
    batch_delete_component_instances,
    increment_instance_usage
)

LLM_FOR_FLOW_DECOMP = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)

# --- Class Structures ---
component_types = {}         # type_id -> ComponentType
component_instances = {}     # instance_id -> ComponentInstance
screens = {}                 # screen_id -> Screen

# === StructuredTool Wrappers ===

# --- Component Type Tools ---
get_component_types_tool = StructuredTool.from_function(
    name="get_component_types",
    description="Get a list of all component types. No parameters required.",
    args_schema=None,
    func=lambda: get_component_types(component_types)
)

get_component_type_details_tool = StructuredTool.from_function(
    name="get_component_type_details",
    description=(
        "Get details for a specific component type. "
        "Parameters:\n"
        "- type_id (str): The ID of the component type."
    ),
    args_schema=GetComponentTypeDetailsInput,
    func=lambda type_id: get_component_type_details(type_id, component_types)
)

add_component_type_tool = StructuredTool.from_function(
    name="add_component_type",
    description=(
        "Create a new reusable component type (e.g., Button, Panel) with supported props.\n"
        "Parameters:\n"
        "- name (str): Name of the component type.\n"
        "- description (str): Description of the component type.\n"
        "- supported_props (list or string): List of supported property names for this component type. "
        "You can provide this as a Python list (preferred, e.g., ['label', 'icon']) or as a string that looks like a Python list (e.g., \"['label', 'icon']\").\n"
        "Example: {'name': 'Button', 'description': 'A clickable button', 'supported_props': ['label', 'icon']}"
    ),
    args_schema=AddComponentTypeInput,
    func=lambda name, description, supported_props: add_component_type(name, description, supported_props, component_types)
)

edit_component_type_tool = StructuredTool.from_function(
    name="edit_component_type",
    description=(
        "Edit the name, description, or supported props of an existing component type.\n"
        "Parameters:\n"
        "- type_id (str): The ID of the component type to edit.\n"
        "- new_name (str, optional): New name for the component type.\n"
        "- new_description (str, optional): New description.\n"
        "- new_supported_props (list or string, optional): New supported property names. "
        "You can provide this as a Python list (preferred, e.g., ['label', 'icon']) or as a string that looks like a Python list (e.g., \"['label', 'icon']\").\n"
        "Example: {'type_id': 'abc123', 'new_supported_props': ['label', 'icon']}"
    ),
    args_schema=EditComponentTypeInput,
    func=lambda type_id, new_name=None, new_description=None, new_supported_props=None: edit_component_type(
        type_id, new_name, new_description, new_supported_props, component_types)
)

delete_component_type_tool = StructuredTool.from_function(
    name="delete_component_type",
    description=(
        "Delete a component type. Returns a list of affected component instance IDs.\n"
        "Parameters:\n"
        "- type_id (str): The ID of the component type to delete."
    ),
    args_schema=DeleteComponentTypeInput,
    func=lambda type_id: delete_component_type(type_id, component_types, component_instances)
)

get_component_type_usage_tool = StructuredTool.from_function(
    name="get_component_type_usage",
    description=(
        "Get the number of times a component type is used across all instances.\n"
        "Parameters:\n"
        "- type_id (str): The ID of the component type."
    ),
    args_schema=GetComponentTypeUsageInput,
    func=lambda type_id: get_component_type_usage(type_id, component_instances)
)

# --- Component Instance Tools ---
add_component_instance_tool = StructuredTool.from_function(
    name="add_component_instance",
    description=(
        "Create a new component instance from a component type, with specific props.\n"
        "Parameters:\n"
        "- type_id (str): The ID of the component type to instantiate.\n"
        "- props (dict or string): Properties for this instance. "
        "You can provide this as a Python dictionary (preferred, e.g., {'label': 'Save', 'icon': 'save_icon'}) or as a string that looks like a Python dictionary (e.g., \"{'label': 'Save', 'icon': 'save_icon'}\").\n"
        "Example: {'type_id': 'abc123', 'props': {'label': 'Save', 'icon': 'save_icon'}}"
    ),
    args_schema=AddComponentInstanceInput,
    func=lambda type_id, props: add_component_instance(type_id, props, component_instances)
)

edit_component_instance_tool = StructuredTool.from_function(
    name="edit_component_instance",
    description=(
        "Edit the props of a component instance.\n"
        "Parameters:\n"
        "- instance_id (str): The ID of the component instance to edit.\n"
        "- new_props (dict or string, optional): New properties for the instance. "
        "You can provide this as a Python dictionary (preferred, e.g., {'label': 'Submit', 'icon': 'submit_icon'}) or as a string that looks like a Python dictionary (e.g., \"{'label': 'Submit', 'icon': 'submit_icon'}\").\n"
        "Example: {'instance_id': 'xyz789', 'new_props': {'label': 'Submit', 'icon': 'submit_icon'}}"
    ),
    args_schema=EditComponentInstanceInput,
    func=lambda instance_id, new_props=None: edit_component_instance(instance_id, new_props, component_instances)
)

delete_component_instance_tool = StructuredTool.from_function(
    name="delete_component_instance",
    description=(
        "Delete a component instance and remove it from all screens.\n"
        "Parameters:\n"
        "- instance_id (str): The ID of the component instance to delete."
    ),
    args_schema=DeleteComponentInstanceInput,
    func=lambda instance_id: delete_component_instance(instance_id, component_instances, screens)
)

increment_instance_usage_tool = StructuredTool.from_function(
    name="increment_instance_usage",
    description=(
        "Increment the usage count for a specific component instance.\n"
        "Parameters:\n"
        "- instance_id (str): The ID of the component instance."
    ),
    args_schema=IncrementInstanceUsageInput,
    func=lambda instance_id: increment_instance_usage(instance_id, component_instances)
)

get_components_tool = StructuredTool.from_function(
    name="get_components",
    description="Get a list of all component instances. No parameters required.",
    args_schema=None,
    func=lambda: get_components(component_instances)
)

# --- Screen Tools ---
add_screen_tool = StructuredTool.from_function(
    name="add_screen",
    description=(
        "Create a new screen.\n"
        "Parameters:\n"
        "- name (str): Name of the screen.\n"
        "- description (str): Description of the screen."
    ),
    args_schema=AddScreenInput,
    func=lambda name, description: add_screen(name, description, screens)
)

edit_screen_tool = StructuredTool.from_function(
    name="edit_screen",
    description=(
        "Edit the name or description of a screen.\n"
        "Parameters:\n"
        "- screen_id (str): The ID of the screen to edit.\n"
        "- new_name (str, optional): New name for the screen.\n"
        "- new_description (str, optional): New description."
    ),
    args_schema=EditScreenInput,
    func=lambda screen_id, new_name=None, new_description=None: edit_screen(screen_id, new_name, new_description, screens)
)

delete_screen_tool = StructuredTool.from_function(
    name="delete_screen",
    description=(
        "Delete a screen. Returns the component instance IDs that were on it.\n"
        "Parameters:\n"
        "- screen_id (str): The ID of the screen to delete."
    ),
    args_schema=DeleteScreenInput,
    func=lambda screen_id: delete_screen(screen_id, screens)
)

add_component_instance_to_screen_tool = StructuredTool.from_function(
    name="add_component_instance_to_screen",
    description=(
        "Add a component instance to a screen.\n"
        "Parameters:\n"
        "- screen_id (str): The ID of the screen.\n"
        "- instance_id (str): The ID of the component instance to add."
    ),
    args_schema=AddComponentInstanceToScreenInput,
    func=lambda screen_id, instance_id: add_component_instance_to_screen(screen_id, instance_id, screens)
)

remove_component_instance_from_screen_tool = StructuredTool.from_function(
    name="remove_component_instance_from_screen",
    description=(
        "Remove a component instance from a screen.\n"
        "Parameters:\n"
        "- screen_id (str): The ID of the screen.\n"
        "- instance_id (str): The ID of the component instance to remove."
    ),
    args_schema=RemoveComponentInstanceFromScreenInput,
    func=lambda screen_id, instance_id: remove_component_instance_from_screen(screen_id, instance_id, screens)
)

get_screens_tool = StructuredTool.from_function(
    name="get_screens",
    description="Get a list of all screens. No parameters required.",
    args_schema=None,
    func=lambda: get_screens(screens)
)

get_screen_full_details_tool = StructuredTool.from_function(
    name="get_screen_full_details",
    description=(
        "Get all details for a specific screen, including its metadata and all component instances on it.\n"
        "Parameters:\n"
        "- screen_id (str): The ID of the screen."
    ),
    args_schema=GetScreenFullDetailsInput,
    func=lambda screen_id: get_screen_full_details(screen_id, screens, component_instances)
)

# --- Utility/Batch Tools ---
batch_add_component_instances_to_screen_tool = StructuredTool.from_function(
    name="batch_add_component_instances_to_screen",
    description=(
        "Add multiple component instances to a screen at once.\n"
        "Parameters:\n"
        "- screen_id (str): The ID of the screen.\n"
        "- instance_ids (list): List of component instance IDs to add."
    ),
    args_schema=BatchAddComponentInstancesToScreenInput,
    func=lambda screen_id, instance_ids: batch_add_component_instances_to_screen(screen_id, instance_ids, screens)
)

batch_increment_instance_usage_tool = StructuredTool.from_function(
    name="batch_increment_instance_usage",
    description=(
        "Increment the usage count for multiple component instances at once.\n"
        "Parameters:\n"
        "- instance_ids (list): List of component instance IDs."
    ),
    args_schema=BatchIncrementInstanceUsageInput,
    func=lambda instance_ids: batch_increment_instance_usage(instance_ids, component_instances)
)

batch_delete_component_instances_tool = StructuredTool.from_function(
    name="batch_delete_component_instances",
    description=(
        "Delete multiple component instances at once and remove them from all screens.\n"
        "Parameters:\n"
        "- instance_ids (list): List of component instance IDs to delete."
    ),
    args_schema=BatchDeleteComponentInstancesInput,
    func=lambda instance_ids: batch_delete_component_instances(instance_ids, component_instances, screens)
)

def get_components(component_instances):
    """
    Returns a list of all component instances.
    """
    return list(component_instances.values())

def serialize_screen(screen):
    return {
        "id": screen.id,
        "name": screen.name,
        "description": screen.description,
        "component_instance_ids": screen.component_instance_ids
    }
def serialize_component_instance(instance):
    return {
        "id": instance.id,
        "type_id": instance.type_id,
        "props": instance.props,
        "usage_count": instance.usage_count
    }

# --- Sub Agent Tool ---
screen_component_tools = [
    # Component Type Tools
    get_component_types_tool,
    get_component_type_details_tool,
    add_component_type_tool,
    edit_component_type_tool,
    delete_component_type_tool,
    get_component_type_usage_tool,
    # Component Instance Tools
    add_component_instance_tool,
    edit_component_instance_tool,
    delete_component_instance_tool,
    increment_instance_usage_tool,
    get_components_tool,
    # Screen Tools
    add_screen_tool,
    edit_screen_tool,
    delete_screen_tool,
    add_component_instance_to_screen_tool,
    remove_component_instance_from_screen_tool,
    get_screens_tool,
    get_screen_full_details_tool,
    # Utility/Batch Tools
    batch_add_component_instances_to_screen_tool,
    batch_increment_instance_usage_tool,
    batch_delete_component_instances_tool,
]

def sub_agent_tool(llm, request: str):
    """
    Receives a request from the main agent, executes the appropriate tools, and returns the result.
    The LLM should include any 'high value' questions in its output.
    """
    input = (
        f"Sub agent request:\n{request}\n\n"
    )
    memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True,
    )
    result = call_agent(
        llm=llm,
        prompt_template=build_prompt(escape_curly_braces(sub_agent_tool_instructions)),
        input_text=input,
        tools=screen_component_tools,
        memory=memory,
        verbose=True
    )
    return result



sub_agent_structured_tool = StructuredTool.from_function(
    name="sub_agent_tool",
    description=(
        "Sub agent that receives a request (as a string), executes the appropriate tools, and returns the result. "
        "Includes a 'high_value_questions' field in the output if applicable."
    ),
    args_schema=None,
    func=lambda request: sub_agent_tool(LLM_FOR_FLOW_DECOMP, request)
)





def extract_capabilities_from_llm_output(llm_output):
    """
    Extracts the sub_agent_capabilities list from the LLM output string or dict.
    Uses extract_json_from_llm for robust parsing.
    """
    try:
        output_json = extract_json_from_llm(llm_output)
        if isinstance(output_json, dict):
            return output_json.get("sub_agent_capabilities", [])
    except Exception as e:
        print(f"Could not extract capabilities: {e}")
    return []

def serialize_all_screens(screens):
    return {k: serialize_screen(v) for k, v in screens.items()}

def serialize_all_component_types(component_types):
    return {k: v.__dict__ for k, v in component_types.items()}

def serialize_all_component_instances(component_instances):
    return {k: serialize_component_instance(v) for k, v in component_instances.items()}

def update_capabilities(existing, new):
    """
    Merge and deduplicate capabilities.
    """
    return list(set(existing) | set(new))

main_agent_tools = [sub_agent_structured_tool]



def decompose_flow_with_llm(user_flows, app_query):
    """
    For each user flow, prompt the LLM to decompose it into screens and components.
    """
    llm_outputs = []
    main_agent_memory = load_dict_from_file("main_agent_memory.json") if os.path.exists("main_agent_memory.json") else {"sub_agent_capabilities": []}
    for idxflow, flow in enumerate(user_flows):
        print(f"\n=== Working on Flow {idxflow}/{len(user_flows)} ===")
        capabilities_str = json.dumps(main_agent_memory.get("sub_agent_capabilities", []), indent=2)
        user_prompt = (
            "Here is the user flow:\n"
            f"{json.dumps(flow, indent=2)}\n\n"
            "Here is the app query describing the main purpose and user flows:\n"
            "Current screens (name and id only):\n"
            f"{json.dumps([{ 'id': s.id, 'name': s.name } for s in screens.values()], indent=2)}\n\n"
            "Known sub-agent capabilities:\n"
            f"{capabilities_str}\n\n"
        )

        print(f"User prompt: {user_prompt}")

        max_attempts = 2
        for attempt in range(max_attempts):
            try:
                memory = ConversationBufferMemory(
                    memory_key="chat_history",
                    return_messages=True,
                )
                result = call_agent(
                    llm=LLM_FOR_FLOW_DECOMP,
                    prompt_template=build_prompt(escape_curly_braces(trace_generation_with_sub_agent_instructions)),
                    input_text=user_prompt,
                    tools=main_agent_tools,
                    memory=memory,
                    verbose=True
                )
                break  # Success, exit retry loop
            except google.api_core.exceptions.InternalServerError as e:
                print(f"InternalServerError on flow {idxflow} (attempt {attempt+1}): {e}")
                if attempt == max_attempts - 1:
                    print(f"Flow {idxflow} failed twice. Skipping.")
                    result = None
            except Exception as e:
                print(f"Unexpected error on flow {idxflow} (attempt {attempt+1}): {e}")
                if attempt == max_attempts - 1:
                    print(f"Flow {idxflow} failed twice. Skipping.")
                    result = None

        if result is None:
            continue  # Skip this flow after two failures


        print(f"LLM result: {result}")
        llm_outputs.append(str(result))

        # Extract and update capabilities, deduplicating
        capabilities = extract_capabilities_from_llm_output(str(result))
        if capabilities:
            main_agent_memory["sub_agent_capabilities"] = update_capabilities(
                main_agent_memory.get("sub_agent_capabilities", []),
                capabilities
            )
            # Persist capabilities after each flow
            save_dict_to_file(main_agent_memory, "main_agent_memory.json")

        # Write each LLM output immediately after processing the flow
        with open("screen_component_llm_outputs.txt", "a", encoding="utf-8") as f:
            f.write(str(result) + "\n\n")

        # Persist app state after each flow
        save_dict_to_file(serialize_all_screens(screens), "screens.json")
        save_dict_to_file(serialize_all_component_types(component_types), "component_types.json")
        save_dict_to_file(serialize_all_component_instances(component_instances), "component_instances.json")


    return screens, component_types, component_instances