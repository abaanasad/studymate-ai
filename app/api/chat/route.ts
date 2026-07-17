import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";
import { getPdf } from "@/lib/pdfStore";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: NextRequest) {
  try {
    const { messages, pdfId } = await req.json();

    const conversation = (messages as ChatMessage[])
      .map(
        (msg) =>
          `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
      .join("\n\n");
      const pdf = pdfId ? getPdf(pdfId) : null;
      console.log("PDF ID received:", pdfId);
console.log("PDF found:", !!pdf);

if (pdf) {
  console.log("PDF text length:", pdf.text.length);
}

    const prompt = `
You are StudyMate AI.

Rules:
- Never introduce yourself unless asked.
- If a PDF is provided, answer ONLY using the PDF whenever possible.
- If the answer isn't in the PDF, clearly say so.
- Keep answers concise.
- Use Markdown when helpful.

${
  pdf
    ? `PDF CONTENT:

${pdf.text}

--------------------------------`
    : ""
}

Conversation:

${conversation}

Assistant:
`;

   console.time("Gemini Response");

const stream = await ai.models.generateContentStream({
  model: "gemini-3-flash-preview",
  contents: prompt,
});

console.timeEnd("Gemini Response");
    const encoder = new TextEncoder();

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
             const text = chunk.text ?? "";

             console.log("Chunk:", text);

             if (text) {
               controller.enqueue(encoder.encode(text));
             }
            }

          console.log("Stream finished");

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
    console.error("Status:", error?.status);
    console.error("Message:", error?.message);
    console.error("Details:", error);
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