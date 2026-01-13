from fastapi import FastAPI
from db.database import Base,engine
from routers import login as login_router
from routers import sign_up as sign_up_router
from routers import repos as repos_router
from routers import Files as file_router
from routers import chat as chat_router
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
  return {
    "message":"server running successfully"
  }

app.include_router(login_router.router)
app.include_router(sign_up_router.router)
app.include_router(repos_router.router)
app.include_router(file_router.router)
app.include_router(chat_router.router)