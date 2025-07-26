import uuid
from llm_tools.stories_to_box_tools import *
from langchain.tools import Tool, StructuredTool
from functools import partial
from llm_utils import call_agent, build_prompt, escape_curly_braces, extract_json, extract_json_from_llm
from prompts.ui_componenet_creation_prompts import story_clustering_instructions
import json
from langchain.memory import ConversationBufferMemory
from pydantic_models import *


# In-memory store for boxes
containers = {
    "frontend": {},
    "backend": {},
    "shared": {},
    "infrastructure": {}
}


add_story_to_box_tool = StructuredTool.from_function(
    name="add_story_to_frontend_box",
    description="Add a user story to a frontend UI component box using its story_id. The story will be retrieved from the vectorstore using the story_id.",
    args_schema=AddStoryToBoxInput,
    func=lambda story_id, box_name, box_description, container_name: add_story_to_box(
        story_id, box_name, box_description, container_name, containers
    ),
)


move_story_between_boxes_tool = StructuredTool.from_function(
    name="move_story_between_boxes",
    description="Move a user story from one UI component box to another.",
    args_schema=MoveStoryBetweenBoxesInput,
    func=lambda story_id, from_box_name, to_box_name: move_story_between_boxes(
        story_id, from_box_name, to_box_name, containers
    ),
)

merge_boxes_tool = StructuredTool.from_function(
    name="merge_boxes",
    description="Merge multiple UI component boxes into a new box, consolidating their stories.",
    args_schema=MergeBoxesInput,
    func=lambda box_names, new_box_name, new_box_description: merge_boxes(
        box_names, new_box_name, new_box_description, containers
    ),
)

get_box_names_tool = StructuredTool.from_function(
    name="get_box_names",
    description="Return a list of all UI component box names.",
    args_schema=EmptyInput,
    func=lambda: get_box_names(containers)
)

get_box_details_tool = StructuredTool.from_function(
    name="get_box_details",
    description="Return details for a single UI component box by name.",
    args_schema=GetBoxDetailsInput,
    func=lambda box_name: get_box_details(box_name, containers)
)

rename_box_tool = StructuredTool.from_function(
    name="rename_box",
    description="Rename an existing UI component box.",
    args_schema=RenameBoxInput,
    func=lambda old_name, new_name: rename_box(old_name, new_name, containers)
)

delete_box_tool = StructuredTool.from_function(
    name="delete_box",
    description="Delete a UI component box by name.",
    args_schema=DeleteBoxInput,
    func=lambda box_name: delete_box(box_name, containers)
)

edit_box_description_tool = StructuredTool.from_function(
    name="edit_box_description",
    description="Edit the description of a UI component box.",
    args_schema=EditBoxDescriptionInput,
    func=lambda box_name, new_description: edit_box_description(box_name, new_description, containers)
)

get_box_names_in_container_tool = StructuredTool.from_function(
    name="get_box_names_in_container",
    description="List all box names and descriptions within a specified container (frontend, backend, shared, or infrastructure).",
    args_schema=GetBoxNamesInContainerInput,
    func=lambda container_name: get_box_names_in_container(container_name, containers)
)

ui_component_tools = [
    add_story_to_box_tool, 
    get_box_names_tool,
    get_box_details_tool,
    move_story_between_boxes_tool,
    merge_boxes_tool,
    rename_box_tool,
    delete_box_tool,
    edit_box_description_tool
]


# get_boxes_tool = StructuredTool.from_function(
#     name="get_boxes",
#     description="Retrieve all UI component boxes and the stories currently in each box.",
#     args_schema=EmptyInput,
#     func=lambda: get_boxes(ui_boxes)
# )



def box_user_stories_with_llm(llm, user_stories):
    """
    For each user story, prompt the LLM to place it in the correct UI component box using the available tools.
    Pass the current list of boxes and their names in the prompt.
    Maintain a memory buffer of the 5 most recent story assignments (report objects).
    """
    placement_history = []  # Holds dicts with story_name, box_name, reason

    for story in user_stories:
        # Build the memory buffer (5 most recent assignments)
        recent_memory = placement_history[-5:]
        memory_json = json.dumps(recent_memory, indent=2)

        user_prompt = (
            "Here is the user story:\n"
            f"{json.dumps(story, indent=2)}\n\n"
            "Here are the 5 most recent story assignments (memory buffer):\n"
            f"{memory_json}\n\n"
        )

        print(f"User prompt: {user_prompt}")

        memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True,
        )

        result = call_agent(
            llm=llm,
            prompt_template=build_prompt(escape_curly_braces(story_clustering_instructions)),
            input_text=user_prompt,
            tools=ui_component_tools,
            memory=memory,
            verbose=True
        )

        print(f"LLM result: {result}")

        # Extract the output report JSON from the LLM result
        report = extract_json_from_llm(result)
        if report and isinstance(report, dict):
            placement_history.append(report)

    return containers