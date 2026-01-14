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

## 📂 Project Structure

End_to_End_RAG_Application/
│
├── backend/
│ ├── routers/
│ ├── models/
│ ├── core/
│ ├── db/
│ ├── main.py
│ └── requirements.txt
│
├── frontend/
│ ├── html/
│ ├── css/
│ └── js/
│
└── README.md

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
