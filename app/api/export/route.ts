import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { renderToBuffer } from '@react-pdf/renderer';
import { ResumePdfDocument, ResumeTemplate } from '@/lib/ResumePdfDocument';
import { CoverLetterPdfDocument } from '@/lib/CoverLetterPdfDocument';
import { computeCreditState } from '@/lib/credits';

// Upper bound on remembered charged documents per user (Clerk metadata
// stays small; 50 unique documents a week is far beyond normal use).
const MAX_CHARGED_DOCS = 50;

// Deterministic JSON with recursively sorted object keys, so the same
// document hashes identically regardless of key order in the request.
export function stableStringify(value: any): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`;
}

// Stable content hash of the document being exported (content only —
// not format or template: re-exporting the same document in another
// format is the same document for metering). For resumes the hash
// covers ONLY the fields the PDF/DOCX builders render. Analysis output
// (matchScore, recruiterChecks, skill-gap lists, targetRoleTitle) is
// volatile — re-scanning the identical resume can change it — and must
// not turn a re-download of the same document into a second charge.
export function exportDocHash(body: any, isCoverLetter: boolean): string {
  const payload = isCoverLetter
    ? {
        doc: 'cover',
        fullName: body.fullName || '',
        contactInfo: body.contactInfo || '',
        body: body.coverLetterBody || '',
      }
    : {
        doc: 'resume',
        fullName: body.result?.fullName || '',
        contactInfo: body.result?.contactInfo || '',
        summary: body.result?.summary || '',
        skills: body.result?.skills ?? null,
        experience: body.result?.experience ?? null,
        education: body.result?.education ?? null,
        projects: body.result?.projects ?? null,
      };
  return createHash('sha256').update(stableStringify(payload)).digest('hex').slice(0, 32);
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Please sign in to download.' }, { status: 401 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const { state } = computeCreditState(user);

    // NOTE: no balance gate here. The zero-balance 402 lives in the
    // charge block below, AFTER the content-hash dedupe — a document
    // already charged this week must re-download for free even at a
    // zero balance (review N3).
    const body = await req.json();
    const { format, docType } = body;
    const isCoverLetter = docType === 'coverLetter';

    // Validate everything BEFORE charging a credit, so a malformed
    // request never costs the user anything.
    if (format !== 'pdf' && format !== 'docx') {
      return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
    }
    if (!isCoverLetter && !body.result) {
      return NextResponse.json({ error: 'Missing resume data' }, { status: 400 });
    }

    // Premium-only: non-classic templates
    const template: ResumeTemplate = body.template === 'modern' || body.template === 'minimal'
      ? (state.isPro ? body.template : 'classic')
      : 'classic';

    // Metering fairness: one charge per unique DOCUMENT per credit
    // week — exporting the same resume as PDF and then DOCX (or
    // re-downloading it) is one document, not two (review M1). The
    // hash covers the document content only, not the format.
    const docHash = exportDocHash(body, isCoverLetter);

    // Charge the credit BEFORE generating the file, based on a fresh
    // re-read of the user's state (a stale read could over-credit after
    // a weekly reset or a concurrent change). If generation then fails,
    // the credit is restored below. Note: Clerk metadata has no atomic
    // compare-and-swap, so two requests racing inside the same instant
    // can still both pass the fresh read — this narrows the old
    // check-then-render-then-charge race (which spanned the entire
    // render) but does not eliminate it; true atomicity needs a
    // database transaction.
    let chargedBalance: number | null = null; // pre-charge balance, for refunds
    let chargedResetAt: string | null = null;
    let chargedNewDoc = false; // true when this request added the doc-hash entry
    if (!state.isPro) {
      const freshUser = await client.users.getUser(userId);
      const { state: freshState } = computeCreditState(freshUser);
      if (!freshState.isPro) {
        const week = freshState.creditsResetAt;
        const priorDocs: any[] = Array.isArray(freshUser.publicMetadata?.chargedDocs)
          ? freshUser.publicMetadata.chargedDocs
          : [];
        // Only entries from the current credit week count; older ones
        // are pruned on the next write.
        const weekDocs = priorDocs.filter(
          (e: any) => e && typeof e.h === 'string' && e.w === week
        );
        const alreadyCharged = weekDocs.some((e: any) => e.h === docHash);

        if (!alreadyCharged) {
          if (freshState.credits <= 0) {
            return NextResponse.json(
              { error: "You've used all your downloads this week. Upgrade for unlimited." },
              { status: 402 }
            );
          }
          await client.users.updateUserMetadata(userId, {
            publicMetadata: {
              // Spread preserves the freshly read isPro — never write
              // isPro here: hardcoding false could stomp a Pro upgrade
              // that lands mid-export (review N1).
              ...freshUser.publicMetadata,
              credits: freshState.credits - 1,
              creditsResetAt: freshState.creditsResetAt,
              // Bounded: newest 50 charged documents for this week.
              chargedDocs: [...weekDocs, { h: docHash, w: week }].slice(-MAX_CHARGED_DOCS),
            },
          });
          chargedBalance = freshState.credits;
          chargedResetAt = freshState.creditsResetAt;
          chargedNewDoc = true;
        }
      }
    }

    let buffer: Buffer;
    let contentType: string;
    let filename: string;

    try {
      if (isCoverLetter) {
        const { fullName, contactInfo, coverLetterBody } = body;
        const safeName = (fullName || 'cover_letter').replace(/\s+/g, '_');

        if (format === 'docx') {
          buffer = await buildCoverLetterDocx(fullName, contactInfo, coverLetterBody);
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          filename = `${safeName}_cover_letter.docx`;
        } else {
          buffer = await renderToBuffer(
            CoverLetterPdfDocument({ fullName, contactInfo, body: coverLetterBody })
          );
          contentType = 'application/pdf';
          filename = `${safeName}_cover_letter.pdf`;
        }
      } else {
        const { result } = body;
        const safeName = (result.fullName || 'resume').replace(/\s+/g, '_');

        if (format === 'docx') {
          buffer = await buildDocx(result, template);
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          filename = `${safeName}.docx`;
        } else {
          buffer = await renderToBuffer(ResumePdfDocument({ result, template }));
          contentType = 'application/pdf';
          filename = `${safeName}.pdf`;
        }
      }
    } catch (genError) {
      // Generation failed after the charge — put the credit back and
      // un-mark the document, so the user is exactly where they started.
      if (chargedBalance !== null) {
        try {
          const nowUser = await client.users.getUser(userId);
          const nowCredits =
            typeof nowUser.publicMetadata?.credits === 'number'
              ? (nowUser.publicMetadata.credits as number)
              : chargedBalance - 1;
          const nowDocs: any[] = Array.isArray(nowUser.publicMetadata?.chargedDocs)
            ? nowUser.publicMetadata.chargedDocs
            : [];
          await client.users.updateUserMetadata(userId, {
            publicMetadata: {
              // As with the charge write: preserve the freshly read
              // isPro via the spread, never hardcode it (review N1).
              ...nowUser.publicMetadata,
              credits: nowCredits + 1,
              creditsResetAt: chargedResetAt,
              chargedDocs: chargedNewDoc
                ? nowDocs.filter((e: any) => !(e && e.h === docHash && e.w === chargedResetAt))
                : nowDocs,
            },
          });
        } catch (restoreError) {
          console.error('Failed to restore credit after export failure:', restoreError);
        }
      }
      throw genError;
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Something went wrong — please try again' },
      { status: 500 }
    );
  }
}

// Per-template DOCX styling, mirroring lib/ResumePdfDocument's PDF
// themes (the DOCX builder used to ignore the selected template
// entirely — review L5).
const DOCX_THEMES: Record<ResumeTemplate, { font: string; nameColor: string; headingColor: string; contactColor: string }> = {
  classic: { font: 'Times New Roman', nameColor: '1A1A1A', headingColor: '92400E', contactColor: '404040' },
  modern: { font: 'Calibri', nameColor: '0F172A', headingColor: '0F172A', contactColor: 'B45309' },
  minimal: { font: 'Calibri', nameColor: '1E293B', headingColor: '64748B', contactColor: '64748B' },
};

async function buildDocx(result: any, template: ResumeTemplate = 'classic') {
  const theme = DOCX_THEMES[template] || DOCX_THEMES.classic;
  const sectionHeading = (text: string) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200 },
      children: [
        new TextRun({ text, bold: true, color: theme.headingColor, font: theme.font, size: 24 }),
      ],
    });

  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [
        new TextRun({
          text: result.fullName || 'Candidate Name',
          bold: true,
          color: theme.nameColor,
          font: theme.font,
          size: 36,
        }),
      ],
    })
  );
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: result.contactInfo || '', italics: true, color: theme.contactColor, font: theme.font }),
      ],
    })
  );

  if (result.summary) {
    children.push(sectionHeading('Professional Summary'));
    children.push(new Paragraph({ text: result.summary }));
  }

  if (result.skills?.length) {
    children.push(sectionHeading('Core Competencies'));
    children.push(new Paragraph({ text: result.skills.join('   •   ') }));
  }

  if (result.experience?.length) {
    children.push(sectionHeading('Professional Experience'));
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

  if (result.projects?.length) {
    children.push(sectionHeading('Projects'));
    result.projects.forEach((proj: any) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: proj.role ? `${proj.title || ''} — ${proj.role}` : proj.title || '',
              bold: true,
            }),
          ],
          spacing: { before: 150 },
        })
      );
      if (proj.description) {
        children.push(new Paragraph({ text: proj.description }));
      }
    });
  }

  if (result.education?.length) {
    children.push(sectionHeading('Education'));
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

  const doc = new Document({
    styles: { default: { document: { run: { font: theme.font } } } },
    sections: [{ children }],
  });
  return Packer.toBuffer(doc);
}

async function buildCoverLetterDocx(fullName: string, contactInfo: string, body: string) {
  const children: Paragraph[] = [];
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  children.push(new Paragraph({ text: fullName || 'Candidate Name', heading: HeadingLevel.HEADING_1 }));
  children.push(new Paragraph({ children: [new TextRun({ text: contactInfo || '', italics: true })] }));
  children.push(new Paragraph({ text: today, spacing: { before: 200, after: 200 } }));

  // The generator returns body paragraphs only — the salutation and
  // closing signature are added here, as its prompt intends.
  children.push(new Paragraph({ text: 'Dear Hiring Manager,', spacing: { after: 200 } }));

  const paragraphs = (body || '').split(/\n\s*\n/).filter(Boolean);
  paragraphs.forEach((p) => {
    children.push(new Paragraph({ text: p.trim(), spacing: { after: 200 } }));
  });

  children.push(new Paragraph({ text: 'Sincerely,', spacing: { before: 200 } }));
  children.push(new Paragraph({ text: fullName || '' }));

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBuffer(doc);
}
