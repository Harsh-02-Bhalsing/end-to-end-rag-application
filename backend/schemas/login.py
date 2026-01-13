from pydantic import BaseModel

class LoginRequest(BaseModel):
  user_id:str
  password:str

class LoginResponse(BaseModel):
  user_id:str
  user_name:str
  last_name:str
  password:str

  class Config:
    from_attributes=True