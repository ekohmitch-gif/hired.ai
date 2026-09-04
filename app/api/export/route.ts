import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { renderToBuffer } from '@react-pdf/renderer';
import { ResumePdfDocument } from '@/lib/ResumePdfDocument';
import { computeCreditState } from '@/lib/credits';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Please sign in to download your resume.' }, { status: 401 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const { state } = computeCreditState(user);

    if (!state.isPro && state.credits <= 0) {
      return NextResponse.json(
        { error: "You've used all your downloads this week. Upgrade for unlimited." },
        { status: 402 }
      );
    }

    const { result, format } = await req.json();
    if (!result) {
      return NextResponse.json({ error: 'Missing resume data' }, { status: 400 });
    }

    const safeName = (result.fullName || 'resume').replace(/\s+/g, '_');

    let buffer: Buffer;
    let contentType: string;
    let filename: string;

    if (format === 'docx') {
      buffer = await buildDocx(result);
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      filename = `${safeName}.docx`;
    } else if (format === 'pdf') {
      buffer = await renderToBuffer(ResumePdfDocument({ result }));
      contentType = 'application/pdf';
      filename = `${safeName}.pdf`;
    } else {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }

    // Deduct only after the file was built successfully
    if (!state.isPro) {
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          ...user.publicMetadata,
          isPro: false,
          credits: state.credits - 1,
          creditsResetAt: state.creditsResetAt,
        },
      });
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json({ error: error?.message || 'Export failed' }, { status: 500 });
  }
}

async function buildDocx(result: any) {
  const children: Paragraph[] = [];

  children.push(new Paragraph({ text: result.fullName || 'Candidate Name', heading: HeadingLevel.TITLE }));
  children.push(new Paragraph({ children: [new TextRun({ text: result.contactInfo || '', italics: true })] }));

  if (result.summary) {
    children.push(new Paragraph({ text: 'Professional Summary', heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }));
    children.push(new Paragraph({ text: result.summary }));
  }

  if (result.skills?.length) {
    children.push(new Paragraph({ text: 'Core Competencies', heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }));
    children.push(new Paragraph({ text: result.skills.join(' | ') }));
  }

  if (result.experience?.length) {
    children.push(new Paragraph({ text: 'Professional Experience', heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }));
    result.experience.forEach((exp: any) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${exp.role || ''} — ${exp.company || ''}`, bold: true }),
            new TextRun({ text: `    ${exp.dates || ''}`, italics: true }),
          ],
          spacing: { before: 150 },
        })
      );
      (exp.bullets || []).forEach((bullet: string) => {
        children.push(new Paragraph({ text: bullet, bullet: { level: 0 } }));
      });
    });
  }

  if (result.education?.length) {
    children.push(new Paragraph({ text: 'Education', heading: HeadingLevel.HEADING_2, spacing: { before: 200 } }));
    result.education.forEach((edu: any) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${edu.degree || ''} — ${edu.institution || ''}`, bold: true }),
            new TextRun({ text: `    ${edu.dates || ''}`, italics: true }),
          ],
        })
      );
    });
  }

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}