import json

def get_candidate_evaluation_prompt(candidate_data: str) -> str:
    return f"""You are a Principal Technical Recruiter and Staff Engineer at a top-tier tech company.
Your task is to evaluate a candidate based on their aggregated profile data, which includes resume parsing results, AI interview scores, and coding arena performance.

Candidate Data:
{candidate_data}

Based on this data, provide a comprehensive evaluation generating:
- A holistic Candidate Score (0-100)
- Technical Score (0-100)
- Communication Score (0-100)
- Behavioral Score (0-100)
- System Design Score (0-100)
- Coding Score (0-100)
- Culture Fit Estimate (0-100)
- A definitive Hiring Recommendation (e.g., "Strong Hire", "Hire", "Leaning Hire", "No Hire")
- Risk Analysis (2-3 sentences on potential risks or red flags)
- Improvement Areas (3 actionable areas for the candidate to work on)

Be objective, critical, and base your evaluation strictly on the provided data.
"""
