#from langchain_google_genai import ChatGoogleGenerativeAI
from core.keys import GEMINI_API_KEY
from langchain_ollama import ChatOllama

llm = ChatOllama(
    model="phi3",
    temperature=0
)