from db.database import Base
from sqlalchemy import Column,String

class db_user(Base):
  __tablename__="users"

  user_id=Column(String,primary_key=True,index=True)
  user_name=Column(String,nullable=False)
  last_name=Column(String)
  password=Column(String,nullable=False)


