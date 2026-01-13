from pydantic import BaseModel
from typing import List
class ChatRequest(BaseModel):
  user_id:str
  query:str
  repo_ids:List[str]
  repo_names:List[str]

class ChatResponse(BaseModel):
  response:str
  response_repo_ids:List[str]
  response_repo_names:List[str]
