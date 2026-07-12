import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const conversation = (messages as ChatMessage[])
      .map(
        (msg) =>
          `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
      .join("\n\n");

    const prompt = `
You are StudyMate AI.

Rules:
- Never introduce yourself unless the user asks who you are.
- Assume the welcome message has already been shown.
- Remember previous messages.
- Keep answers short by default.
- Give detailed answers only when asked.
- Use Markdown.

Conversation:

${conversation}

Assistant:
`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return NextResponse.json({
      reply: response.text,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        reply: "❌ Something went wrong. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}