from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from core.keys import GEMINI_API_KEY

# embeddings = GoogleGenerativeAIEmbeddings(
#     api_key=GEMINI_API_KEY,
#     model="gemini-embedding-001"
# )

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L12-v2")

#backup model =sentence-transformers/all-MiniLM-L12-v2 ,  sentence-transformers/all-mpnet-base-v2 , sentence-transformers/all-MiniLM-L6-v2