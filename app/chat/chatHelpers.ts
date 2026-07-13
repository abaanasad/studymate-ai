import { ChatMessage } from "./types";

export function createChatId() {
  return crypto.randomUUID();
}

export function generateChatTitle(
  messages: ChatMessage[]
) {
  const firstUser = messages.find(
    (m) => m.role === "user"
  );

  if (!firstUser) {
    return "New Chat";
  }

  const title = firstUser.content.trim();

  return title.length > 30
    ? title.slice(0, 30) + "..."
    : title;
}