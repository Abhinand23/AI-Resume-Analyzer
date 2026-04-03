from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    analyses = relationship("ResumeAnalysis", back_populates="owner")

class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String)
    job_description = Column(Text, nullable=True)
    match_score = Column(Float)
    extracted_skills = Column(Text) # JSON string
    missing_skills = Column(Text) # JSON string
    suggestions = Column(Text) # JSON string
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="analyses")
