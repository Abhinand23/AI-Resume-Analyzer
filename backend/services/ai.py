import os
import json
import re
from openai import OpenAI

COMMON_SKILLS = {
    "python", "javascript", "react", "node", "node.js", "java", "c++", "c#", "aws", "docker",
    "kubernetes", "sql", "nosql", "mongodb", "postgresql", "fastapi", "django",
    "flask", "html", "css", "typescript", "git", "linux", "agile", "scrum",
    "machine learning", "data science", "nlp", "leadership", "communication"
}

def _heuristic_analyze(resume_text: str, job_description: str = None) -> dict:
    resume_lower = resume_text.lower()
    jd_lower = job_description.lower() if job_description else ""
    
    extracted = set()
    for skill in COMMON_SKILLS:
        if re.search(r'\b' + re.escape(skill) + r'\b', resume_lower):
            extracted.add(skill)
            
    jd_skills = set()
    if jd_lower:
        for skill in COMMON_SKILLS:
            if re.search(r'\b' + re.escape(skill) + r'\b', jd_lower):
                jd_skills.add(skill)
                
    missing = jd_skills - extracted if jd_skills else set()
    
    if jd_skills:
        match_score = (len(extracted.intersection(jd_skills)) / len(jd_skills)) * 100
    else:
        skill_score = min(len(extracted) * 5, 60)
        length_score = min(len(resume_text) / 100, 40)
        match_score = skill_score + length_score
        
    suggestions = []
    if len(resume_text) < 500:
        suggestions.append("Your resume seems very short. Consider adding more detail to your work experience.")
    if missing:
        missing_list = list(missing)
        top_missing = [s.title() for i, s in enumerate(missing_list) if i < 3]
        suggestions.append(f"Consider highlighting experience with: {', '.join(top_missing)}.")
    if not extracted:
        suggestions.append("We couldn't clearly identify technical skills. Try adding a dedicated skills section.")
    if len(suggestions) < 3:
        suggestions.append("Add more quantifiable achievements using metrics and numbers to highlight your impact.")
        
    return {
        "match_score": min(int(match_score), 100),
        "extracted_skills": sorted([s.title() for s in extracted]),
        "missing_skills": sorted([s.title() for s in missing]),
        "suggestions": suggestions
    }


# Initialize client if key is present
api_key = os.environ.get("OPENAI_API_KEY")
client = OpenAI(api_key=api_key) if api_key else None

def analyze_resume(resume_text: str, job_description: str = None) -> dict:
    if not client:
        return _heuristic_analyze(resume_text, job_description)
    
    system_prompt = "You are an expert ATS and resume analyzer. Return ONLY a valid JSON object. Do not wrap it in markdown block quotes."
    
    prompt = f"Analyze the following resume.\n\nResume:\n{resume_text}\n"
    if job_description:
        prompt += f"\nJob Description:\n{job_description}\n"
    
    prompt += """
    Extract the following details and format as JSON:
    {
      "match_score": float (0-100 indicating match quality or general resume strength if no JD),
      "extracted_skills": string list (skills found in resume),
      "missing_skills": string list (skills missing compared to JD or standard industry expectations),
      "suggestions": string list (actionable improvements)
    }
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        result = json.loads(response.choices[0].message.content)
        return result
    except Exception as e:
        print(f"Error in LLM call: {e}")
        return {
            "match_score": 50.0,
            "extracted_skills": ["Unknown"],
            "missing_skills": ["Error reading AI response"],
            "suggestions": [str(e)]
        }
