"use client";

import ReactMarkdown from "react-markdown";

type MessageProps = {
  role: "user" | "assistant";
  content: string;
};

export default function Message({ role, content }: MessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={`mb-5 flex ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-lg transition-all duration-150 ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-zinc-800 text-white"
        }`}
      >
        {!isUser && (
          <p className="mb-2 text-xs font-semibold text-zinc-400">
            🤖 StudyMate AI
          </p>
        )}

        <div className="prose prose-invert max-w-none break-words">
          <ReactMarkdown>{content}</ReactMarkdown>

          {!isUser && (
            <span className="ml-1 inline-block animate-pulse text-zinc-400">
              ▋
            </span>
          )}
        </div>
      </div>
    </div>
  );
}