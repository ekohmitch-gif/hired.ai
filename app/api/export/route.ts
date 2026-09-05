import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { renderToBuffer } from '@react-pdf/renderer';
import { ResumePdfDocument, ResumeTemplate } from '@/lib/ResumePdfDocument';
import { CoverLetterPdfDocument } from '@/lib/CoverLetterPdfDocument';
import { computeCreditState } from '@/lib/credits';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Please sign in to download.' }, { status: 401 });
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

    const body = await req.json();
    const { format, docType } = body;
    const isCoverLetter = docType === 'coverLetter';

    // Premium-only: non-classic templates
    const template: ResumeTemplate = body.template === 'modern' || body.template === 'minimal'
      ? (state.isPro ? body.template : 'classic')
      : 'classic';

    let buffer: Buffer;
    let contentType: string;
    let filename: string;

    if (isCoverLetter) {
      const { fullName, contactInfo, coverLetterBody } = body;
      const safeName = (fullName || 'cover_letter').replace(/\s+/g, '_');

      if (format === 'docx') {
        buffer = await buildCoverLetterDocx(fullName, contactInfo, coverLetterBody);
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        filename = `${safeName}_cover_letter.docx`;
      } else if (format === 'pdf') {
        buffer = await renderToBuffer(
          CoverLetterPdfDocument({ fullName, contactInfo, body: coverLetterBody })
        );
        contentType = 'application/pdf';
        filename = `${safeName}_cover_letter.pdf`;
      } else {
        return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
      }
    } else {
      const { result } = body;
      if (!result) {
        return NextResponse.json({ error: 'Missing resume data' }, { status: 400 });
      }
      const safeName = (result.fullName || 'resume').replace(/\s+/g, '_');

      if (format === 'docx') {
        buffer = await buildDocx(result);
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        filename = `${safeName}.docx`;
      } else if (format === 'pdf') {
        buffer = await renderToBuffer(ResumePdfDocument({ result, template }));
        contentType = 'application/pdf';
        filename = `${safeName}.pdf`;
      } else {
        return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
      }
    }

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
    children.push(new Paragraph({ text: result.skills.join('   •   ') }));
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

async function buildCoverLetterDocx(fullName: string, contactInfo: string, body: string) {
  const children: Paragraph[] = [];
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  children.push(new Paragraph({ text: fullName || 'Candidate Name', heading: HeadingLevel.HEADING_1 }));
  children.push(new Paragraph({ children: [new TextRun({ text: contactInfo || '', italics: true })] }));
  children.push(new Paragraph({ text: today, spacing: { before: 200, after: 200 } }));

  const paragraphs = (body || '').split(/\n\s*\n/).filter(Boolean);
  paragraphs.forEach((p) => {
    children.push(new Paragraph({ text: p.trim(), spacing: { after: 200 } }));
  });

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}