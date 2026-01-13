from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

Base=declarative_base()

SQLALCHEMY_DB_URL="sqlite:///./RAG_APP.db"

engine=create_engine(
    SQLALCHEMY_DB_URL,connect_args={"check_same_thread":False}
)

SessionLocal=sessionmaker(
  autoflush=False,
  autocommit=False,
  bind=engine
)

def get_db():
  db=SessionLocal()
  try:
    yield db
  finally:
    db.close()
