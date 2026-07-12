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

      if (!res.body) {
        throw new Error("No response body");
      }

      // Create an empty assistant message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "",
        },
      ]);

      // Hide the "Thinking..." bubble once streaming begins
      setLoading(false);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let fullText = "";
      let displayedText = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        fullText += decoder.decode(value, { stream: true });

        while (displayedText.length < fullText.length) {
          displayedText += fullText[displayedText.length];

          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = {
              role: "assistant",
              content: displayedText,
            };
            return copy;
          });

          await new Promise((resolve) =>
            setTimeout(resolve, 10)
          );
        }
      }
    } catch (error) {
      console.error(error);

      setLoading(false);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Sorry, something went wrong.",
        },
      ]);
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