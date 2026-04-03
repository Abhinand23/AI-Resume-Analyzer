from pydantic import BaseModel
from typing import List, Optional
import datetime

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class ResumeAnalysisBase(BaseModel):
    filename: str
    job_description: Optional[str] = None
    match_score: float
    extracted_skills: List[str]
    missing_skills: List[str]
    suggestions: List[str]

class ResumeAnalysis(ResumeAnalysisBase):
    id: int
    owner_id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True
