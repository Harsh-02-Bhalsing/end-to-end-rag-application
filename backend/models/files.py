from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from db.database import Base

class db_files(Base):
    __tablename__ = "files"

    file_id = Column(String, primary_key=True, index=True)

    # Original uploaded file name
    file_name = Column(String, nullable=False)

    # Repository this file belongs to
    repo_id = Column(String, ForeignKey("repos.repo_id"), nullable=False)

    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())