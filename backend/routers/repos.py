from fastapi import APIRouter,Depends,HTTPException
from models.repos import db_repo
from models.users import db_user
from schemas.repos import CreateRepoRequest,CreateRepoResponse,GetRepositoriesResponse
from db.database import get_db
from sqlalchemy.orm import Session
import uuid
from core.embedding import embeddings
from core.keys import CHROMA_CLOUD_KEY,CHROMA_TENANT_KEY
from langchain_chroma import Chroma
from core.vector_store import get_vector_store as create_vector_store


router=APIRouter(
  prefix="/repo",
  tags=["repo creation"]
)

@router.post("/create_repo",response_model=CreateRepoResponse)
def create_repo(
  request:CreateRepoRequest,
  db:Session=Depends(get_db)
):
  user = db.query(db_user).filter(db_user.user_id == request.user_id).first()
  if not user:
    raise HTTPException(status_code=404, detail="User not found")
  

  existing_repo = db.query(db_repo).filter(
      db_repo.repo_name == request.repo_name,
      db_repo.user_id == request.user_id
  ).first()

  if existing_repo:
    raise HTTPException(
      status_code=400,
      detail="Repository name already exists for this user"
    )
  
  try:
    unique_id = uuid.uuid4().hex[:8]
    repo_id = f"repo_{unique_id}"

    # verctor_store=Chroma(
    #   collection_name=repo_id,
    #   embedding_function=embeddings,
    #   chroma_cloud_api_key=CHROMA_CLOUD_KEY,
    #   tenant=CHROMA_TENANT_KEY,
    #   database="End_to_End_RAG_App"
    # )
    create_vector_store(repo_id)

    new_repo=db_repo(
      repo_id=repo_id,
      repo_name=request.repo_name,
      user_id=request.user_id,
      no_docs=0
    )
    db.add(new_repo)
    db.commit()
    db.refresh(new_repo)


    return new_repo
  
  except Exception as e:
    raise HTTPException(status_code=400,detail="something went wrong")
  
@router.get("/get-repositories",response_model=GetRepositoriesResponse)
def get_repos(
  user_id:str,
  db:Session=Depends(get_db)
):
  user=db.query(db_user).filter(db_user.user_id==user_id).first()
  if not user:
    raise HTTPException(status_code=400,detail="invalid user id")
  
  try:
    repos=db.query(db_repo).filter(db_repo.user_id==user_id).all()

    return GetRepositoriesResponse(
      repositories=repos
    )
  except Exception as e:
    raise HTTPException(status_code=400,detail="unexpedted error occur")