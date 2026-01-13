from fastapi import APIRouter,HTTPException,UploadFile,File,Form,Depends
from sqlalchemy.orm import Session
from core.file_processing import process_txt,process_csv,process_pdf
from db.database import get_db
from models.repos import db_repo
from core.vector_store import get_vector_store
from models.users import db_user
router=APIRouter(
  prefix="/files",
  tags=["files"]
)

@router.post("/upload-file")
async def upload_file(
  file:UploadFile=File(...),
  repo_name:str=Form(...),
  repo_id:str=Form(...),
  user_id:str=Form(...),
  db:Session=Depends(get_db)
):
  user = db.query(db_user).filter(db_user.user_id == user_id).first()
  if not user:
    raise HTTPException(status_code=404, detail="User not found")
  

  extension=file.filename.split(".")[-1].lower()

  if extension not in {"txt","pdf","csv"}:
    raise HTTPException(
      status_code=400,
      detail="only txt,pdf and csv files are supported"
    )
  
  try:
    file_bytes=await file.read()
  except Exception:
    raise HTTPException(status_code=400,detail="Failed to load file")
  
  metadata={
    "repo_id":repo_id,
    "repo_name":repo_name,
    "user_id":user_id,
    "source":file.filename,
    "file_type":extension
  }

  try:
    if(extension=="txt"):
      documents=process_txt(file_bytes,metadata)
    elif(extension=="pdf"):
      documents=process_pdf(file_bytes,metadata)
    elif(extension=="csv"):
      documents=process_csv(file_bytes,metadata)

    vector_store=get_vector_store(repo_id)
    vector_store.add_documents(documents)

    repo=db.query(db_repo).filter(db_repo.user_id==user_id,db_repo.repo_id==repo_id).first()
    repo.no_docs=repo.no_docs+1
    db.commit()
    db.refresh(repo)

  except ValueError as e:
    raise HTTPException(status_code=400,detail=str(e))
  
  return {
    "success":True,
        "filename": file.filename,
        "repo_id": repo_id,
        "file_type": extension,
        "total_chunks": len(documents),
        "message": "Document processed successfully"
  }