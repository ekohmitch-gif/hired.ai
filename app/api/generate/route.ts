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
          content: `You are an expert resume strategist and career coach. Tailor the user's resume bullet points to closely match the keywords and requirements in the target Job Description. Return your response ONLY in valid JSON with the following structure: {"fullName": "Name from resume", "summary": "Tailored 2-3 sentence professional summary", "skills": ["Skill 1", "Skill 2", "Skill 3"], "bulletPoints": ["Tailored impact bullet 1", "Tailored impact bullet 2"]}`,
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