from langchain.tools import StructuredTool

import json
from langchain.memory import ConversationBufferMemory
from langchain.tools import StructuredTool
from llm_utils import call_agent, build_prompt, escape_curly_braces, extract_json_from_llm
from pydantic_models import *
from prompts.ui_componenet_creation_prompts import flow_to_screen_conversion_instructions
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
    get_screen_contents,
    get_component_type_usage,
    get_screen_details,
    increment_instance_usage
)

import uuid

# --- Class Structures ---
component_types = {}         # type_id -> ComponentType
component_instances = {}     # instance_id -> ComponentInstance
screens = {}                 # screen_id -> Scree

# --- StructuredTool Wrappers ---

get_component_types_tool = StructuredTool.from_function(
    name="get_component_types",
    description="Get a list of all component types.",
    args_schema=None,  # No arguments needed
    func=lambda: get_component_types(component_types)
)

get_component_type_details_tool = StructuredTool.from_function(
    name="get_component_type_details",
    description="Get details for a specific component type.",
    args_schema=GetComponentTypeDetailsInput,
    func=lambda type_id: get_component_type_details(type_id, component_types)
)

add_component_type_tool = StructuredTool.from_function(
    name="add_component_type",
    description="Create a new reusable component type (e.g., Button, Panel) with supported props.",
    args_schema=AddComponentTypeInput,
    func=lambda name, description, supported_props: add_component_type(name, description, supported_props, component_types)
)

edit_component_type_tool = StructuredTool.from_function(
    name="edit_component_type",
    description="Edit the name, description, or supported props of an existing component type.",
    args_schema=EditComponentTypeInput,
    func=lambda type_id, new_name=None, new_description=None, new_supported_props=None: edit_component_type(
        type_id, new_name, new_description, new_supported_props, component_types)
)

delete_component_type_tool = StructuredTool.from_function(
    name="delete_component_type",
    description="Delete a component type. Returns a list of affected component instance IDs.",
    args_schema=DeleteComponentTypeInput,
    func=lambda type_id: delete_component_type(type_id, component_types, component_instances)
)

add_component_instance_tool = StructuredTool.from_function(
    name="add_component_instance",
    description="Create a new component instance from a component type, with specific props.",
    args_schema=AddComponentInstanceInput,
    func=lambda type_id, props: add_component_instance(type_id, props, component_instances)
)

edit_component_instance_tool = StructuredTool.from_function(
    name="edit_component_instance",
    description="Edit the props of a component instance.",
    args_schema=EditComponentInstanceInput,
    func=lambda instance_id, new_props=None: edit_component_instance(instance_id, new_props, component_instances)
)

delete_component_instance_tool = StructuredTool.from_function(
    name="delete_component_instance",
    description="Delete a component instance and remove it from all screens.",
    args_schema=DeleteComponentInstanceInput,
    func=lambda instance_id: delete_component_instance(instance_id, component_instances, screens)
)

add_screen_tool = StructuredTool.from_function(
    name="add_screen",
    description="Create a new screen.",
    args_schema=AddScreenInput,
    func=lambda name, description: add_screen(name, description, screens)
)

edit_screen_tool = StructuredTool.from_function(
    name="edit_screen",
    description="Edit the name or description of a screen.",
    args_schema=EditScreenInput,
    func=lambda screen_id, new_name=None, new_description=None: edit_screen(screen_id, new_name, new_description, screens)
)

delete_screen_tool = StructuredTool.from_function(
    name="delete_screen",
    description="Delete a screen. Returns the component instance IDs that were on it.",
    args_schema=DeleteScreenInput,
    func=lambda screen_id: delete_screen(screen_id, screens)
)

add_component_instance_to_screen_tool = StructuredTool.from_function(
    name="add_component_instance_to_screen",
    description="Add a component instance to a screen.",
    args_schema=AddComponentInstanceToScreenInput,
    func=lambda screen_id, instance_id: add_component_instance_to_screen(screen_id, instance_id, screens)
)

remove_component_instance_from_screen_tool = StructuredTool.from_function(
    name="remove_component_instance_from_screen",
    description="Remove a component instance from a screen.",
    args_schema=RemoveComponentInstanceFromScreenInput,
    func=lambda screen_id, instance_id: remove_component_instance_from_screen(screen_id, instance_id, screens)
)

get_screens_tool = StructuredTool.from_function(
    name="get_screens",
    description="Get a list of all screens.",
    args_schema=None,
    func=lambda: get_screens(screens)
)

get_screen_contents_tool = StructuredTool.from_function(
    name="get_screen_contents",
    description="Get all component instances on a given screen.",
    args_schema=GetScreenContentsInput,
    func=lambda screen_id: get_screen_contents(screen_id, screens, component_instances)
)

get_component_type_usage_tool = StructuredTool.from_function(
    name="get_component_type_usage",
    description="Get the number of times a component type is used across all instances.",
    args_schema=GetComponentTypeUsageInput,
    func=lambda type_id: get_component_type_usage(type_id, component_instances)
)

get_screen_details_tool = StructuredTool.from_function(
    name="get_screen_details",
    description="Get details for a specific screen.",
    args_schema=GetScreenDetailsInput,
    func=lambda screen_id: get_screen_details(screen_id, screens)
)

get_component_type_details_tool = StructuredTool.from_function(
    name="get_component_type_details",
    description="Get details for a specific component type.",
    args_schema=GetComponentTypeDetailsInput,
    func=lambda type_id: get_component_type_details(type_id, component_types)
)

increment_instance_usage_tool = StructuredTool.from_function(
    name="increment_instance_usage",
    description="Increment the usage count for a specific component instance.",
    args_schema=IncrementInstanceUsageInput,
    func=lambda instance_id: increment_instance_usage(instance_id, component_instances)
)

def get_components(component_instances):
    """
    Returns a list of all component instances.
    """
    return list(component_instances.values())

get_components_tool = StructuredTool.from_function(
    name="get_components",
    description="Get a list of all component instances.",
    args_schema=None,
    func=lambda: get_components(component_instances)
)

screen_component_tools = [
    get_component_types_tool,
    get_component_type_details_tool,
    add_component_type_tool,
    edit_component_type_tool,
    add_component_instance_tool,
    edit_component_instance_tool,
    delete_component_instance_tool,
    add_screen_tool,
    edit_screen_tool,
    delete_screen_tool,
    add_component_instance_to_screen_tool,
    remove_component_instance_from_screen_tool,
    get_screens_tool,
    get_screen_contents_tool,
    get_component_type_usage_tool,
    get_screen_details_tool,
    increment_instance_usage_tool,
    get_components_tool,
]

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

def decompose_flow_with_llm(llm, user_flows, app_query):
    """
    For each user flow, prompt the LLM to decompose it into screens and components.
    """
    llm_outputs = []
    for flow in user_flows:
        user_prompt = (
            "Here is the user flow:\n"
            f"{json.dumps(flow, indent=2)}\n\n"
            "Here is the app query describing the main purpose and user flows:\n"
            f"{app_query}\n\n"
            "Current screens:\n"
            f"{json.dumps([serialize_screen(s) for s in get_screens(screens)], indent=2)}\n\n"
        )

        print(f"User prompt: {user_prompt}")

        memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True,
        )

        result = call_agent(
            llm=llm,
            prompt_template=build_prompt(escape_curly_braces(flow_to_screen_conversion_instructions)),
            input_text=user_prompt,
            tools=screen_component_tools,
            memory=memory,
            verbose=True
        )

        print(f"LLM result: {result}")
        llm_outputs.append(str(result))
        # Write each LLM output immediately after processing the flow
        with open("screen_component_llm_outputs.txt", "a", encoding="utf-8") as f:
            f.write(str(result) + "\n\n")
        # Optionally, extract the output report JSON from the LLM result

    return screens, component_types, component_instances