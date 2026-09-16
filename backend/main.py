import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models, database
from routers import auth, analyze
from dotenv import load_dotenv

load_dotenv()

# Create tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="AI Resume Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(analyze.router)

@app.get("/")
def root():
    return {"message": "Welcome to AI Resume Analyzer API"}
