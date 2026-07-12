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
  const chatRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chat = chatRef.current;

    if (!chat) return;

    const distanceFromBottom =
      chat.scrollHeight - chat.scrollTop - chat.clientHeight;

    // Auto-scroll only if user is already near the bottom
    if (distanceFromBottom < 150) {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div
      ref={chatRef}
      className="flex-1 overflow-y-auto px-6 py-8"
    >
      <div className="mx-auto max-w-4xl">
        {messages.map((message, index) => (
          <Message
            key={index}
            role={message.role}
            content={message.content}
          />
        ))}

        {loading && (
          <div className="mb-5 flex justify-start">
            <div className="rounded-2xl bg-zinc-800 px-5 py-4 shadow-lg">
              <p className="mb-3 text-xs font-semibold text-zinc-400">
                🤖 StudyMate AI
              </p>

              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-white"></div>

                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-white"
                    style={{ animationDelay: "0.15s" }}
                  ></div>

                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-white"
                    style={{ animationDelay: "0.30s" }}
                  ></div>
                </div>

                <span className="ml-2 text-sm text-zinc-300">
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