import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
You are StudyMate AI.

You are a friendly AI tutor.

Always answer in clean Markdown.

Rules:
- Use headings.
- Use bullet points.
- Use **bold** text for important terms.
- Keep paragraphs short.
- Explain difficult concepts in simple language.
- Give examples whenever possible.

Question:
${message}
`,
    });

    return NextResponse.json({
      reply: response.text,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        reply: "Something went wrong. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}