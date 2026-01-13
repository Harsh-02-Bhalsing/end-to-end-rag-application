from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session
from schemas.chat import ChatRequest,ChatResponse
from core.vector_store import get_vector_store
from core.llm_context import get_context_string 
from core.chain import llm_chain
router=APIRouter(
  prefix="/ai",
  tags=["ai"]
)

@router.post("/chat",response_model=ChatResponse)
def ai_chat(
  request:ChatRequest
):
  chunks=[]
  user_id=request.user_id
  response_repo_ids=[]
  response_repo_names=[]
  retrived_docs=[]

  try:

    for repo_id,repo_name in zip(request.repo_ids,request.repo_names):
      vector_store=get_vector_store(repo_id)
      docs=vector_store.similarity_search(query=request.query,k=3)
      
      if docs:
        response_repo_ids.append(repo_id)
        response_repo_names.append(repo_name)
        retrived_docs.extend(docs)
  except Exception as e:
    raise HTTPException(status_code=400,detail=str(e))
  

  context=get_context_string(retrived_docs)

  try: 
    response=llm_chain.invoke({
      "query":request.query,
      "context":context
    })

    return ChatResponse(
      response=response,
      response_repo_ids=response_repo_ids,
      response_repo_names=response_repo_names
    )
  
  except Exception as e:
    raise HTTPException(status_code=400,detail=str(e))