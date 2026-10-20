import { NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { isRateLimited } from '@/lib/rate-limit';

// Upload cap: resumes are a few pages, so 10 MB is generous headroom —
// and it stops a hostile upload from being read whole into function
// memory (critical review M7).
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

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
      // pdf-parse v2 (the maintained package in package.json). The old
      // pdf-parse-fixed fork rejected valid PDFs with "bad XRef entry"
      // (critical review C2).
      const parser = new PDFParse({ data: buffer });
      try {
        const pdfData = await parser.getText();
        extractedText = pdfData.text;
      } finally {
        await parser.destroy();
      }
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.docx')
    ) {
      const docResult = await mammoth.extractRawText({ buffer });
      extractedText = docResult.value;
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
    return NextResponse.json(
      { error: 'Something went wrong — please try again' },
      { status: 500 }
    );
  }
}
