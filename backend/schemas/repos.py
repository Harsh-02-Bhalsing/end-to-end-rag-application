from pydantic import BaseModel,Field
from typing import List

class CreateRepoRequest(BaseModel):
  repo_name:str
  user_id:str

class CreateRepoResponse(BaseModel):
  repo_id:str
  repo_name:str
  user_id:str
  no_docs:int


class FileResponse(BaseModel):
  file_id: str
  file_name: str

        
class RepoResponse(BaseModel):
  repo_id: str
  repo_name: str
  no_docs: int
  files: List[FileResponse] = Field(default_factory=list)

  class Config:
      from_attributes = True

class GetRepositoriesResponse(BaseModel):
  repositories: List[RepoResponse]
