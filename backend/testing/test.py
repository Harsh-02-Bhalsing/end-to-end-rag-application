from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings

import os

GEMINI_API_KEY=os.getenv("GOOGLE_API_KEY")
CHROMA_CLOUD_KEY=os.getenv("CHROMA_CLOUD_KEY_RAG_APP")
CHROMA_TENANT_KEY=os.getenv("CHROMA_TENANT_KEY_RAG_APP")

def chroma_collection_exists() -> bool:
    try:
        

        embeddings = GoogleGenerativeAIEmbeddings(
            api_key=GEMINI_API_KEY,
            model="gemini-embedding-001"
        )
        Chroma(
            collection_name="repo_9a7bb7b4",
            embedding_function=embeddings,
            chroma_cloud_api_key=CHROMA_CLOUD_KEY,
            tenant=CHROMA_TENANT_KEY
        )
        return True
    except Exception:
        return False

if chroma_collection_exists():
    print("✅ Vector store exists")
else:
    print("❌ Vector store NOT found")
