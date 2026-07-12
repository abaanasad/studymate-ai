"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!message.trim()) return;

    setLoading(true);
    setReply("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      setReply(data.reply);
    } catch {
      setReply("Something went wrong.");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center p-6">
      <h1 className="text-5xl font-bold mt-12 mb-8">
        StudyMate AI
      </h1>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask anything..."
        className="w-full max-w-3xl h-44 rounded-xl bg-zinc-900 border border-zinc-700 p-4 outline-none resize-none"
      />

      <button
        onClick={sendMessage}
        disabled={loading}
        className="mt-5 bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl font-semibold transition"
      >
        {loading ? "Thinking..." : "Send"}
      </button>

      {reply && (
        <div className="mt-8 w-full max-w-3xl bg-zinc-900 border border-zinc-700 rounded-xl p-6 leading-8 overflow-auto">
          <article className="prose prose-invert max-w-none">
            <ReactMarkdown>{reply}</ReactMarkdown>
          </article>
        </div>
      )}
    </main>
  );
}