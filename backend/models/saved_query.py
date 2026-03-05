from db.database import Base
from sqlalchemy import Column, String, ForeignKey, DateTime
from datetime import datetime

class db_saved_query(Base):
    __tablename__ = "saved_queries"

    query_id = Column(String, primary_key=True, index=True)
    user_id = Column(
        String,
        ForeignKey("users.user_id"),
        nullable=False
    )
    question = Column(String, nullable=False)
    response = Column(String, nullable=False)
    repo_names = Column(String, nullable=True)  # Comma-separated repository names
    created_at = Column(DateTime, default=datetime.utcnow)