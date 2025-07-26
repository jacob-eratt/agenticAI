import uuid
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any 

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


#region: Flow to Screen Conversion Models
class AddComponentTypeInput(BaseModel):
    name: str = Field(..., description="Name of the component type (e.g., Button, Panel)")
    description: str = Field(..., description="Description of the component type")
    supported_props: Optional[List[str]] = Field(default_factory=list, description="List of supported prop names")

class EditComponentTypeInput(BaseModel):
    type_id: str = Field(..., description="ID of the component type to edit")
    new_name: Optional[str] = Field(None, description="New name for the component type")
    new_description: Optional[str] = Field(None, description="New description for the component type")
    new_supported_props: Optional[List[str]] = Field(None, description="New list of supported prop names")

class DeleteComponentTypeInput(BaseModel):
    type_id: str = Field(..., description="ID of the component type to delete")

class AddComponentInstanceInput(BaseModel):
    type_id: str = Field(..., description="ID of the component type to instantiate")
    props: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Props for this component instance")

class EditComponentInstanceInput(BaseModel):
    instance_id: str = Field(..., description="ID of the component instance to edit")
    new_props: Optional[Dict[str, Any]] = Field(None, description="New props for this component instance")

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
