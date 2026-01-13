from core.embedding import embeddings
from core.keys import CHROMA_CLOUD_KEY,CHROMA_TENANT_KEY
from langchain_chroma import Chroma

def get_vector_store(repo_id:str)->Chroma:
  return Chroma(
      collection_name=repo_id,
      embedding_function=embeddings,
      chroma_cloud_api_key=CHROMA_CLOUD_KEY,
      tenant=CHROMA_TENANT_KEY,
      database="End_to_End_RAG_App"
    )