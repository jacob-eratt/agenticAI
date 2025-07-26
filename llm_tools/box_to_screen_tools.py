#region: Tools for Screens
import vectorstores
class Screen:
    def __init__(self, name, description=""):
        self.name = name
        self.description = description
        self.boxes = []  # List of box dicts (from vector DB)

    def add_box(self, box):
        # Prevent duplicate box by id
        if any(b["id"] == box["id"] for b in self.boxes):
            return False
        self.boxes.append(box)
        return True



    def remove_box(self, box_id):
        self.boxes = [b for b in self.boxes if b["id"] != box_id]

    def has_box(self, box_id):
        return any(b["id"] == box_id for b in self.boxes)

    def to_dict(self):
        return {
            "name": self.name,
            "description": self.description,
            "boxes": self.boxes
        }

#region: Screen Creation Tools
def get_box_by_id(box_id):
    """
    Retrieve a box by its id from the vectorstore.
    """
    vectorstore = vectorstores.manager.get_store("pipeline_parts")
    results = vectorstore.get(where={"id": box_id})
    if results and results.get("documents") and results.get("metadatas"):
        metadata = results["metadatas"][0]
        box = {
            "id": metadata.get("id"),
            "name": metadata.get("name"),
            "description": results["documents"][0],
            "container": metadata.get("container"),
            "story_ids": metadata.get("story_ids", [])
        }
        return box
    return None

def add_box_to_screen(box_id, screen_name, screen_description, screens):
    """
    Add a UI component box (by box_id) to a screen. If the screen does not exist, create it with the given description.
    """
    box = get_box_by_id(box_id)
    if not box:
        return {"status": "error", "message": f"Box with id '{box_id}' not found in vector DB."}
    if screen_name not in screens:
        screens[screen_name] = Screen(screen_name, screen_description or "")
    screen = screens[screen_name]
    if not screen.add_box(box):
        return {"status": "error", "message": f"Box '{box['name']}' already in screen '{screen_name}'."}
    return {
        "status": "success",
        "message": f"Box '{box['name']}' added to screen '{screen_name}'."
    }

def move_box_between_screens(box_id, from_screen_name, to_screen_name, to_screen_description, screens):
    """
    Move a box (by box_id) from one screen to another.
    """
    if from_screen_name not in screens or to_screen_name not in screens:
        return {"status": "error", "message": "Screen not found."}
    from_screen = screens[from_screen_name]
    to_screen = screens[to_screen_name]
    # Remove from source
    if not from_screen.has_box(box_id):
        return {"status": "error", "message": f"Box with id '{box_id}' not found in screen '{from_screen_name}'."}
    box = next(b for b in from_screen.boxes if b["id"] == box_id)
    from_screen.remove_box(box_id)
    # Add to destination
    if not to_screen.add_box(box):
        return {"status": "error", "message": f"Box already exists in '{to_screen_name}'."}
    # Optionally update destination screen description
    if to_screen_description is not None:
        to_screen.description = to_screen_description
    return {"status": "success", "message": f"Box '{box['name']}' moved from '{from_screen_name}' to '{to_screen_name}'."}

def create_screen(screen_name, description, screens):
    if screen_name in screens:
        return {"status": "error", "message": f"Screen '{screen_name}' already exists."}
    screens[screen_name] = Screen(screen_name, description)
    return {"status": "success", "message": f"Screen '{screen_name}' created."}

def delete_screen(screen_name, screens):
    if screen_name not in screens:
        return {"status": "error", "message": f"Screen '{screen_name}' not found."}
    del screens[screen_name]
    return {"status": "success", "message": f"Screen '{screen_name}' deleted."}

def edit_screen_description(screen_name, new_description, screens):
    if screen_name not in screens:
        return {"status": "error", "message": f"Screen '{screen_name}' not found."}
    screens[screen_name].description = new_description
    return {"status": "success", "message": f"Screen '{screen_name}' description updated."}

def get_screen_names(screens):
    return {"status": "success", "screens": list(screens.keys())}

def get_screen_details(screen_name, screens):
    if screen_name not in screens:
        return {"status": "error", "message": f"Screen '{screen_name}' not found."}
    return {"status": "success", "screen": screens[screen_name].to_dict()}

#endregion: Tools for Screens
