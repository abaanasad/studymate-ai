import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";

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
- Never introduce yourself unless the user asks.
- Assume the welcome message has already been shown.
- Remember previous messages.
- Answer directly.
- Keep answers short unless the user asks for more detail.
- Use Markdown when helpful.

Conversation:

${conversation}

Assistant:
`;

    const stream = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const encoder = new TextEncoder();

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const text = chunk.text ?? "";

              console.log("Chunk:", text);

              controller.enqueue(encoder.encode(text));
            }

            controller.close();
          } catch (err) {
            controller.error(err);
          }
        },
      }),
      {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      }
    );
  } catch (error: any) {
    console.error("========== GEMINI ERROR ==========");
    console.error(error);
    console.error("=================================");

    let message = "❌ Something went wrong.";

    if (error?.status === 429) {
      message =
        "⚠️ StudyMate AI has reached the Gemini API limit. Please wait a few minutes and try again.";
    } else if (error?.status === 401) {
      message = "❌ Invalid Gemini API key.";
    } else if (error?.status === 403) {
      message = "❌ Gemini API access denied.";
    }

    return new Response(message, {
      status: error?.status || 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }
}