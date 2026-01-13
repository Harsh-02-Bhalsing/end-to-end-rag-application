from fastapi import APIRouter,Depends,HTTPException
from schemas.sign_up import SignupRequest,SignupResponse
from sqlalchemy.orm import Session
from db.database import get_db
from models.users import db_user
router=APIRouter(
  prefix="/signup",
  tags=["sign up"]
)

@router.post("/",response_model=SignupResponse)
def sign_up_fun(
  request:SignupRequest,
  db:Session=Depends(get_db)
):
  user=db.query(db_user).filter(db_user.user_id==request.user_id).first()
  if not user:
    new_user=db_user(
      user_id=request.user_id,
      user_name=request.user_name,
      last_name=request.last_name,
      password=request.password   
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
  else:
    raise HTTPException(status_code=400,detail="user id already exist")