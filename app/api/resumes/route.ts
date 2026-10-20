import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';

// GET: list all resumes for the signed-in user
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
    }

    const { rows } = await sql`
      SELECT id, title, data, created_at, updated_at
      FROM resumes
      WHERE user_id = ${userId}
      ORDER BY updated_at DESC
    `;

    return NextResponse.json({ resumes: rows });
  } catch (error: any) {
    console.error('Fetch resumes error:', error);
    return NextResponse.json({ error: 'Something went wrong — please try again' }, { status: 500 });
  }
}

// POST: save a new resume
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
    }

    const { title, data } = await req.json();
    if (!title || !data) {
      return NextResponse.json({ error: 'Missing title or resume data' }, { status: 400 });
    }

    const { rows } = await sql`
      INSERT INTO resumes (user_id, title, data)
      VALUES (${userId}, ${title}, ${JSON.stringify(data)})
      RETURNING id, title, data, created_at, updated_at
    `;

    return NextResponse.json({ resume: rows[0] });
  } catch (error: any) {
    console.error('Save resume error:', error);
    return NextResponse.json({ error: 'Something went wrong — please try again' }, { status: 500 });
  }
}

// DELETE: remove a resume by id (?id=...)
export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing resume id' }, { status: 400 });
    }

    await sql`
      DELETE FROM resumes WHERE id = ${id} AND user_id = ${userId}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete resume error:', error);
    return NextResponse.json({ error: 'Something went wrong — please try again' }, { status: 500 });
  }
}