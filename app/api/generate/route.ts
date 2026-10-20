import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { resumeText, jobDescription } = await req.json();

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: 'Missing resume text or job description' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an elite ATS optimization engine and resume writer. 
Analyze the user's uploaded Resume against the target Job Description. 

STRICT INSTRUCTIONS:
1. Target Job Title: Extract the exact job title from the Job Description and return it in "targetRoleTitle".
2. Mirror Language: Use exact keywords, technical terms, frameworks, and phrasing from the Job Description across the summary, skills, and experience.
3. Metrics — Use Only What Exists: Include a metric in a bullet ONLY when that exact number, percentage, dollar amount, or scale figure appears in the source resume. NEVER invent, estimate, or infer statistics, percentages, or outcomes that are not in the source resume. When the source resume has no metric for a responsibility, write a strong bullet led by a concrete action verb describing the work exactly as given — without adding any numbers.
4. Comprehensive Extraction: Do NOT omit any past work history, education, or projects found in the original resume. Extract and enhance all of them.

You MUST return your response ONLY in valid JSON matching this exact structure:
{
  "matchScore": 85,
  "targetRoleTitle": "Exact Position Title From Job Description",
  "fullName": "Full Name Extracted From Resume",
  "contactInfo": "Email | Location | Phone | LinkedIn | GitHub (as present in resume)",
  "summary": "High-impact 3-4 sentence professional summary tailored directly to the target role using exact keywords.",
  "skills": ["Exact Skill 1", "Exact Skill 2", "Exact Skill 3"],
  "experience": [
    {
      "role": "Job Title",
      "company": "Company Name | Location",
      "dates": "Start - End",
      "bullets": [
        "Tailored bullet point 1 mirroring job description language — include a metric only if that exact figure appears in the source resume",
        "Tailored bullet point 2 — never invent metrics, percentages, or outcomes"
      ]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "University / Institution Name",
      "dates": "Start - End"
    }
  ],
  "projects": [
    {
      "title": "Project Title",
      "role": "Role (e.g. Lead, Contributor)",
      "description": "Short description emphasizing relevant technologies and outcomes."
    }
  ],
  "hardSkills": {
    "matched": ["Skill 1", "Skill 2"],
    "missing": ["Skill 3", "Skill 4"]
  },
  "softSkills": {
    "matched": ["Skill 1"],
    "missing": ["Skill 2"]
  },
  "recruiterChecks": {
    "hasMeasurableResults": true,
    "wordCountCheck": "Ideal length (~450-600 words)",
    "formattingAlerts": []
  }
}`,
        },
        {
          role: 'user',
          content: `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error generating resume:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process resume' },
      { status: 500 }
    );
  }
}