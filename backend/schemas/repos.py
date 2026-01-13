from pydantic import BaseModel
from typing import List

class CreateRepoRequest(BaseModel):
  repo_name:str
  user_id:str

class CreateRepoResponse(BaseModel):
  repo_id:str
  repo_name:str
  user_id:str
  no_docs:int



class RepoResponse(BaseModel):
    repo_id: str
    repo_name: str
    no_docs: int

    class Config:
        from_attributes = True 

class GetRepositoriesResponse(BaseModel):
    repositories: List[RepoResponse]
