from langchain.tools import tool, Tool, StructuredTool
import json
import uuid
import vectorstores

#region: Tools for RAG info
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
#endregion: Tools for RAG info


#region: Tools for UI Component Boxes
class UIComponentBox:
    def __init__(self, name, description=""):
        self.id = str(uuid.uuid4())
        self.name = name
        self.description = description
        self.stories = []

    def add_story(self, story):
        self.stories.append(story)

def find_box_and_container(box_name, containers):
    """
    Helper function to find a box and its container by box name.
    Returns (container_name, box_dict) or (None, None) if not found.
    """
    for container_name, box_dict in containers.items():
        if box_name in box_dict:
            return container_name, box_dict
    return None, None


def add_story_to_box(story_id, box_name, box_description, container_name, containers):
    """
    Add a story to a specific box within the specified container.
    If the box does not exist, it will be created.
    """
    vectorstore = vectorstores.manager.get_store("pipeline_parts")
    results = vectorstore.get(where={"id": story_id})

    story = None
    if results and results.get("documents") and results.get("metadatas"):
        # Find the first result with type == "story"
        for idx, metadata in enumerate(results["metadatas"]):
            if metadata.get("type") == "story":
                story = metadata.copy()
                story["description"] = results["documents"][idx]
                break
    if not story:
        return {"status": "error", "message": f"Story with id '{story_id}' and type 'story' not found in vector DB."}

    # Get the correct container
    if container_name not in containers:
        return {"status": "error", "message": f"Container '{container_name}' not found."}
    container = containers[container_name]

    if box_name not in container:
        container[box_name] = UIComponentBox(box_name, box_description)
    container[box_name].add_story(story)
    return {
        "status": "success",
        "message": f"Story added to box '{box_name}' in container '{container_name}'.",
        "box_name": box_name,
        "container": container_name,
        "story_id": story_id
    }

def merge_boxes(source_box_name, dest_box_name, containers, new_description=None):
    """
    Merge all stories from source_box_name into dest_box_name, searching across all containers.
    Optionally update the destination box's description.
    Deletes the source box after merging.
    """
    # Find source and destination boxes and their containers
    src_container_name, src_box_dict = find_box_and_container(source_box_name, containers)
    dest_container_name, dest_box_dict = find_box_and_container(dest_box_name, containers)

    if not src_box_dict:
        return {"status": "error", "message": f"Source box '{source_box_name}' not found."}
    if not dest_box_dict:
        return {"status": "error", "message": f"Destination box '{dest_box_name}' not found."}

    src_box = src_box_dict[source_box_name]
    dest_box = dest_box_dict[dest_box_name]

    # Move stories
    dest_box.stories.extend(src_box.stories)

    # Optionally update description
    if new_description:
        dest_box.description = new_description

    # Delete the source box
    del src_box_dict[source_box_name]

    return {
        "status": "success",
        "message": f"Box '{source_box_name}' merged into '{dest_box_name}'.",
        "merged_stories_count": len(src_box.stories),
        "destination_box": dest_box_name,
        "destination_container": dest_container_name
    }

def move_story_between_boxes(story_id, from_box_name, to_box_name, containers):
    """
    Move a story from one box to another, searching across all containers.
    """
    # Retrieve story from vectorstore by story_id
    vectorstore = vectorstores.manager.get_store("pipeline_parts")
    results = vectorstore.get(where={"id": story_id})

    # Chroma returns a dict with "documents" and "metadatas" as lists
    story = None
    if results and results.get("documents") and results.get("metadatas"):
        # Find the first result with type == "story"
        for idx, metadata in enumerate(results["metadatas"]):
            if metadata.get("type") == "story":
                story = metadata.copy()
                story["description"] = results["documents"][idx]
                break
    if not story:
        return {"status": "error", "message": f"Story with id '{story_id}' and type 'story' not found in vector DB."}

    # Find source and destination boxes and their containers
    from_container_name, from_box_dict = find_box_and_container(from_box_name, containers)
    to_container_name, to_box_dict = find_box_and_container(to_box_name, containers)

    if not from_box_dict:
        return {"status": "error", "message": f"Source box '{from_box_name}' not found."}

    # Remove story from source box if present
    story_in_box = next((s for s in from_box_dict[from_box_name].stories if s.get("id") == story_id), None)
    if story_in_box:
        from_box_dict[from_box_name].stories.remove(story_in_box)

    # Ensure destination box exists (create if needed)
    if not to_box_dict:
        # If destination box doesn't exist, create it in the same container as source
        # or default to 'frontend' if source not found (customize as needed)
        default_container = to_container_name if to_container_name else from_container_name or "frontend"
        to_box_dict = containers[default_container]
        to_box_dict[to_box_name] = UIComponentBox(to_box_name, f"Auto-created box for {to_box_name}")

    # Add story to destination box
    to_box_dict[to_box_name].add_story(story)

    return {
        "status": "success",
        "message": f"Story '{story_id}' moved from '{from_box_name}' to '{to_box_name}'.",
        "story_id": story_id
    }

def get_box_names(containers):
    """
    Return a list of all box names, along with the container they belong to.
    """
    box_list = []
    for container_name, box_dict in containers.items():
        for box_name in box_dict.keys():
            box_list.append({
                "box_name": box_name,
                "container": container_name
            })
    return {
        "status": "success",
        "boxes": box_list
    }

def get_box_details(box_name, containers):
    """
    Return details for a single box by name, searching all containers.
    """
    container_name, box_dict = find_box_and_container(box_name, containers)
    if not box_dict:
        return {"status": "error", "message": f"Box '{box_name}' not found."}
    box = box_dict[box_name]
    return {
        "status": "success",
        "box": {
            "id": box.id,
            "name": box.name,
            "description": box.description,
            "stories": box.stories,
            "container": container_name
        }
    }

def rename_box(old_name, new_name, containers):
    """
    Rename a box by name, searching all containers.
    """
    container_name, box_dict = find_box_and_container(old_name, containers)
    if not box_dict:
        return {"status": "error", "message": f"Box '{old_name}' not found."}
    if any(new_name in c for c in containers.values()):
        return {"status": "error", "message": f"Box '{new_name}' already exists."}
    box = box_dict.pop(old_name)
    box.name = new_name
    box_dict[new_name] = box
    return {"status": "success", "message": f"Box renamed to '{new_name}'."}

def delete_box(box_name, containers):
    """
    Delete a box by name, searching all containers.
    """
    container_name, box_dict = find_box_and_container(box_name, containers)
    if not box_dict:
        return {"status": "error", "message": f"Box '{box_name}' not found."}
    del box_dict[box_name]
    return {"status": "success", "message": f"Box '{box_name}' deleted."}

def edit_box_description(box_name, new_description, containers):
    """
    Edit the description of a box by name, searching all containers.
    """
    container_name, box_dict = find_box_and_container(box_name, containers)
    if not box_dict:
        return {"status": "error", "message": f"Box '{box_name}' not found."}
    box = box_dict[box_name]
    box.description = new_description
    return {"status": "success", "message": f"Box '{box_name}' description updated."}


def get_box_names_in_container(container_name: str, containers):
    container = containers.get(container_name)
    if container is None:
        return {
            "status": "error",
            "message": f"Container '{container_name}' not found. Choose from: frontend, backend, shared, infrastructure."
        }
    return {
        "status": "success",
        "container": container_name,
        "boxes": [
            {"name": box.name, "description": box.description}
            for box in container.values()
        ]
    }

#endregion: Tools for UI Component Boxes




