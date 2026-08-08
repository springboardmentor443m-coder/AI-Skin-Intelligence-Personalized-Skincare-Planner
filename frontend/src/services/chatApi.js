const CHAT_API_URL = "http://127.0.0.1:8000/chat";

export async function sendChatMessage(
  recommendation,
  question
) {

  const response = await fetch(CHAT_API_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      recommendation: recommendation,
      question: question,
    }),
  });

  if (!response.ok) {

    const error = await response.text();

    throw new Error(
      error || "Chat request failed"
    );
  }

  return response;
}