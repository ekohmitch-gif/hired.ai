import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { sql } from '@/lib/db';

async function requirePro(userId: string) {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return user.publicMetadata?.isPro === true;
}

// GET: list all applications for the signed-in user
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
    }

    const isPro = await requirePro(userId);
    if (!isPro) {
      return NextResponse.json(
        { error: 'Application tracking is a premium feature. Upgrade to unlock it.' },
        { status: 403 }
      );
    }

    const { rows } = await sql`
      SELECT a.id, a.company, a.job_link, a.status, a.created_at, a.updated_at,
             a.resume_id, r.title AS resume_title
      FROM applications a
      LEFT JOIN resumes r ON r.id = a.resume_id
      WHERE a.user_id = ${userId}
      ORDER BY a.updated_at DESC
    `;

    return NextResponse.json({ applications: rows });
  } catch (error: any) {
    console.error('Fetch applications error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to load applications' }, { status: 500 });
  }
}

// POST: create a new application entry
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
    }

    const isPro = await requirePro(userId);
    if (!isPro) {
      return NextResponse.json(
        { error: 'Application tracking is a premium feature. Upgrade to unlock it.' },
        { status: 403 }
      );
    }

    const { resumeId, company, jobLink, status } = await req.json();

    const { rows } = await sql`
      INSERT INTO applications (user_id, resume_id, company, job_link, status)
      VALUES (${userId}, ${resumeId || null}, ${company || null}, ${jobLink || null}, ${status || 'applied'})
      RETURNING id, resume_id, company, job_link, status, created_at, updated_at
    `;

    return NextResponse.json({ application: rows[0] });
  } catch (error: any) {
    console.error('Create application error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create application' }, { status: 500 });
  }
}

// PATCH: update status (e.g. mark as responded/rejected/interview)
export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
    }

    const isPro = await requirePro(userId);
    if (!isPro) {
      return NextResponse.json(
        { error: 'Application tracking is a premium feature. Upgrade to unlock it.' },
        { status: 403 }
      );
    }

    const { id, status, company, jobLink } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing application id' }, { status: 400 });
    }

    const { rows } = await sql`
      UPDATE applications
      SET status = COALESCE(${status}, status),
          company = COALESCE(${company}, company),
          job_link = COALESCE(${jobLink}, job_link),
          updated_at = now()
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id, resume_id, company, job_link, status, created_at, updated_at
    `;

    return NextResponse.json({ application: rows[0] });
  } catch (error: any) {
    console.error('Update application error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update application' }, { status: 500 });
  }
}

// DELETE: remove an application by id (?id=...)
export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing application id' }, { status: 400 });
    }

    await sql`
      DELETE FROM applications WHERE id = ${id} AND user_id = ${userId}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete application error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to delete application' }, { status: 500 });
  }
}