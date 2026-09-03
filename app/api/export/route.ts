import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { renderToBuffer } from '@react-pdf/renderer';
import { ResumePdfDocument } from '@/lib/ResumePdfDocument';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 });
    }

    const { result, format } = await req.json();
    if (!result) {
      return NextResponse.json({ error: 'Missing resume data' }, { status: 400 });
    }

    const safeName = (result.fullName || 'resume').replace(/\s+/g, '_');

    if (format === 'docx') {
      const buffer = await buildDocx(result);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${safeName}.docx"`,
        },
      });
    }

    if (format === 'pdf') {
      const buffer = await renderToBuffer(ResumePdfDocument({ result }));
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${safeName}.pdf"`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
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