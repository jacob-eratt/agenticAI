import uuid
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any 
import ast

#region: Story Creation Models
class Theme(BaseModel):
    id: Optional[uuid.UUID] = Field(None, description="Unique identifier for the theme")
    name: str
    description: str

class ThemeResponse(BaseModel):
    theme: List[Theme]

class Epic(BaseModel):
    id: Optional[uuid.UUID] = Field(None, description="Unique identifier for the epic")
    theme_id: Optional[uuid.UUID] = Field(None, description="ID of the parent theme")
    name: str
    description: str

class EpicsResponse(BaseModel):
    epics: List[Epic]

class UserStory(BaseModel):
    id: Optional[uuid.UUID] = Field(None, description="Unique identifier for the story")
    epic_id: Optional[uuid.UUID] = Field(None, description="ID of the parent epic")
    description: str
    priority: Optional[int] = Field(default=1, ge=1, le=5)

class UserStoryResponse(BaseModel):
    user_stories: List[UserStory]
#endregion

#region: story cluster models
class AddStoryToBoxInput(BaseModel):
    story_id: str
    box_name: str
    box_description: str
    container_name: str  # Should be one of: "frontend", "backend", "shared", "infrastructure"

class MoveStoryBetweenBoxesInput(BaseModel):
    story_id: str
    from_box_name: str
    to_box_name: str

class MergeBoxesInput(BaseModel):
    box_names: List[str]
    new_box_name: str
    new_box_description: str

class GetBoxDetailsInput(BaseModel):
    box_name: str

class EmptyInput(BaseModel):
    pass

class RenameBoxInput(BaseModel):
    old_name: str
    new_name: str

class DeleteBoxInput(BaseModel):
    box_name: str

class EditBoxDescriptionInput(BaseModel):
    box_name: str
    new_description: str

class GetBoxNamesInContainerInput(BaseModel):
    container_name: str  # Should be one of: "frontend", "backend", "shared", "infrastructure"
#endregion

#region: SCREEN Creation Models
class AddBoxToScreenInput(BaseModel):
    box_id: str = Field(..., description="The unique ID of the box to add.")
    screen_name: str = Field(..., description="The name of the screen to add the box to.")
    screen_description: Optional[str] = Field("", description="The description of the screen (if creating a new one).")

class MoveBoxBetweenScreensInput(BaseModel):
    box_id: str = Field(..., description="The unique ID of the box to move.")
    from_screen: str = Field(..., description="The name of the screen to move the box from.")
    to_screen: str = Field(..., description="The name of the screen to move the box to.")
    to_screen_description: Optional[str] = Field("", description="The description of the destination screen (if creating a new one).")

class CreateScreenInput(BaseModel):
    screen_name: str = Field(..., description="The name of the new screen.")
    description: Optional[str] = Field("", description="The description of the new screen.")

class DeleteScreenInput(BaseModel):
    screen_name: str = Field(..., description="The name of the screen to delete.")

class EditScreenDescriptionInput(BaseModel):
    screen_name: str = Field(..., description="The name of the screen to edit.")
    new_description: str = Field(..., description="The new description for the screen.")

class GetScreenDetailsInput(BaseModel):
    screen_name: str = Field(..., description="The name of the screen to retrieve details for.")



class AddComponentTypeInput(BaseModel):
    name: str = Field(..., description="Name of the component type (e.g., Button, Panel)")
    description: str = Field(..., description="Description of the component type")
    supported_props: Any = Field(
        default_factory=list,
        description=(
            "List of supported props for this component type. "
            "Each prop must be a dict with 'name', 'type', and 'description'. "
            "Example: [{'name': 'label', 'type': 'string', 'description': 'Text for button'}]. "
            "Can also be a string representing such a list."
        )
    )

    @validator("supported_props", pre=True)
    def parse_supported_props(cls, v):
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            try:
                result = ast.literal_eval(v)
                if isinstance(result, list):
                    return result
                raise ValueError("Parsed supported_props string is not a list")
            except Exception as e:
                raise ValueError(f"Could not parse supported_props string: {e}")
        return v

class EditComponentTypeInput(BaseModel):
    type_id: str = Field(..., description="ID of the component type to edit")
    new_name: Optional[str] = Field(None, description="New name for the component type")
    new_description: Optional[str] = Field(None, description="New description for the component type")
    new_supported_props: Optional[Any] = Field(
        None,
        description=(
            "New list of supported props for this component type. "
            "Each prop must be a dict with 'name', 'type', and 'description'. "
            "Example: [{'name': 'label', 'type': 'string', 'description': 'Text for button'}]. "
            "Can also be a string representing such a list."
        )
    )

    @validator("new_supported_props", pre=True)
    def parse_new_supported_props(cls, v):
        if v is None:
            return v
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            try:
                result = ast.literal_eval(v)
                if isinstance(result, list):
                    return result
                raise ValueError("Parsed new_supported_props string is not a list")
            except Exception as e:
                raise ValueError(f"Could not parse new_supported_props string: {e}")
        return v

class DeleteComponentTypeInput(BaseModel):
    type_id: str = Field(..., description="ID of the component type to delete")

class AddComponentInstanceInput(BaseModel):
    type_id: str = Field(..., description="ID of the component type to instantiate")
    screen_id: str = Field(..., description="ID of the screen to add this instance to")
    props: Any = Field(default_factory=dict, description="Props for this component instance (dict or string)")
    description: Optional[str] = Field("", description="Description of the component instance")  # <-- Added

    @validator("props", pre=True)
    def parse_props(cls, v):
        if isinstance(v, dict):
            return v
        if isinstance(v, str):
            try:
                return ast.literal_eval(v)
            except Exception as e:
                raise ValueError(f"Could not parse props string: {e}")
        return v

class EditComponentInstanceInput(BaseModel):
    instance_id: str = Field(..., description="ID of the component instance to edit")
    new_props: Optional[Dict[str, Any]] = Field(None, description="New props for this component instance")
    new_screen_id: Optional[str] = Field(None, description="New screen ID for this component instance")
    new_description: Optional[str] = Field(None, description="New description for this component instance")  # <-- Added

    @validator("new_props", pre=True)
    def parse_new_props(cls, v):
        if isinstance(v, dict):
            return v
        if isinstance(v, str):
            try:
                return ast.literal_eval(v)
            except Exception as e:
                raise ValueError(f"Could not parse supported_props string: {e}")
        return v

class DeleteComponentInstanceInput(BaseModel):
    instance_id: str = Field(..., description="ID of the component instance to delete")

class AddScreenInput(BaseModel):
    name: str = Field(..., description="Name of the screen")
    description: str = Field(..., description="Description of the screen")

class EditScreenInput(BaseModel):
    screen_id: str = Field(..., description="ID of the screen to edit")
    new_name: Optional[str] = Field(None, description="New name for the screen")
    new_description: Optional[str] = Field(None, description="New description for the screen")

class DeleteScreenInput(BaseModel):
    screen_id: str = Field(..., description="ID of the screen to delete")

class AddComponentInstanceToScreenInput(BaseModel):
    screen_id: str = Field(..., description="ID of the screen")
    instance_id: str = Field(..., description="ID of the component instance to add")

class RemoveComponentInstanceFromScreenInput(BaseModel):
    screen_id: str = Field(..., description="ID of the screen")
    instance_id: str = Field(..., description="ID of the component instance to remove")

class GetScreenContentsInput(BaseModel):
    screen_id: str = Field(..., description="ID of the screen to get contents for")

class GetComponentTypeUsageInput(BaseModel):
    type_id: str = Field(..., description="ID of the component type to check usage for")

class GetScreenDetailsInput(BaseModel):
    screen_id: str = Field(..., description="ID of the screen to get details for")

class GetComponentTypeDetailsInput(BaseModel):
    type_id: str = Field(..., description="ID of the component type to get details for")

class GetComponentInstanceUsageInput(BaseModel):
    instance_id: str = Field(..., description="ID of the component instance")

class IncrementInstanceUsageInput(BaseModel):
    instance_id: str = Field(..., description="The ID of the component instance to increment usage for.")

class BatchAddComponentInstancesToScreenInput(BaseModel):
    screen_id: str = Field(..., description="The ID of the screen.")
    instance_ids: List[str] = Field(..., description="List of component instance IDs to add.")

    @validator("instance_ids", pre=True)
    def parse_instance_ids(cls, v):
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            try:
                # Handles both "[...]" and "['...', ...]"
                return list(eval(v))
            except Exception as e:
                raise ValueError(f"Could not parse instance_ids string: {e}")
        return v

class BatchIncrementInstanceUsageInput(BaseModel):
    instance_ids: List[str] = Field(..., description="List of component instance IDs.")

    @validator("instance_ids", pre=True)
    def parse_instance_ids(cls, v):
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            try:
                return list(eval(v))
            except Exception as e:
                raise ValueError(f"Could not parse instance_ids string: {e}")
        return v

class BatchDeleteComponentInstancesInput(BaseModel):
    instance_ids: List[str] = Field(..., description="List of component instance IDs to delete.")

    @validator("instance_ids", pre=True)
    def parse_instance_ids(cls, v):
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            try:
                return list(eval(v))
            except Exception as e:
                raise ValueError(f"Could not parse instance_ids string: {e}")
        return v

class GetScreenFullDetailsInput(BaseModel):
    screen_id: str = Field(..., description="The ID of the screen to get full details for.")


class SemanticSearchInput(BaseModel):
    query: str = Field(..., description="The semantic search string.")
    filter_key: Optional[str] = Field(None, description="Metadata key to filter on (e.g., 'type_id', 'name').")
    filter_value: Optional[str] = Field(None, description="Value for the filter key.")
    k: Optional[int] = Field(5, description="Number of results to return (default 5).")


class AskHumanClarificationInput(BaseModel):
    question: str = Field(..., description="The clarification question to ask the human user.")