from db.database import Base
from sqlalchemy import Column, Integer, String, ForeignKey

class db_repo(Base):
    __tablename__ = "repos"

    repo_id = Column(String, primary_key=True, index=True)
    repo_name = Column(String, nullable=False)

    user_id = Column(
        String,
        ForeignKey("users.user_id"),
        nullable=False
    )

    no_docs = Column(Integer, default=0)
