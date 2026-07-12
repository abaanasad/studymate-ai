"use client";

import { useEffect, useRef } from "react";
import Message from "./message";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatWindowProps = {
  messages: ChatMessage[];
  loading: boolean;
};

export default function ChatWindow({
  messages,
  loading,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      <div className="mx-auto max-w-4xl">

        {messages.map((message, index) => (
          <Message
            key={index}
            role={message.role}
            content={message.content}
          />
        ))}

        {loading && (
          <div className="flex justify-start mb-5">
            <div className="rounded-2xl bg-zinc-800 px-5 py-4 shadow-lg">

              <p className="text-xs text-zinc-400 mb-3 font-semibold">
                🤖 StudyMate AI
              </p>

              <div className="flex items-center gap-2">

                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-white animate-bounce"></div>

                  <div
                    className="w-2 h-2 rounded-full bg-white animate-bounce"
                    style={{ animationDelay: "0.15s" }}
                  ></div>

                  <div
                    className="w-2 h-2 rounded-full bg-white animate-bounce"
                    style={{ animationDelay: "0.30s" }}
                  ></div>
                </div>

                <span className="text-zinc-300 text-sm ml-2">
                  Thinking...
                </span>

              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />

      </div>
    </div>
  );
}