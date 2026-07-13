import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import { setUploadedPdfText } from "@/lib/pdfStore";

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const data = await pdfParse(buffer);

    setUploadedPdfText(data.text);

    return NextResponse.json({
      success: true,
      fileName: file.name,
      pages: data.numpages,
      characters: data.text.length,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to read PDF.",
      },
      {
        status: 500,
      }
    );
  }
}