import uuid
from pydantic import BaseModel, Field
from typing import Optional, List


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