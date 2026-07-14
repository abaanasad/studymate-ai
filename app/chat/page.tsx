"use client";
import { motion } from "framer-motion";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";

import { Chat, ChatMessage } from "./types";
import { welcomeMessage } from "./constants";

export default function ChatPage() {
 const [messages, setMessages] = useState<ChatMessage[]>([
  welcomeMessage,
]);

const [chats, setChats] = useState<Chat[]>([
  {
    id: "current",
    title: "Current Chat",
    messages: [welcomeMessage],
  },
]);

const [currentChatId, setCurrentChatId] = useState("current");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
  const savedChats = localStorage.getItem("studymate-chats");

  if (savedChats) {
    try {
      const parsedChats: Chat[] = JSON.parse(savedChats);

      setChats(parsedChats);

      if (parsedChats.length > 0) {
        setCurrentChatId(parsedChats[0].id);
      }
    } catch (error) {
      console.error("Failed to load chats:", error);
    }
  }
  setLoaded(true);
}, []);
  useEffect(() => {
  if (!loaded) return;

  localStorage.setItem(
    "studymate-chats",
    JSON.stringify(chats)
  );
}, [chats, loaded]);

  function handleNewChat() {
  const newId = `chat-${Date.now()}`;

  const chatNumber = chats.length + 1;

  setChats((prev) => [
    ...prev,
    {
      id: newId,
      title: `New Chat ${chatNumber}`,
      messages: [],
    },
  ]);

  setCurrentChatId(newId);
  setMessage("");
  setLoading(false);
}

  async function sendMessage() {
    if (!message.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: message,
    };

    const currentChat = chats.find(
     (chat) => chat.id === currentChatId
    );

    if (!currentChat) return;

    const updatedMessages = [
     ...currentChat.messages,
     userMessage,
    ];

    setChats((prev) =>
  prev.map((chat) => {
    if (chat.id !== currentChatId) return chat;

    return {
      ...chat,
      title:
        chat.messages.length === 0
          ? userMessage.content.slice(0, 30)
          : chat.title,
      messages: updatedMessages,
    };
  })
);
    setMessage("");
    setLoading(true);

    try {
      console.log("Sending request...");
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });
      console.log("Response status:", res.status);

      if (!res.body) {
        throw new Error("No response body");
      }

      setChats((prev) =>
  prev.map((chat) =>
    chat.id === currentChatId
      ? {
          ...chat,
          messages: [
            ...chat.messages,
            {
              role: "assistant",
              content: "",
            },
          ],
        }
      : chat
  )
);

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

          setChats((prev) =>
  prev.map((chat) => {
    if (chat.id !== currentChatId) return chat;

    const updated = [...chat.messages];

    updated[updated.length - 1] = {
      role: "assistant",
      content: displayedText,
    };

    return {
      ...chat,
      messages: updated,
    };
  })
);

await new Promise((resolve) =>
  setTimeout(resolve, 1)
);
        }
      }
    } catch (error) {
  console.error(error);

  setLoading(false);

  setChats((prev) =>
    prev.map((chat) =>
      chat.id === currentChatId
        ? {
            ...chat,
            messages: [
              ...chat.messages,
              {
                role: "assistant",
                content: "❌ Sorry, something went wrong.",
              },
            ],
          }
        : chat
    )
  );
}
  }

  return (
    <motion.main
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
  className="flex h-screen bg-black text-white"
>
      <Sidebar
  chats={chats}
  currentChatId={currentChatId}
  onSelectChat={setCurrentChatId}
  onNewChat={handleNewChat}
  onDeleteChat={() => {}}
/>

      <div className="flex flex-1 flex-col">
        <ChatWindow
        messages={
        chats.find((chat) => chat.id === currentChatId)?.messages ??
        [welcomeMessage]
        }
        loading={loading}
       />

        <ChatInput
          value={message}
          onChange={setMessage}
          onSend={sendMessage}
          loading={loading}
        />
      </div>
    </motion.main>
  );
}