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
  sources = []  # Track sources with page numbers

  try:

    for repo_id,repo_name in zip(request.repo_ids,request.repo_names):
      vector_store=get_vector_store(repo_id)
      docs=vector_store.similarity_search(query=request.query,k=3)
      
      if docs:
        response_repo_ids.append(repo_id)
        response_repo_names.append(repo_name)
        retrived_docs.extend(docs)
        
        # Extract source information from each document
        for doc in docs:
          source_info = {
            "source": doc.metadata.get("source", "Unknown"),
            "page": doc.metadata.get("page", "N/A"),
            "repo_name": repo_name
          }
          # Avoid duplicate sources
          if source_info not in sources:
            sources.append(source_info)
  except Exception as e:
    raise HTTPException(status_code=400,detail=str(e))
  

  context=get_context_string(retrived_docs)

  try: 
    response=llm_chain.invoke({
      "query":request.query,
      "context":context,
      "sources": sources  # Pass sources to the chain
    })

    # Append source information to response
    if sources:
      source_text = "\n\n**Sources:**\n"
      grouped_sources = {}
      
      # Group sources by file
      for src in sources:
        file_name = src["source"]
        page = src["page"]
        repo = src["repo_name"]
        
        key = f"{file_name} (Repository: {repo})"
        if key not in grouped_sources:
          grouped_sources[key] = []
        if page not in grouped_sources[key]:
          grouped_sources[key].append(page)
      
      # Format source list
      for file_info, pages in grouped_sources.items():
        pages_sorted = sorted(pages) if all(isinstance(p, int) for p in pages) else pages
        pages_str = ", ".join([f"Page {p}" for p in pages_sorted])
        source_text += f"- {file_info}: {pages_str}\n"
      
      response = response + source_text

    return ChatResponse(
      response=response,
      response_repo_ids=response_repo_ids,
      response_repo_names=response_repo_names
    )
  
  except Exception as e:
    raise HTTPException(status_code=400,detail=str(e))