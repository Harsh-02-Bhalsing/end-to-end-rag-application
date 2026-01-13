from pydantic import BaseModel

class SignupRequest(BaseModel):
  user_id:str
  user_name:str
  last_name:str
  password:str

class SignupResponse(BaseModel):
  user_id:str
  user_name:str
  last_name:str
  password:str

  class Config:
    from_attributes=True