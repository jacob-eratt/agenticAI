# --- Imports ---
# Standard Library
import json
import os

# Third-party
from langchain.tools import StructuredTool
from langchain.memory import ConversationBufferMemory
from langchain_google_genai import ChatGoogleGenerativeAI
import google.api_core.exceptions

# Local
from utils.llm_utils import (
    call_agent, build_prompt, escape_curly_braces, extract_json_from_llm,
    save_dict_to_file, load_dict_from_file
)
from utils.pydantic_models import *
from prompts.ui_componenet_creation_prompts import (
    trace_instructions_v3, sub_agent_tool_instructions_v3
)
from llm_tools.flow_decomp_tools import (
    get_component_types, get_component_type_details, add_component_type,
    edit_component_type, delete_component_type, add_component_instance,
    edit_component_instance, delete_component_instance, get_component_instances, add_screen,
    edit_screen, delete_screen, add_component_instance_to_screen,
    remove_component_instance_from_screen, get_screens,
    get_screen_full_details,
    batch_delete_component_instances, increment_instance_usage,
    semantic_search_tool, ask_human_clarification
)

# --- LLM Setup ---
LLM_FOR_FLOW_DECOMP = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)

# --- In-memory Data Stores ---
component_types = {}         # type_id -> ComponentType
component_instances = {}     # instance_id -> ComponentInstance
screens = {}                 # screen_id -> Screen

# ===========================
# === StructuredTool Setup ==
# ===========================

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
        "- supported_props (list of dicts or string): Each supported prop must be a dict with 'name', 'type', and 'description'.\n"
        "You can provide this as a Python list (preferred, e.g., [{'name': 'label', 'type': 'string', 'description': 'Text for button'}]) "
        "or as a string that looks like a Python list (e.g., \"[{'name': 'label', 'type': 'string', 'description': 'Text for button'}]\").\n"
        "Example: {'name': 'Button', 'description': 'A clickable button', 'supported_props': ["
        "{'name': 'label', 'type': 'string', 'description': 'Text displayed on the button.'}, "
        "{'name': 'icon', 'type': 'string', 'description': 'Optional icon for the button.'}]}"
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
        "- new_supported_props (list of dicts or string, optional): Each supported prop must be a dict with 'name', 'type', and 'description'.\n"
        "You can provide this as a Python list (preferred, e.g., [{'name': 'label', 'type': 'string', 'description': 'Text for button'}]) "
        "or as a string that looks like a Python list (e.g., \"[{'name': 'label', 'type': 'string', 'description': 'Text for button'}]\").\n"
        "Example: {'type_id': 'abc123', 'new_supported_props': ["
        "{'name': 'label', 'type': 'string', 'description': 'Text displayed on the button.'}, "
        "{'name': 'icon', 'type': 'string', 'description': 'Optional icon for the button.'}]}"
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
# get_component_type_usage_tool = StructuredTool.from_function(
#     name="get_component_type_usage",
#     description=(
#         "Get the number of times a component type is used across all instances.\n"
#         "Parameters:\n"
#         "- type_id (str): The ID of the component type."
#     ),
#     args_schema=GetComponentTypeUsageInput,
#     func=lambda type_id: get_component_type_usage(type_id, component_instances)
# )

# --- Component Instance Tools ---
add_component_instance_tool = StructuredTool.from_function(
    name="add_component_instance",
    description=(
        "Create a new component instance from a component type, with specific props and add it to a specific screen via id.\n"
        "Parameters:\n"
        "- type_id (str): The ID of the component type to instantiate.\n"
        "- screen_id (str): The ID of the screen to add this instance to.\n"
        "- props (dict or string): Properties for this instance. "
        "You can provide this as a Python dictionary (preferred, e.g., {'label': 'Save', 'icon': 'save_icon'}) or as a string that looks like a Python dictionary (e.g., \"{'label': 'Save', 'icon': 'save_icon'}\").\n"
        "- description (str, optional): Description of the component instance.\n"
        "Example: {'type_id': 'abc123', 'screen_id': 'xyz789', 'props': {'label': 'Save', 'icon': 'save_icon'}, 'description': 'Button to save changes.'}"
    ),
    args_schema=AddComponentInstanceInput,
    func=lambda type_id, props, screen_id, description=None: add_component_instance(
        type_id, props, screen_id, component_instances, screens, description=description
    )
)

edit_component_instance_tool = StructuredTool.from_function(
    name="edit_component_instance",
    description=(
        "Edit the props or description of a component instance.\n"
        "Parameters:\n"
        "- instance_id (str): The ID of the component instance to edit.\n"
        "- new_screen_id (str, optional): The ID of the screen to which this instance is moving to (only fill if moving to a different screen).\n"
        "- new_props (dict or string, optional): New properties for the instance. "
        "You can provide this as a Python dictionary (preferred, e.g., {'label': 'Submit', 'icon': 'submit_icon'}) or as a string that looks like a Python dictionary (e.g., \"{'label': 'Submit', 'icon': 'submit_icon'}\").\n"
        "- new_description (str, optional): New description for the component instance.\n"
        "Example: {'instance_id': 'xyz789', 'new_props': {'label': 'Submit', 'icon': 'submit_icon'}, 'new_description': 'Button to submit form.'}"
    ),
    args_schema=EditComponentInstanceInput,
    func=lambda instance_id, new_props=None, new_screen_id=None, new_description=None: edit_component_instance(
        instance_id, new_props, new_screen_id, new_description, component_instances
    )
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
get_component_instances_tool = StructuredTool.from_function(
    name="get_component_instances",
    description="Get a list of all component instances. No parameters required.",
    args_schema=None,
    func=lambda: [serialize_component_instance(v) for v in component_instances.values()]
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
    func=lambda screen_id: delete_screen(screen_id, screens, component_instances)
)
add_component_instance_to_screen_tool = StructuredTool.from_function(
    name="add_component_instance_to_screen",
    description=(
        "Add an existing component instance to a screen.\n"
        "Parameters:\n"
        "- screen_id (str): The ID of the screen.\n"
        "- instance_id (str): The ID of the component instance to add."
    ),
    args_schema=AddComponentInstanceToScreenInput,
    func=lambda screen_id, instance_id: add_component_instance_to_screen(screen_id, instance_id, screens, component_instances)
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
    func=lambda screen_id, instance_id: remove_component_instance_from_screen(screen_id, instance_id, screens, component_instances)
)
get_screens_tool = StructuredTool.from_function(
    name="get_screens",
    description="Get a list of all screens. No parameters required. Always ensure that there are no redundant screens.",
    args_schema=None,
    func=lambda: get_screens(screens)
)

get_screen_full_details_tool = StructuredTool.from_function(
    name="get_screen_full_details",
    description="Get all details for a specific screen by its ID, including its metadata and all component instances on it. Parameters: screen_id. Always double check that there are no redundant component instances.",
    args_schema=GetScreenFullDetailsInput,
    func=lambda screen_id: get_screen_full_details(screen_id, screens, component_instances)
)

# --- Utility/Batch Tools ---
# batch_add_component_instances_to_screen_tool = ...existing code...
# batch_increment_instance_usage_tool = ...existing code...
batch_delete_component_instances_tool = StructuredTool.from_function(
    name="batch_delete_component_instances",
    description="Delete multiple component instances at once and remove them from all screens.",
    args_schema=BatchDeleteComponentInstancesInput,
    func=lambda instance_ids: batch_delete_component_instances(instance_ids, component_instances, screens)
)
semantic_search_structured_tool = StructuredTool.from_function(
    func=lambda query, filter_key=None, filter_value=None, k=5: semantic_search_tool(
        query, filter_key, filter_value, vectorstore_name="pipeline_parts", k=k
    ),
    name="semantic_search_tool",
    description="Performs a semantic search in the vectorstore with an optional metadata filter. "
        "Valid filter keys: id, name, type_id, supported_props, component_instance_ids, props, category. "
        "Use 'category' to filter for 'screen', 'component_type', or 'component_instance'. "
        "Returns matching items' metadata.",
    args_schema=SemanticSearchInput
)

ask_human_clarification_tool = StructuredTool.from_function(
    name="ask_human_clarification",
    description=(
        "Ask the human user for clarification about a specific point. "
        "Only use this tool if you need more information to proceed. "
        "Do not use for new changes or actions."
    ),
    args_schema=AskHumanClarificationInput,
    func=lambda question: ask_human_clarification(question)
)



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
        "description": instance.description  # <-- Add description here
    }

# ===========================
# === Sub Agent Tool Setup ===
# ===========================

screen_component_tools = [
    # Component Type Tools
    get_component_types_tool,
    get_component_type_details_tool,
        # Component Instance Tools

    get_component_instances_tool,
    # Screen Tools
 
    get_screens_tool,
    get_screen_full_details_tool,
    # Utility/Batch Tools
    # batch_add_component_instances_to_screen_tool,
    # batch_increment_instance_usage_tool,

    semantic_search_structured_tool
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
        prompt_template=build_prompt(escape_curly_braces(sub_agent_tool_instructions_v3)),
        input_text=input,
        tools=screen_component_tools,
        memory=memory,
        verbose=True
    )
    return result

sub_agent_structured_tool = StructuredTool.from_function(
    name="sub_agent_tool",
    description=(
        "Sub agent for high-level data gathering, summarization, semantic analysis, navigation/pathfinding, "
        "redundancy/orphan detection, usage mapping, and validation. "
        "Receives a request, executes the appropriate tools, and returns actionable results. "
        "Use this tool to batch summarize screens/components, analyze overlap and merge candidates, "
        "map navigation paths, detect orphans, report usage, and validate app structure. "
        "Does NOT perform any direct state mutation or CRUD operations."
    ),
    args_schema=None,
    func=lambda request: sub_agent_tool(LLM_FOR_FLOW_DECOMP, request)
)

main_agent_tools = [sub_agent_structured_tool,  
    # Component Type Tools                   
    add_component_type_tool,
    edit_component_type_tool,
    delete_component_type_tool,
    # Component Instance Tools
    add_component_instance_tool,
    edit_component_instance_tool,
    delete_component_instance_tool,
    # Screen Tools
    add_screen_tool,
    edit_screen_tool,
    delete_screen_tool,
    add_component_instance_to_screen_tool,
    remove_component_instance_from_screen_tool,
    batch_delete_component_instances_tool,
]

# ===========================
# === Serialization Utils ===
# ===========================

def extract_capabilities_from_llm_output(llm_output):
    """Extracts the sub_agent_capabilities list from the LLM output string or dict."""
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
    """Merge and deduplicate capabilities."""
    return list(set(existing) | set(new))

# ===========================
# === Main Agent Function ===
# ===========================

def test_llm_component_type_and_instance_flow():
    # 1. Create a new component type with prop descriptions
    prompt_create_type = (
        "Create a new component type named 'TestButton' with description 'A test button for validation.' "
        "Supported props should be: "
        "[{'name': 'label', 'type': 'string', 'description': 'Text for the button.'}, "
        "{'name': 'onClick', 'type': 'function', 'description': 'Callback for button click.'}] "
        "Use the add_component_type tool."
    )
    result_create_type = call_agent(
        llm=LLM_FOR_FLOW_DECOMP,
        prompt_template=build_prompt(escape_curly_braces(trace_instructions_v3)),
        input_text=prompt_create_type,
        tools=[add_component_type_tool],
        memory=ConversationBufferMemory(memory_key="chat_history", return_messages=True),
        verbose=True
    )
    print("Create component type result:", result_create_type)

    # 2. Edit the component type to add a new prop
    prompt_edit_type = (
        "Edit the 'TestButton' component type to add a new supported prop: "
        "{'name': 'icon', 'type': 'string', 'description': 'Optional icon for the button.'} "
        "Use the edit_component_type tool."
    )
    result_edit_type = call_agent(
        llm=LLM_FOR_FLOW_DECOMP,
        prompt_template=build_prompt(escape_curly_braces(trace_instructions_v3)),
        input_text=prompt_edit_type,
        tools=[edit_component_type_tool, get_component_types_tool],
        memory=ConversationBufferMemory(memory_key="chat_history", return_messages=True),
        verbose=True
    )
    print("Edit component type result:", result_edit_type)

    # 3. Try to create a component instance with valid props
    prompt_create_instance_valid = (
        "Create a new component instance of type 'TestButton' on screen 'TestScreen' "
        "with props: {'label': 'Click Me', 'onClick': 'handleClick', 'icon': 'star'} "
        "and description 'A valid test button instance.' Use the add_component_instance tool."
    )
    result_create_instance_valid = call_agent(
        llm=LLM_FOR_FLOW_DECOMP,
        prompt_template=build_prompt(escape_curly_braces(trace_instructions_v3)),
        input_text=prompt_create_instance_valid,
        tools=[add_component_instance_tool, get_component_types_tool, get_screens_tool],
        memory=ConversationBufferMemory(memory_key="chat_history", return_messages=True),
        verbose=True
    )
    print("Create valid component instance result:", result_create_instance_valid)

    # 4. Try to create a component instance with an invalid prop
    prompt_create_instance_invalid = (
        "Create a new component instance of type 'TestButton' on screen 'TestScreen' "
        "with props: {'label': 'Invalid', 'onClick': 'handleClick', 'bogusProp': 'bad'} "
        "and description 'Should fail due to invalid prop.' Use the add_component_instance tool."
    )
    result_create_instance_invalid = call_agent(
        llm=LLM_FOR_FLOW_DECOMP,
        prompt_template=build_prompt(escape_curly_braces(trace_instructions_v3)),
        input_text=prompt_create_instance_invalid,
        tools=[add_component_instance_tool, get_component_types_tool, get_screens_tool],
        memory=ConversationBufferMemory(memory_key="chat_history", return_messages=True),
        verbose=True
    )
    print("Create invalid component instance result:", result_create_instance_invalid)

    # 5. Delete the component type and check affected instances
    prompt_delete_type = (
        "Delete the 'TestButton' component type using the delete_component_type tool. "
        "List affected component instance IDs."
    )
    result_delete_type = call_agent(
        llm=LLM_FOR_FLOW_DECOMP,
        prompt_template=build_prompt(escape_curly_braces(trace_instructions_v3)),
        input_text=prompt_delete_type,
        tools=[delete_component_type_tool, get_component_types_tool, get_component_instances_tool],
        memory=ConversationBufferMemory(memory_key="chat_history", return_messages=True),
        verbose=True
    )
    print("Delete component type result:", result_delete_type)


def decompose_flow_with_llm(user_flows, app_query):
    """
    For each user flow, prompt the LLM to decompose it into screens and components.
    """
    #test_llm_component_type_and_instance_flow()  # For testing purposes
    llm_outputs = []
    approved_screen_names_file = "screen_names_to_keep.json"
    with open(approved_screen_names_file, "r", encoding="utf-8") as f:
        approved_screen_names = json.load(f)
    #main_agent_memory = load_dict_from_file("main_agent_memory.json") if os.path.exists("main_agent_memory.json") else {"sub_agent_capabilities": []}
    for idxflow, flow in enumerate(user_flows):
        print(f"\n=== Working on Flow {idxflow}/{len(user_flows)} ===")
        user_prompt = (
            "Here is the user flow:\n"
            f"{json.dumps(flow, indent=2)}\n\n"
            "Here is the app query describing the main purpose and user flows:\n"
            f"{app_query}\n\n"
            "Current screens (full details):\n"
            f"{json.dumps([serialize_screen(s) for s in screens.values()], indent=2)}\n\n"
            "Current component types (full details):\n"
            f"{json.dumps([ct.__dict__ for ct in component_types.values()], indent=2)}\n\n"
            "APPROVED SCREEN NAMES:\n"
            f"{json.dumps(approved_screen_names, indent=2)}\n"
            "Try to stay within these bounds and reuse these screens as much as possible.\n"
            "Only propose new screens if absolutely necessary and justify their creation."
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
                    prompt_template=build_prompt(escape_curly_braces(trace_instructions_v3)),
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
            except google.api_core.exceptions.ServiceUnavailable as e:
                print(f"ServiceUnavailable (503) on flow {idxflow} (attempt {attempt+1}): {e}")
                if attempt == max_attempts - 1:
                    print(f"Flow {idxflow} failed twice due to ServiceUnavailable. Skipping.")
                    result = None

        if result is None:
            continue  # Skip this flow after two failures

        print(f"LLM result: {result}")
        llm_outputs.append(str(result))


        with open("screen_component_llm_outputs.txt", "a", encoding="utf-8") as f:
            f.write(str(result) + "\n\n")

        # Persist app state after each flow
        save_dict_to_file(serialize_all_screens(screens), "screen_original.json")
        save_dict_to_file(serialize_all_component_types(component_types), "component_types_original.json")
        save_dict_to_file(serialize_all_component_instances(component_instances), "component_instances_original.json")

    post_generation_user_agent(app_query)

    return screens, component_types, component_instances


def post_generation_user_agent(app_query):
    """
    Interactive loop for post-generation UI editing.
    Prompts the user for changes, applies them, and persists state.
    """
    print("\n--- Post-generation UI Editing ---")
    print("You can add, edit, or delete screens, component types, or component instances.")
    print("Type 'done' when you are satisfied with the UI.")

    while True:
        user_request = input("\nWhat would you like to add, edit, or delete? (or type 'done' to finish): ")
        if user_request.strip().lower() == "done":
            print("Post-generation editing complete.")
            break

        # Build prompt for main agent
        user_prompt = (
            "USER REQUEST:\n"
            f"{user_request}\n\n"
            "Here is the app query describing the main purpose and user flows:\n"
            f"{app_query}\n\n"
            "Current screens (name and id only):\n"
            f"{json.dumps([{ 'id': s.id, 'name': s.name } for s in screens.values()], indent=2)}\n\n"
            "Current component types:\n"
            f"{json.dumps([{ 'id': ct.id, 'name': ct.name } for ct in component_types.values()], indent=2)}\n\n"
            "Current component instances:\n"
            f"{json.dumps([{ 'id': ci.id, 'type_id': ci.type_id } for ci in component_instances.values()], indent=2)}\n"
        )

        memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
        result = call_agent(
            llm=LLM_FOR_FLOW_DECOMP,
            prompt_template=build_prompt(escape_curly_braces(trace_instructions_v3)),
            input_text=user_prompt,
            tools=main_agent_tools + [ask_human_clarification_tool],
            memory=memory,
            verbose=True
        )
        print(f"\nAgent result:\n{result}")

        # Persist app state after each change
        save_dict_to_file(serialize_all_screens(screens), "screens_human_altered.json")
        save_dict_to_file(serialize_all_component_types(component_types), "component_types_human_altered.json")
        save_dict_to_file(serialize_all_component_instances(component_instances), "component_instances_human_altered.json")

# After your flow decomposition, call:
# screens, component_types, component_instances = decompose_flow_with_llm(user_flows, app_query)
# post_generation_user_agent(app_query, screens, component_types, component_instances)