import { NextResponse } from 'next/server';
import { isRateLimited } from '@/lib/rate-limit';

// Upload cap: resumes are a few pages, so 10 MB is generous headroom —
// and it stops a hostile upload from being read whole into function
// memory (critical review M7).
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const GENERIC_ERROR = 'Something went wrong — please try again';

// PDF text extraction via unpdf, imported dynamically inside this
// function. Two reasons, both learned from a production outage:
//  1. The previous engine (pdf-parse v2 / pdfjs-dist) was statically
//     imported at module top level and needed an external worker file
//     at runtime; in Vercel's traced serverless bundle that worker
//     didn't survive, so the whole route module failed to LOAD and
//     every upload got a platform 500 with an empty body — before any
//     try/catch could run. unpdf ships a serverless pdfjs build with
//     no worker-file dependency.
//  2. With the import scoped to this branch, an engine load failure can
//     only ever fail PDF uploads — never the route module itself and
//     never DOCX.
async function extractPdfText(buffer: Buffer): Promise<string> {
  const { extractText, getDocumentProxy } = await import('unpdf');
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  // One-shot extraction in a short-lived function: no explicit teardown
  // (unpdf's PDFDocumentProxy type exposes no destroy()).
  const { text } = await extractText(pdf, { mergePages: true });
  return text;
}

// DOCX text extraction via mammoth, also dynamically imported inside
// the branch so its load state is independent of the PDF engine's.
async function extractDocxText(buffer: Buffer): Promise<string> {
  const mammoth = (await import('mammoth')).default;
  const docResult = await mammoth.extractRawText({ buffer });
  return docResult.value;
}

export async function POST(req: Request) {
  try {
    if (isRateLimited(req, 'parse', 30, 60_000)) {
      return NextResponse.json(
        { error: 'Too many uploads — please wait a minute and try again.' },
        { status: 429 }
      );
    }

    // Cheap pre-check on the declared body size: beyond this, the file
    // is definitely over the cap. (Also sidesteps Next's proxy body
    // truncation, which would otherwise corrupt bigger uploads before
    // the size check below could run.)
    const contentLength = Number(req.headers.get('content-length') || 0);
    if (contentLength > MAX_FILE_SIZE_BYTES + 16 * 1024) {
      return NextResponse.json(
        { error: 'That file is too large. Please upload a PDF or DOCX under 10 MB.' },
        { status: 413 }
      );
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        { error: 'Could not read that upload. Please try again with a PDF or DOCX.' },
        { status: 400 }
      );
    }
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'That file is too large. Please upload a PDF or DOCX under 10 MB.' },
        { status: 413 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let extractedText = '';

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      try {
        extractedText = await extractPdfText(buffer);
      } catch (error) {
        console.error('PDF parse error:', error);
        return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
      }
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.docx')
    ) {
      try {
        extractedText = await extractDocxText(buffer);
      } catch (error) {
        console.error('DOCX parse error:', error);
        return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
      }
    } else {
      return NextResponse.json(
        { error: 'Unsupported file format. Please upload PDF or DOCX.' },
        { status: 400 }
      );
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Could not extract text from document.' },
        { status: 422 }
      );
    }

    return NextResponse.json({ text: extractedText });
  } catch (error: any) {
    console.error('File parse error:', error);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
  }
}
