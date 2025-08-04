import os
import json

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

def save_containers_to_files(containers, folder_path="containers"):
    os.makedirs(folder_path, exist_ok=True)
    for container_name, box_dict in containers.items():
        file_path = os.path.join(folder_path, f"{container_name}.json")
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(serialize_container(box_dict), f, indent=2)

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
                "description": instance.description,        
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
        "description": instance.description,
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


def save_dict_to_file(data, filename):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def load_dict_from_file(filename):
    if os.path.exists(filename):
        with open(filename, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def generate_screen_jsons(screens, instances, types, output_folder):
    os.makedirs(output_folder, exist_ok=True)
    instance_map = {inst["id"]: inst for inst in instances}
    type_map = {typ["id"]: typ for typ in types}

    for screen in screens:
        screen_name = screen["name"]
        screen_instance_ids = screen.get("component_instance_ids", [])
        screen_instances = [instance_map[iid] for iid in screen_instance_ids if iid in instance_map]
        type_ids = set(inst["type_id"] for inst in screen_instances)
        screen_types = [type_map[tid] for tid in type_ids if tid in type_map]
        screen_json = {
            "screen": screen,
            "component_instances": screen_instances,
            "component_types": screen_types
        }
        filename = os.path.join(output_folder, f"{screen_name}.json")
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(screen_json, f, indent=2)
        print(f"Wrote {filename}")