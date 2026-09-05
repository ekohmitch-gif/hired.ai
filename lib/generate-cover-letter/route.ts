import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { resumeText, jobDescription, targetRole, fullName } = await req.json();

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
          content: `You are an expert cover letter writer. Write a compelling, tailored cover letter for the candidate based on their resume and the target job description.

STRICT INSTRUCTIONS:
1. Address the specific role and company/context implied by the job description (use "Hiring Manager" if no company name is given).
2. Mirror key language and requirements from the job description naturally, without sounding like a keyword list.
3. Highlight 2-3 of the candidate's most relevant, quantifiable achievements from their resume.
4. Keep it to 3-4 short paragraphs: opening hook, relevant experience/value, why this company/role, confident closing with a call to action.
5. Do NOT include a letterhead, date, or "Dear..." salutation — just the body paragraphs, separated by blank lines. The salutation and closing signature will be added separately.
6. Tone: professional, confident, warm — not stiff or generic.

Return ONLY the letter body text, no JSON, no markdown formatting.`,
        },
        {
          role: 'user',
          content: `Candidate name: ${fullName || 'the candidate'}\nTarget role: ${targetRole || 'the role described below'}\n\nResume:\n${resumeText}\n\nJob Description:\n${jobDescription}`,
        },
      ],
    });

    const letter = completion.choices[0].message.content || '';
    return NextResponse.json({ coverLetter: letter.trim() });
  } catch (error: any) {
    console.error('Cover letter generation error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate cover letter' },
      { status: 500 }
    );
  }
}