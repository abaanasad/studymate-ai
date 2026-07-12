import Message from "./message";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatWindowProps = {
  messages: ChatMessage[];
};

export default function ChatWindow({ messages }: ChatWindowProps) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      <div className="mx-auto max-w-4xl">
        {messages.length === 0 ? (
          <div className="mt-24 text-center">
            <h1 className="text-5xl font-bold text-white">
              StudyMate AI
            </h1>

            <p className="mt-4 text-zinc-400">
              Ask anything and I'll help you understand it.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <Message
              key={index}
              role={msg.role}
              content={msg.content}
            />
          ))
        )}
      </div>
    </div>
  );
}