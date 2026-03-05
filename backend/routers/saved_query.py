from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.saved_query import SaveQueryRequest, SaveQueryResponse, GetSavedQueriesResponse
from db.database import get_db
from models.saved_query import db_saved_query
from models.users import db_user
import uuid
from datetime import datetime

router = APIRouter(
    prefix="/saved-queries",
    tags=["saved_queries"]
)

@router.post("/save", response_model=SaveQueryResponse)
def save_query(
    request: SaveQueryRequest,
    db: Session = Depends(get_db)
):
    """
    Save a query and its response for a user
    """
    # Verify user exists
    user = db.query(db_user).filter(db_user.user_id == request.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        # Generate unique query ID
        query_id = f"query_{uuid.uuid4().hex[:12]}"
        
        # Create new saved query
        new_query = db_saved_query(
            query_id=query_id,
            user_id=request.user_id,
            question=request.question,
            response=request.response,
            repo_names=request.repo_names,
            created_at=datetime.utcnow()
        )
        
        db.add(new_query)
        db.commit()
        db.refresh(new_query)
        
        return new_query
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/get-queries", response_model=GetSavedQueriesResponse)
def get_saved_queries(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Get all saved queries for a user, ordered by most recent first
    """
    # Verify user exists
    user = db.query(db_user).filter(db_user.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        # Get all saved queries for this user
        saved_queries = db.query(db_saved_query).filter(
            db_saved_query.user_id == user_id
        ).order_by(
            db_saved_query.created_at.desc()
        ).all()
        
        return GetSavedQueriesResponse(saved_queries=saved_queries)
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/delete/{query_id}")
def delete_query(
    query_id: str,
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Delete a saved query
    """
    # Verify user exists
    user = db.query(db_user).filter(db_user.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        # Find the query
        query = db.query(db_saved_query).filter(
            db_saved_query.query_id == query_id,
            db_saved_query.user_id == user_id
        ).first()
        
        if not query:
            raise HTTPException(status_code=404, detail="Query not found")
        
        db.delete(query)
        db.commit()
        
        return {"message": "Query deleted successfully", "query_id": query_id}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))