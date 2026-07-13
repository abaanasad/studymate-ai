"use client";

import { useState } from "react";

import { Chat, ChatMessage } from "../chat/types";
import { welcomeMessage } from "../chat/constants";
import {
  createChatId,
  generateChatTitle,
} from "../chat/chatHelpers";

export function useChatManager() {
  const [chats, setChats] = useState<Chat[]>([
    {
      id: createChatId(),
      title: "New Chat",
      messages: [welcomeMessage],
    },
  ]);

  const [currentChatId, setCurrentChatId] = useState(
    chats[0].id
  );

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const currentChat =
    chats.find((chat) => chat.id === currentChatId)!;

  function newChat() {
    const chat: Chat = {
      id: createChatId(),
      title: "New Chat",
      messages: [welcomeMessage],
    };

    setChats((prev) => [...prev, chat]);
    setCurrentChatId(chat.id);
    setMessage("");
  }

  function selectChat(id: string) {
    setCurrentChatId(id);
  }

  function updateCurrentChat(messages: ChatMessage[]) {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChatId
          ? {
              ...chat,
              title: generateChatTitle(messages),
              messages,
            }
          : chat
      )
    );
  }

  return {
    chats,
    currentChat,
    currentChatId,

    message,
    setMessage,

    loading,
    setLoading,

    newChat,
    selectChat,

    updateCurrentChat,
  };
}