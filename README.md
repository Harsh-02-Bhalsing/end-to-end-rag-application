# End-to-End RAG Application 🚀

An **End-to-End Retrieval-Augmented Generation (RAG) Application** that allows users to create repositories, upload documents, vectorize them, and chat with an AI model using the uploaded knowledge base.

This project demonstrates how to build a **production-ready RAG system** with backend APIs, vector storage, and a frontend UI.

---

## ✨ Features

- 🔐 User-based repositories
- 📁 Upload documents (`.txt`, `.pdf`, `.csv`)
- 🧠 Automatic document chunking & vectorization
- 📦 Vector store per repository
- 💬 AI chat using repository-specific knowledge
- 📃 Track uploaded files per repository
- 🖥️ Interactive frontend UI
- ⚡ FastAPI backend with SQLAlchemy
- 🔑 Secure API key handling using environment variables

---

## 🛠 Tech Stack

### Backend
- **FastAPI**
- **SQLAlchemy**
- **SQLite**
- **LangChain**
- **Vector Store (Chroma / FAISS / equivalent)**
- **Python**

### Frontend
- **HTML**
- **CSS**
- **JavaScript**

---

Screenshots :

<img width="1914" height="912" alt="image" src="https://github.com/user-attachments/assets/570b5f69-97a7-43f9-8d07-246c0dac26db" />
<img width="1905" height="912" alt="image" src="https://github.com/user-attachments/assets/0d94a31f-997b-4d08-ab34-84573ecd7148" />
<img width="1905" height="907" alt="image" src="https://github.com/user-attachments/assets/c1d08f71-21aa-4dfc-bddb-f404bc7dc043" />
<img width="1906" height="910" alt="image" src="https://github.com/user-attachments/assets/6f074220-8d72-491a-96fe-afd1e0bb74cc" />
<img width="1913" height="898" alt="image" src="https://github.com/user-attachments/assets/4c481c84-d7f0-4889-83b2-9c77901d0565" />
<img width="1913" height="898" alt="image" src="https://github.com/user-attachments/assets/a8636ce2-13c3-4c44-9f18-8efb476491d8" />
<img width="1907" height="921" alt="image" src="https://github.com/user-attachments/assets/4017d804-3b9f-45d9-b6df-7a3dfe9fb291" />



🚀 How to Run the Project Locally

1️⃣ Clone the repository

git clone https://github.com/Harsh-02-Bhalsing/end-to-end-rag-application.git
cd end-to-end-rag-application

2️⃣ Backend Setup

cd backend
uv venv
uv pip install -r requirements.txt

Run the backend:
uvicorn main:app --reload

Backend will start at:
http://localhost:8000


3️⃣ Frontend Setup

Open the frontend HTML file directly:
frontend/html/index.html

🧠 How RAG Works (High Level)

User uploads documents

Documents are split into chunks

Chunks are converted into embeddings

Embeddings are stored in a vector database

User query retrieves relevant chunks

AI generates answers using retrieved context
