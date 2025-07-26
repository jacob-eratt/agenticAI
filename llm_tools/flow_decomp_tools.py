from langchain.tools import tool, Tool, StructuredTool
import uuid

#region: Flow to Screen Conversion

class ComponentType:
    def __init__(self, name, description, supported_props=None):
        self.id = str(uuid.uuid4())
        self.name = name
        self.description = description
        self.supported_props = supported_props or []  # e.g., ["label", "icon", "size"]

class ComponentInstance:
    def __init__(self, type_id, props=None):
        self.id = str(uuid.uuid4())
        self.type_id = type_id  # Reference to ComponentType
        self.props = props or {}
        self.usage_count = 0  # Track how often this instance is used

class Screen:
    def __init__(self, name, description):
        self.id = str(uuid.uuid4())
        self.name = name
        self.description = description
        self.component_instance_ids = []  # List of ComponentInstance IDs

    def add_component_instance(self, instance_id):
        if instance_id not in self.component_instance_ids:
            self.component_instance_ids.append(instance_id)

    def remove_component_instance(self, instance_id):
        if instance_id in self.component_instance_ids:
            self.component_instance_ids.remove(instance_id)

    def get_component_instances(self, component_instances_registry):
        return [
            component_instances_registry[cid]
            for cid in self.component_instance_ids
            if cid in component_instances_registry
        ]

# --- Tool Declarations (function signatures) ---
def get_component_types(component_types):
    return list(component_types.values())

def get_component_type_details(type_id, component_types):
    return component_types.get(type_id)

def add_component_type(name, description, supported_props, component_types):
    new_type = ComponentType(name, description, supported_props)
    component_types[new_type.id] = new_type
    return new_type.id


def edit_component_type(type_id, new_name=None, new_description=None, new_supported_props=None, component_types=None):
    comp_type = component_types.get(type_id)
    if not comp_type:
        return {
            "status": "error",
            "message": f"Component type '{type_id}' not found."
        }
    changes = []
    if new_name and new_name != comp_type.name:
        comp_type.name = new_name
        changes.append("name")
    if new_description and new_description != comp_type.description:
        comp_type.description = new_description
        changes.append("description")
    if new_supported_props is not None and new_supported_props != comp_type.supported_props:
        comp_type.supported_props = new_supported_props
        changes.append("supported_props")
    if changes:
        return {
            "status": "success",
            "message": f"Component type '{type_id}' updated: {', '.join(changes)} changed."
        }
    else:
        return {
            "status": "success",
            "message": f"Component type '{type_id}' found, but no changes were made."
        }

def delete_component_type(type_id, component_types, component_instances):
    """
    Deletes a component type and returns a status message and list of affected instance IDs.
    Does NOT delete instances automatically—lets the LLM/agent decide what to do.
    """
    if type_id not in component_types:
        return {
            "status": "error",
            "message": f"Component type '{type_id}' not found.",
            "affected_instance_ids": []
        }
    # Find all instances of this type
    affected_instances = [iid for iid, inst in component_instances.items() if inst.type_id == type_id]
    # Remove the type
    del component_types[type_id]
    return {
        "status": "success",
        "message": f"Component type '{type_id}' deleted.",
        "affected_instance_ids": affected_instances
    }


def get_component_instances(component_instances):
    return list(component_instances.values())

def get_component_instance_details(instance_id, component_instances):
    return component_instances.get(instance_id)


def add_component_instance(type_id, props, component_instances):
    new_instance = ComponentInstance(type_id, props)
    if new_instance.id in component_instances:
        return {"status": "error", "message": f"Instance '{new_instance.id}' already exists."}
    component_instances[new_instance.id] = new_instance
    return {"status": "success", "message": f"Instance '{new_instance.id}' created.", "instance_id": new_instance.id}

def edit_component_instance(instance_id, new_props, component_instances):
    inst = component_instances.get(instance_id)
    if not inst:
        return {
            "status": "error",
            "message": f"Component instance '{instance_id}' not found."
        }
    if new_props is not None and new_props != inst.props:
        inst.props = new_props
        return {
            "status": "success",
            "message": f"Component instance '{instance_id}' props updated."
        }
    else:
        return {
            "status": "success",
            "message": f"Component instance '{instance_id}' found, but no changes were made."
        }

def delete_component_instance(instance_id, component_instances, screens):
    if instance_id not in component_instances:
        return {"status": "error", "message": f"Instance '{instance_id}' not found."}
    affected_screens = []
    for screen in screens.values():
        if instance_id in screen.component_instance_ids:
            screen.remove_component_instance(instance_id)
            affected_screens.append(screen.id)
    del component_instances[instance_id]
    return {"status": "success", "message": f"Instance '{instance_id}' deleted.", "affected_screens": affected_screens}



def add_screen(name, description, screens):
    new_screen = Screen(name, description)
    screens[new_screen.id] = new_screen
    return new_screen.id

def edit_screen(screen_id, new_name=None, new_description=None, screens=None):
    screen = screens.get(screen_id)
    if not screen:
        return {"status": "error", "message": f"Screen '{screen_id}' not found."}
    changes = []
    if new_name and new_name != screen.name:
        screen.name = new_name
        changes.append("name")
    if new_description and new_description != screen.description:
        screen.description = new_description
        changes.append("description")
    if changes:
        return {
            "status": "success",
            "message": f"Screen '{screen_id}' updated: {', '.join(changes)} changed."
        }
    else:
        return {
            "status": "success",
            "message": f"Screen '{screen_id}' found, but no changes were made."
        }

def delete_screen(screen_id, screens):
    if screen_id not in screens:
        return {"status": "error", "message": f"Screen '{screen_id}' not found."}
    instance_ids = list(screens[screen_id].component_instance_ids)
    del screens[screen_id]
    return {"status": "success", "message": f"Screen '{screen_id}' deleted.", "affected_instance_ids": instance_ids}

def get_screens(screens):
    return list(screens.values())

def get_screen_details(screen_id, screens):
    return screens.get(screen_id)

def add_component_instance_to_screen(screen_id, instance_id, screens):
    screen = screens.get(screen_id)
    if not screen:
        return {"status": "error", "message": f"Screen '{screen_id}' not found."}
    if instance_id in screen.component_instance_ids:
        return {"status": "error", "message": f"Instance '{instance_id}' already in screen '{screen_id}'."}
    screen.add_component_instance(instance_id)
    return {"status": "success", "message": f"Instance '{instance_id}' added to screen '{screen_id}'."}

def remove_component_instance_from_screen(screen_id, instance_id, screens):
    screen = screens.get(screen_id)
    if not screen:
        return {"status": "error", "message": f"Screen '{screen_id}' not found."}
    if instance_id not in screen.component_instance_ids:
        return {"status": "error", "message": f"Instance '{instance_id}' not in screen '{screen_id}'."}
    screen.remove_component_instance(instance_id)
    return {"status": "success", "message": f"Instance '{instance_id}' removed from screen '{screen_id}'."}

def get_screen_contents(screen_id, screens, component_instances):
    screen = screens.get(screen_id)
    if screen:
        return screen.get_component_instances(component_instances)
    return []

def get_component_type_usage(type_id, component_instances):
    return sum(1 for inst in component_instances.values() if inst.type_id == type_id)

def increment_instance_usage(instance_id, component_instances):
    if instance_id in component_instances:
        component_instances[instance_id].usage_count += 1

#endregion: Flow to Screen Conversion