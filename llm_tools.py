from langchain.tools import tool, Tool
import json
import uuid
from ui_component_creation import UIComponentBox

class RAGTool:
    """
    General purpose tool for retrieving relevant information from a vector store.
    Always uses the same retriever instance, which is set at initialization.
    """
    name = "rag_tool"
    description = "Retrieves relevant information from the information vector store based on the query."

    def __init__(self, retriever):
        self.retriever = retriever

    def __call__(self, query: str) -> str:
        results = self.retriever.get_relevant_documents(query)
        return json.dumps([doc.page_content for doc in results])

def make_rag_tool(retriever):
    """
    Factory function to create a LangChain Tool for agent usage.
    """
    def rag_tool_func(query: str) -> str:
        results = retriever.get_relevant_documents(query)
        return json.dumps([doc.page_content for doc in results])

    return Tool(
        name="rag_tool",
        func=rag_tool_func,
        description="Retrieves relevant information from the information vector store based on the query."
    )



def ask_user_tool(questions: str) -> str:
    """
    Ask the user a set of questions and return their answers as a JSON object.
    """
    try:
        question_list = json.loads(questions)
        if not isinstance(question_list, list):
            question_list = [questions]
    except Exception:
        question_list = [questions]
    answers = {}
    for q in question_list:
        # If q is a dict, extract the question text
        if isinstance(q, dict) and "question" in q:
            question_text = q["question"]
        else:
            question_text = str(q)
        print(f"\n[LLM Question]: {question_text}")
        ans = input("[Your answer]: ")
        answers[question_text] = ans
    return json.dumps(answers)




def add_story_to_box(params, ui_boxes):
    # Parse params if passed as a string
    if isinstance(params, str):
        try:
            params = json.loads(params)
        except Exception:
            pass
    story = params.get("story")
    if isinstance(story, str):
        try:
            story = json.loads(story)
        except Exception:
            pass
    box_name = str(params.get("box_name"))  # Ensure box_name is a string
    box_description = params.get("box_description", "")
    if box_name not in ui_boxes:
        ui_boxes[box_name] = UIComponentBox(box_name, box_description)
    ui_boxes[box_name].add_story(story)
    return f"Story added to box '{box_name}'."


# Tool 2: Retrieve all boxes and their stories
def get_boxes(ui_boxes):
    return [
        {
            "id": box.id,
            "name": box.name,
            "description": box.description,
            "stories": box.stories
        }
        for box in ui_boxes.values()
    ]

# Tool 3: Reorganize boxes (move/merge/consolidate)
def move_story_between_boxes(params, ui_boxes):
    if isinstance(params, str):
        try:
            params = json.loads(params)
        except Exception:
            pass
    story_id = params.get("story_id")
    from_box_name = str(params.get("from_box_name"))
    to_box_name = str(params.get("to_box_name"))
    if from_box_name in ui_boxes and to_box_name in ui_boxes:
        story = next((s for s in ui_boxes[from_box_name].stories if s.get("id") == story_id), None)
        if story:
            ui_boxes[from_box_name].stories.remove(story)
            ui_boxes[to_box_name].add_story(story)
            return f"Story {story_id} moved from '{from_box_name}' to '{to_box_name}'."
    return "Move failed."

def merge_boxes(params, ui_boxes):
    if isinstance(params, str):
        try:
            params = json.loads(params)
        except Exception:
            pass
    box_names = params.get("box_names", [])
    new_box_name = params.get("new_box_name", "Merged Box")
    new_box_description = params.get("new_box_description", "")

    box_names = [str(name) for name in params.get("box_names", [])]
    new_box_name = str(params.get("new_box_name", "Merged Box"))
    new_box_description = params.get("new_box_description", "")
    merged_stories = []
    for name in box_names:
        if name in ui_boxes:
            merged_stories.extend(ui_boxes[name].stories)
            del ui_boxes[name]
    ui_boxes[new_box_name] = UIComponentBox(new_box_name, new_box_description)
    for story in merged_stories:
        ui_boxes[new_box_name].add_story(story)
    return f"Boxes {box_names} merged into '{new_box_name}'."



