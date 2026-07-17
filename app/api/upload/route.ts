import { NextRequest, NextResponse } from "next/server";
import { extractPdfText } from "@/lib/pdfParser";
import { randomUUID } from "crypto";
import { savePdf } from "@/lib/pdfStore";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "No file uploaded.",
        },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        {
          success: false,
          message: "Please upload a PDF file.",
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    console.log("Buffer created:", buffer.length);
const text = await extractPdfText(buffer);
console.log("Extracted text length:", text.length);

if (!text.trim()) {
  return NextResponse.json(
    {
      success: false,
      message: "No readable text found in the PDF.",
    },
    { status: 400 }
  );
}
    const id = randomUUID();

savePdf({
  id,
  fileName: file.name,
  text,
  uploadedAt: new Date(),
});

   return NextResponse.json({
  success: true,
  document: {
    id,
    fileName: file.name,
    fileSize: file.size,
    textLength: text.length,
  },
});
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Upload failed.",
      },
      { status: 500 }
    );
  }
}