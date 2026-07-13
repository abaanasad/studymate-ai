export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type Chat = {
  id: string;
  title: string;
  messages: ChatMessage[];
};