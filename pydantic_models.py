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
