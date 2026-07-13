import { ChatMessage } from "./types";

export function generateChatTitle(
  messages: ChatMessage[]
) {
  const firstUserMessage = messages.find(
    (msg) => msg.role === "user"
  );

  if (!firstUserMessage) {
    return "New Chat";
  }

  return firstUserMessage.content.length > 30
    ? firstUserMessage.content.slice(0, 30) + "..."
    : firstUserMessage.content;
}