import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { section, prompt, targetRole } = await req.json();

    if (!section || !prompt) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const systemPrompt = `You are an executive resume writer. Generate high-impact content for the '${section}' section of a resume. Target Role/Industry: ${targetRole || 'General Professional'}. Return clear, concise, actionable output without fluff.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
    });

    const output = completion.choices[0].message.content || '';
    return NextResponse.json({ output });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Generation failed' }, { status: 500 });
  }
}
