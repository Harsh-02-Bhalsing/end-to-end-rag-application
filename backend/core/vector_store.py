# from core.embedding import embeddings
# from core.keys import CHROMA_CLOUD_KEY,CHROMA_TENANT_KEY
# from langchain_chroma import Chroma

# def get_vector_store(repo_id:str)->Chroma:
#   return Chroma(
#       collection_name=repo_id,
#       embedding_function=embeddings,
#       chroma_cloud_api_key=CHROMA_CLOUD_KEY,
#       tenant=CHROMA_TENANT_KEY,
#       database="End_to_End_RAG_App"
#     )

import os
from langchain_community.vectorstores import FAISS
from core.embedding import embeddings

BASE_VECTOR_PATH = "vector_stores"

os.makedirs(BASE_VECTOR_PATH, exist_ok=True)


def get_vector_store(repo_id: str):

    repo_path = os.path.join(BASE_VECTOR_PATH, repo_id)

    if os.path.exists(repo_path):
        return FAISS.load_local(
            repo_path,
            embeddings,
            allow_dangerous_deserialization=True
        )

    else:
        vector_store = FAISS.from_texts(
            ["initial document"],
            embedding=embeddings
        )

        vector_store.save_local(repo_path)
        return vector_store