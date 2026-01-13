from fastapi import APIRouter, Depends, HTTPException, status
from schemas.login import LoginRequest, LoginResponse
from db.database import get_db
from models.users import db_user
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/login",
    tags=["login"]
)

@router.post("/", response_model=LoginResponse)
def user_login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(db_user).filter(
        db_user.user_id == request.user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if user.password != request.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    return user
