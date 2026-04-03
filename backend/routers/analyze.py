from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import schemas, database, models, auth
from services import parser, ai

router = APIRouter(prefix="/analyze", tags=["analyze"])

@router.post("/", response_model=schemas.ResumeAnalysis)
async def analyze_resume_endpoint(
    file: UploadFile = File(...),
    job_description: str = Form(None),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Determine file type
    if not file.filename.endswith(('.pdf', '.docx')):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")
    
    contents = await file.read()
    
    try:
        # Extract text
        if file.filename.endswith('.pdf'):
            text = parser.extract_text_from_pdf(contents)
        else:
            text = parser.extract_text_from_docx(contents)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")
        
    if not text.strip():
         raise HTTPException(status_code=400, detail="No extractable text found in file.")
         
    # Call AI Service
    analysis_result = ai.analyze_resume(text, job_description)
    
    import json
    # Save to db
    db_analysis = models.ResumeAnalysis(
        owner_id=current_user.id,
        filename=file.filename,
        job_description=job_description,
        match_score=analysis_result.get("match_score", 0.0),
        extracted_skills=json.dumps(analysis_result.get("extracted_skills", [])),
        missing_skills=json.dumps(analysis_result.get("missing_skills", [])),
        suggestions=json.dumps(analysis_result.get("suggestions", []))
    )
    
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)
    
    # Return formatted for schema (parse JSON lists)
    result = schemas.ResumeAnalysis(
        id=db_analysis.id,
        owner_id=db_analysis.owner_id,
        created_at=db_analysis.created_at,
        filename=db_analysis.filename,
        job_description=db_analysis.job_description,
        match_score=db_analysis.match_score,
        extracted_skills=json.loads(db_analysis.extracted_skills),
        missing_skills=json.loads(db_analysis.missing_skills),
        suggestions=json.loads(db_analysis.suggestions)
    )
    
    return result

@router.get("/", response_model=list[schemas.ResumeAnalysis])
def get_past_analyses(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    import json
    analyses = db.query(models.ResumeAnalysis).filter(models.ResumeAnalysis.owner_id == current_user.id).order_by(models.ResumeAnalysis.created_at.desc()).all()
    
    results = []
    for a in analyses:
         results.append(schemas.ResumeAnalysis(
            id=a.id,
            owner_id=a.owner_id,
            created_at=a.created_at,
            filename=a.filename,
            job_description=a.job_description,
            match_score=a.match_score,
            extracted_skills=json.loads(a.extracted_skills),
            missing_skills=json.loads(a.missing_skills),
            suggestions=json.loads(a.suggestions)
         ))
    return results
