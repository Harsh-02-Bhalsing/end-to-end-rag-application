from langchain_google_genai import ChatGoogleGenerativeAI
from core.keys import GEMINI_API_KEY

llm=ChatGoogleGenerativeAI(
    api_key=GEMINI_API_KEY,
    model="gemini-2.5-flash-lite"
)