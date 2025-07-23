import uuid
from llm_tools import *
from langchain.tools import Tool
from functools import partial
from llm_utils import call_agent, build_prompt, escape_curly_braces, extract_json


# Data structures
class UIComponentBox:
    def __init__(self, name, description=""):
        self.id = str(uuid.uuid4())
        self.name = name
        self.description = description
        self.stories = []

    def add_story(self, story):
        self.stories.append(story)

# In-memory store for boxes
ui_boxes = {}

add_story_to_box_tool = Tool(
    name="add_story_to_box",
    func=partial(add_story_to_box, ui_boxes=ui_boxes),
    description=(
        "Add a user story to a UI component box. "
        "Input example:\n"
        "{\n"
        '  "story": {\n'
        '    "id": "123",\n'
        '    "name": "user_can_view_weather",\n'
        '    "description": "shows_weather_details",\n'
        '    "theme_id": "abc"\n'
        "  },\n"
        '  "box_name": "weather_box",\n'
        '  "box_description": "contains_weather_related_stories"\n'
        "}"
    )
)

get_boxes_tool = Tool(
    name="get_boxes",
    func=partial(get_boxes, ui_boxes=ui_boxes),
    description=(
        "Retrieve all UI component boxes and the stories currently in each box. "
        "Input: None."
    )
)

move_story_between_boxes_tool = Tool(
    name="move_story_between_boxes",
    func=partial(move_story_between_boxes, ui_boxes=ui_boxes),
    description=(
        "Move a user story from one UI component box to another. "
        "Input example:\n"
        "{\n"
        '  "story_id": "123",\n'
        '  "from_box_name": "weather_box",\n'
        '  "to_box_name": "main_box"\n'
        "}"
    )
)

merge_boxes_tool = Tool(
    name="merge_boxes",
    func=partial(merge_boxes, ui_boxes=ui_boxes),
    description=(
        "Merge multiple UI component boxes into a new box, consolidating their stories. "
        "Input example:\n"
        "{\n"
        '  "box_names": ["weather_box", "main_box"],\n'
        '  "new_box_name": "merged_box",\n'
        '  "new_box_description": "all_stories_merged_here"\n'
        "}"
    )
)

ui_component_tools = [
    add_story_to_box_tool,
    get_boxes_tool,
    move_story_between_boxes_tool,
    merge_boxes_tool
]



def box_user_stories_with_llm(llm, user_stories):
    """
    For each user story, prompt the LLM to place it in the correct UI component box using the available tools.
    Pass the current list of boxes and their names in the prompt.
    """
    for story in user_stories:
        # Get current boxes and their names
        boxes = get_boxes(ui_boxes)
        box_names = [box["name"] for box in boxes]
        prompt = (
            "Here is the user story:\n"
            f"{json.dumps(story, indent=2)}\n\n"
            "Here are the current UI component boxes (snake_case):\n"
            f"{json.dumps(box_names, indent=2)}\n\n"
        )
        result = call_agent(
            llm=llm,
            prompt_template=None,  # If you use a template, pass it here
            input_text=prompt,
            tools=ui_component_tools,
            verbose=True
        )
        print(f"LLM result: {result}")