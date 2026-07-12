"use client";

import { useState } from "react";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `# 👋 Welcome to StudyMate AI!

**Your personal AI tutor for learning, coding, and exam preparation.**

### I can help you with:
- 📚 Explain difficult topics
- 💻 Programming & debugging
- 📝 Summarize notes
- ❓ Solve questions
- 📖 Prepare for exams
- 🎯 Give quick or detailed explanations

**Ask me anything to get started! 🚀**`,
    },
  ]);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!message.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: message,
    };

    const updatedMessages = [...messages, userMessage];

    // Show the user's message immediately
    setMessages(updatedMessages);
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "❌ Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex h-screen flex-col bg-black text-white">
      <ChatWindow
        messages={messages}
        loading={loading}
      />

      <ChatInput
        value={message}
        onChange={setMessage}
        onSend={sendMessage}
        loading={loading}
      />
    </main>
  );
}