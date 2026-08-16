// @ts-ignore
import pdfParse from 'pdf-parse-fixed';
import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse-fixed';
import mammoth from 'mammoth';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let extractedText = '';

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
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
      { error: error?.message || 'Failed to extract text from file' },
      { status: 500 }
    );
  }
}