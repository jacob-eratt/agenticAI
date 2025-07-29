from langchain.tools import tool, Tool, StructuredTool
import vectorstores
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.schema import Document
import uuid
from llm_utils import safe_parse_props, safe_parse_supported_props

#region: Flow to Screen Conversion

# =========================
# === Data Structures ===
# =========================

class ComponentType:
    def __init__(self, name, description, supported_props=None):
        self.id = str(uuid.uuid4())
        self.name = name
        self.description = description
        self.supported_props = supported_props or []  # e.g., ["label", "icon", "size"]

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "supported_props": self.supported_props
        }

class ComponentInstance:
    def __init__(self, type_id, screen_id=None, props=None):
        self.id = str(uuid.uuid4())
        self.type_id = type_id  # Reference to ComponentType
        self.screen_id = screen_id  # Reference to Screen ID if applicable
        self.props = props or {}
        self.usage_count = 0  # Track how often this instance is used
    def to_dict(self):
        return {
            "id": self.id,
            "type_id": self.type_id,
            "screen_id": self.screen_id,
            "props": self.props,
            "usage_count": self.usage_count
        }

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
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "component_instance_ids": self.component_instance_ids
        }

# ================================
# === Component Type Functions ===
# ================================

def add_component_type(name, description, supported_props, component_types, vectorstore_name="pipeline_parts"):
    # Add a new component type and persist to vectorstore
    supported_props = safe_parse_supported_props(supported_props)
    new_type = ComponentType(name, description, supported_props)
    component_types[new_type.id] = new_type
    # Add to vectorstore
    doc_text = f"Component Type Name: {name}\nDescription: {description}"
    metadata = {
        "id": new_type.id,
        "name": name,
        "supported_props": str(supported_props),
        "category": "component_type"
    }
    vectorstore = vectorstores.manager.get_store(vectorstore_name)
    if vectorstore:
        vectorstore.add_documents([Document(page_content=doc_text, metadata=metadata)])
    return new_type.id


def edit_component_type(type_id, new_name=None, new_description=None, new_supported_props=None, component_types=None, vectorstore_name="pipeline_parts"):
    # Edit component type and update vectorstore
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
    if new_supported_props is not None:
        try:
            parsed_props = safe_parse_supported_props(new_supported_props)
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to parse new_supported_props: {e}"
            }
        if str(parsed_props) != str(comp_type.supported_props):
            comp_type.supported_props = parsed_props
            changes.append("supported_props")
    # Update vectorstore
    doc_text = f"Component Type Name: {comp_type.name}\nDescription: {comp_type.description}"
    metadata = {
        "id": comp_type.id,
        "name": comp_type.name,
        "supported_props": str(comp_type.supported_props)
    }
    vectorstore = vectorstores.manager.get_store(vectorstore_name)
    if vectorstore:
        vectorstore.delete(comp_type.id)
        vectorstore.add_documents([Document(page_content=doc_text, metadata=metadata)])
        
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

def delete_component_type(type_id, component_types, component_instances, vectorstore_name="pipeline_parts"):
    # Delete component type and remove from vectorstore
    if type_id not in component_types:
        return {
            "status": "error",
            "message": f"Component type '{type_id}' not found.",
            "affected_instance_ids": []
        }
    affected_instances = [iid for iid, inst in component_instances.items() if inst.type_id == type_id]
    del component_types[type_id]
    vectorstore = vectorstores.manager.get_store(vectorstore_name)
    if vectorstore:
        vectorstore.delete([type_id])
    return {
        "status": "success",
        "message": f"Component type '{type_id}' deleted.",
        "affected_instance_ids": affected_instances
    }


def get_component_types(component_types):
    # Return all component types
    types = [ct.to_dict() for ct in component_types.values()]
    return {
        "status": "success",
        "message": f"Retrieved {len(types)} component types.",
        "component_types": types
    }

def get_component_type_details(type_id, component_types):
    # Return details for a specific component type
    comp_type = component_types.get(type_id)
    if comp_type:
        return {
            "status": "success",
            "message": f"Component type '{type_id}' retrieved.",
            "component_type": comp_type.to_dict()  # <-- FIXED
        }
    else:
        return {
            "status": "error",
            "message": f"Component type '{type_id}' not found.",
            "component_type": None
        }

def get_component_type_usage(type_id, component_instances):
    # Count usage of a component type
    return sum(1 for inst in component_instances.values() if inst.type_id == type_id)

# ===================================
# === Component Instance Functions ===
# ===================================

def add_component_instance(type_id, props, screen_id, component_instances, screens=None, vectorstore_name="pipeline_parts"):
    # Add a new component instance and persist to vectorstore
    props = safe_parse_props(props)
    new_instance = ComponentInstance(type_id, props=props)
    if new_instance.id in component_instances:
        return {"status": "error", "message": f"Instance '{new_instance.id}' already exists."}
    # Optionally add to screen
    if screens is not None and screen_id is not None:
        screen = screens.get(screen_id)
        if screen:
            screen.add_component_instance(new_instance.id)
            new_instance.screen_id = screen_id
            # Update screen in vectorstore
            doc_text_screen = f"Screen Name: {screen.name}\nDescription: {screen.description}"
            metadata_screen = {
                "id": screen.id,
                "name": screen.name,
                "component_instance_ids": str(screen.component_instance_ids),
                "category": "screen"
            }
            vectorstore = vectorstores.manager.get_store(vectorstore_name)
            if vectorstore:
                vectorstore.delete([screen.id])  
                vectorstore.add_documents([Document(page_content=doc_text_screen, metadata=metadata_screen)])
    component_instances[new_instance.id] = new_instance
    # Add to vectorstore
    doc_text = f"Props: {str(props)}"
    metadata = {
        "id": new_instance.id,
        "type_id": type_id,
        "screen_id": new_instance.screen_id,
        "props": str(props)
    }
    vectorstore = vectorstores.manager.get_store(vectorstore_name)
    if vectorstore:
        vectorstore.add_documents([Document(page_content=doc_text, metadata=metadata)])
    return {
        "status": "success",
        "message": f"Instance '{new_instance.id}' created and added to screen '{screen_id}'." if screen_id else f"Instance '{new_instance.id}' created.",
        "instance_id": new_instance.id,
        "screen_id": screen_id
    }

def delete_component_instance(instance_id, component_instances, screens, vectorstore_name="pipeline_parts"):
    """
    Deletes a component instance from the registry and removes it from any screens it belongs to.
    Also deletes it from the vectorstore.
    """
    if instance_id not in component_instances:
        return {
            "status": "error",
            "message": f"Component instance '{instance_id}' not found."
        }
    # Remove from any screens
    for screen in screens.values():
        if instance_id in screen.component_instance_ids:
            screen.remove_component_instance(instance_id)
            # Optionally update screen in vectorstore
            doc_text_screen = f"Screen Name: {screen.name}\nDescription: {screen.description}"
            metadata_screen = {
                "id": screen.id,
                "name": screen.name,
                "component_instance_ids": str(screen.component_instance_ids),
                "category": "screen"
            }
            vectorstore = vectorstores.manager.get_store(vectorstore_name)
            if vectorstore:
                vectorstore.delete([screen.id])
                vectorstore.add_documents([Document(page_content=doc_text_screen, metadata=metadata_screen)])
    # Delete the instance itself
    del component_instances[instance_id]
    vectorstore = vectorstores.manager.get_store(vectorstore_name)
    if vectorstore:
        vectorstore.delete([instance_id])
    return {
        "status": "success",
        "message": f"Component instance '{instance_id}' deleted and removed from all screens."
    }

def edit_component_instance(instance_id, new_props=None, new_screen_id=None, component_instances=None, vectorstore_name="pipeline_parts"):
    # Edit component instance and update vectorstore
    new_props = safe_parse_props(new_props) if new_props is not None else None
    inst = component_instances.get(instance_id)
    if not inst:
        return {
            "status": "error",
            "message": f"Component instance '{instance_id}' not found."
        }
    changes = []
    # Update props if provided and different
    if new_props is not None and new_props != inst.props:
        inst.props = new_props
        changes.append("props")
    # Update screen_id if provided and different
    if new_screen_id is not None and new_screen_id != inst.screen_id:
        inst.screen_id = new_screen_id
        changes.append("screen_id")
    if changes:
        # Update vectorstore
        doc_text = f"Props: {str(inst.props)}"
        metadata = {
            "id": inst.id,
            "type_id": inst.type_id,
            "screen_id": inst.screen_id,
            "props": str(inst.props)
        }
        vectorstore = vectorstores.manager.get_store(vectorstore_name)
        if vectorstore:
            vectorstore.delete([inst.id])
            vectorstore.add_documents([Document(page_content=doc_text, metadata=metadata)])
        return {
            "status": "success",
            "message": f"Component instance '{instance_id}' updated: {', '.join(changes)} changed."
        }
    else:
        return {
            "status": "success",
            "message": f"Component instance '{instance_id}' found, but no changes were made."
        }

def get_component_instance_details(instance_id, component_instances):
    # Return details for a specific component instance
    inst = component_instances.get(instance_id)
    if inst:
        return {
            "status": "success",
            "message": f"Component instance '{instance_id}' retrieved.",
            "component_instance": inst.to_dict()
        }
    else:
        return {
            "status": "error",
            "message": f"Component instance '{instance_id}' not found.",
            "component_instance": None
        }

def increment_instance_usage(instance_id, component_instances):
    # Increment usage count for an instance
    if instance_id in component_instances:
        component_instances[instance_id].usage_count += 1

def batch_increment_instance_usage(instance_ids: list, component_instances: dict):
    # Batch increment usage counts
    for iid in instance_ids:
        if iid in component_instances:
            component_instances[iid].usage_count += 1
    return {"status": "success", "message": f"Incremented usage for {len(instance_ids)} instances."}

def batch_delete_component_instances(instance_ids: list, component_instances: dict, screens: dict):
    # Batch delete component instances
    deleted = 0
    for iid in instance_ids:
        if iid in component_instances:
            # Remove from screens
            for screen in screens.values():
                if iid in screen.component_instance_ids:
                    screen.remove_component_instance(iid)
            del component_instances[iid]
            deleted += 1
    return {"status": "success", "message": f"Deleted {deleted} component instances."}

# ==========================
# === Screen Functions ===
# ==========================

def add_screen(name, description, screens, vectorstore_name="pipeline_parts"):
    # Add a new screen and persist to vectorstore
    new_screen = Screen(name, description)
    screens[new_screen.id] = new_screen
    # Add to vectorstore
    doc_text = f"Screen Name: {name}\nDescription: {description}"
    metadata = {
        "id": new_screen.id,
        "name": name,
        "component_instance_ids": str(new_screen.component_instance_ids),
        "category": "screen"
    }
    vectorstore = vectorstores.manager.get_store(vectorstore_name)
    if vectorstore:
        vectorstore.add_documents([Document(page_content=doc_text, metadata=metadata)])
    return {
        "status": "success",
        "message": f"Screen '{name}' created with ID '{new_screen.id}'.",
        "screen_id": new_screen.id
    }

def edit_screen(screen_id, new_name=None, new_description=None, screens=None, vectorstore_name="pipeline_parts"):
    # Edit screen and update vectorstore
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
    # Update vectorstore
    doc_text = f"Screen Name: {screen.name}\nDescription: {screen.description}"
    metadata = {
        "id": screen.id,
        "name": screen.name,
        "component_instance_ids": str(screen.component_instance_ids)
    }
    vectorstore = vectorstores.manager.get_store(vectorstore_name)
    if vectorstore:
        vectorstore.delete([screen.id])
        vectorstore.add_documents([Document(page_content=doc_text, metadata=metadata)])
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

def delete_screen(screen_id, screens, component_instances, vectorstore_name="pipeline_parts"):
    # Debug: Print all screen IDs and the target
    print(f"Attempting to delete screen_id: {repr(screen_id)}")
    print("Current screens keys:")
    for k in screens.keys():
        print(f"  {repr(k)} == {repr(screen_id)} ? {k == screen_id}")

    # Manual search for matching screen_id
    found_key = None
    for k in screens.keys():
        if k == screen_id:
            found_key = k
            break

    if not found_key:
        print("Screen not found after manual search.")
        return {"status": "error", "message": f"Screen '{screen_id}' not found."}

    print(f"Screen found with key: {repr(found_key)}")
    instance_ids = list(screens[found_key].component_instance_ids)
    del screens[found_key]
    vectorstore = vectorstores.manager.get_store(vectorstore_name)
    if vectorstore:
        vectorstore.delete([found_key])
        # Remove screen_id from affected component instances and update vectorstore
        for iid in instance_ids:
            inst = component_instances.get(iid)
            if inst and inst.screen_id == found_key:
                inst.screen_id = None
                doc_text_inst = f"Props: {str(inst.props)}"
                metadata_inst = {
                    "id": inst.id,
                    "type_id": inst.type_id,
                    "screen_id": inst.screen_id,
                    "props": str(inst.props)
                }
                vectorstore.delete([inst.id])
                vectorstore.add_documents([Document(page_content=doc_text_inst, metadata=metadata_inst)])
        return {"status": "success", "message": f"Screen '{screen_id}' deleted and screen_id removed from affected instances.", "affected_instance_ids": instance_ids}

def add_component_instance_to_screen(screen_id, instance_id, screens, component_instances, vectorstore_name="pipeline_parts"):
    # Add component instance to a screen and update vectorstore
    screen = screens.get(screen_id)
    if not screen:
        return {"status": "error", "message": f"Screen '{screen_id}' not found."}
    if instance_id in screen.component_instance_ids:
        return {"status": "error", "message": f"Instance '{instance_id}' already in screen '{screen_id}'."}
    screen.add_component_instance(instance_id)
    # Update the component instance's screen_id
    inst = component_instances.get(instance_id)
    if inst:
        inst.screen_id = screen_id
        # Update component instance in vectorstore
        doc_text_inst = f"Props: {str(inst.props)}"
        metadata_inst = {
            "id": inst.id,
            "type_id": inst.type_id,
            "screen_id": inst.screen_id,
            "props": str(inst.props)
        }
        vectorstore = vectorstores.manager.get_store(vectorstore_name)
        if vectorstore:
            vectorstore.delete([inst.id])
            vectorstore.add_documents([Document(page_content=doc_text_inst, metadata=metadata_inst)])
    # Update screen in vectorstore
    doc_text_screen = f"Screen Name: {screen.name}\nDescription: {screen.description}"
    metadata_screen = {
        "id": screen.id,
        "name": screen.name,
        "component_instance_ids": str(screen.component_instance_ids),
        "category": "screen"
    }
    vectorstore = vectorstores.manager.get_store(vectorstore_name)
    if vectorstore:
        vectorstore.delete([screen.id])
        vectorstore.add_documents([Document(page_content=doc_text_screen, metadata=metadata_screen)])
    return {"status": "success", "message": f"Instance '{instance_id}' added to screen '{screen_id}'."}

def remove_component_instance_from_screen(screen_id, instance_id, screens, component_instances, vectorstore_name="pipeline_parts"):
    # Remove component instance from a screen and update vectorstore
    screen = screens.get(screen_id)
    if not screen:
        return {"status": "error", "message": f"Screen '{screen_id}' not found."}
    if instance_id not in screen.component_instance_ids:
        return {"status": "error", "message": f"Instance '{instance_id}' not in screen '{screen_id}'."}
    screen.remove_component_instance(instance_id)
    # Update screen in vectorstore
    doc_text = f"Screen Name: {screen.name}\nDescription: {screen.description}"
    metadata = {
        "id": screen.id,
        "name": screen.name,
        "component_instance_ids": str(screen.component_instance_ids),
        "category": "screen"
    }
    vectorstore = vectorstores.manager.get_store(vectorstore_name)
    if vectorstore:
        vectorstore.delete([screen.id])
        vectorstore.add_documents([Document(page_content=doc_text, metadata=metadata)])
    # Set dangling instance's screen_id to None and update vectorstore
    inst = component_instances.get(instance_id)
    if inst and inst.screen_id == screen_id:
        inst.screen_id = None
        doc_text_inst = f"Props: {str(inst.props)}"
        metadata_inst = {
            "id": inst.id,
            "type_id": inst.type_id,
            "screen_id": inst.screen_id,
            "props": str(inst.props)
        }
        if vectorstore:
            vectorstore.delete([inst.id])
            vectorstore.add_documents([Document(page_content=doc_text_inst, metadata=metadata_inst)])
    return {"status": "success", "message": f"Instance '{instance_id}' removed from screen '{screen_id}' and screen_id set to None in instance."}

def get_screens(screens):
    # Return all screens
    screens_list = [s.to_dict() for s in screens.values()]
    return {
        "status": "success",
        "message": f"Retrieved {len(screens_list)} screens.",
        "screens": screens_list
    }

def get_screen_full_details(screen_id, screens, component_instances):
    # Return full details for a screen, including its component instances
    screen = screens.get(screen_id)
    if not screen:
        return {
            "status": "error",
            "message": f"Screen '{screen_id}' not found.",
            "screen": None
        }
    # Get basic screen info
    screen_dict = screen.to_dict()
    # Add full component instance details
    screen_dict["component_instances"] = [
        component_instances[cid].to_dict()
        for cid in screen.component_instance_ids
        if cid in component_instances
    ]
    return {
        "status": "success",
        "message": f"Screen '{screen_id}' retrieved with component details.",
        "screen": screen_dict
    }

# ============================
# === Semantic Search Tool ===
# ============================

def semantic_search_tool(query, filter_key=None, filter_value=None, vectorstore_name="pipeline_parts", k=5):
    """
    Performs a semantic search in the vectorstore with an optional metadata filter.
    - query: The semantic search string.
    - filter_key: Metadata key to filter on (e.g., "type_id").
    - filter_value: Value for the filter key.
    - k: Number of results to return.
    """
    vectorstore = vectorstores.manager.get_store(vectorstore_name)
    if not vectorstore:
        return {"status": "error", "message": f"Vectorstore '{vectorstore_name}' not found.", "results": []}
    
    # Validate filter key if provided
    valid_keys = {"id", "name", "type_id", "supported_props", "component_instance_ids", "props", "category", "screen_id"}
    if filter_key and filter_key not in valid_keys:
        return {
            "status": "error",
            "message": f"Invalid filter key '{filter_key}'. Valid keys are: {', '.join(valid_keys)}.",
            "results": []
        }
    
    # Build filter dict if provided
    filter_dict = {filter_key: filter_value} if filter_key and filter_value is not None else None
    # Chroma's similarity_search supports metadata filtering
    results = vectorstore.similarity_search(query, k=k, filter=filter_dict)
    # Return results as list of dicts
    return {
        "status": "success",
        "message": f"Found {len(results)} results for query '{query}' with filter {filter_dict}.",
        "results": [r.metadata for r in results]
    }
#endregion: Flow to Screen Conversion
