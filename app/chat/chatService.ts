export async function streamChatResponse(messages: any[]) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  });

  if (!res.body) {
    throw new Error("No response body");
  }

  return res.body.getReader();
}