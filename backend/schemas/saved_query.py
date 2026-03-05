from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class SaveQueryRequest(BaseModel):
    user_id: str
    question: str
    response: str
    repo_names: Optional[str] = None  # Comma-separated repository names

class SaveQueryResponse(BaseModel):
    query_id: str
    user_id: str
    question: str
    response: str
    repo_names: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class GetSavedQueriesResponse(BaseModel):
    saved_queries: List[SaveQueryResponse]