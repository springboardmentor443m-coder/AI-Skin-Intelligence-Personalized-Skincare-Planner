import { useState } from "react";
import { sendChatMessage } from "../../services/chatApi";

function ChatBox({ recommendation }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: trimmedQuestion,
      },
    ]);

    setQuestion("");
    setLoading(true);

    // Empty assistant message.
    // Streaming chunks will be added to this message.
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "",
      },
    ]);

    try {
      const response = await sendChatMessage(
        recommendation,
        trimmedQuestion
      );

      if (!response.body) {
        throw new Error(
          "Streaming response body is not available."
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, {
          stream: true,
        });

        setMessages((prev) => {
          const updatedMessages = [...prev];

          const lastIndex = updatedMessages.length - 1;

          updatedMessages[lastIndex] = {
            ...updatedMessages[lastIndex],
            content:
              updatedMessages[lastIndex].content + chunk,
          };

          return updatedMessages;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);

      setMessages((prev) => {
        const updatedMessages = [...prev];

        const lastIndex = updatedMessages.length - 1;

        updatedMessages[lastIndex] = {
          ...updatedMessages[lastIndex],
          content:
            "Sorry, I couldn't generate a response. Please try again.",
        };

        return updatedMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="chat-box">

      {/* Header */}
      <div className="chat-header">
        <div>
          <h2>Chat About Your Recommendation</h2>

          <p>
            Ask questions about your skincare routine,
            products, diet, or lifestyle recommendations.
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">

        {messages.length === 0 && (
          <div className="chat-empty">
            <p>
              Have a question about your recommendation?
            </p>

            <span>
              Try asking why a particular product or
              routine step was recommended.
            </span>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat-message ${
              message.role === "user"
                ? "user-message"
                : "assistant-message"
            }`}
          >
            <div className="message-label">
              {message.role === "user" ? "You" : "AI"}
            </div>

            <div className="message-content">
              {message.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-status">
            AI is thinking...
          </div>
        )}

      </div>

      {/* Input */}
      <form
        className="chat-input-form"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          value={question}
          onChange={(e) =>
            setQuestion(e.target.value)
          }
          placeholder="Ask about your recommendation..."
          disabled={loading}
        />

        <button
          type="submit"
          disabled={
            loading || !question.trim()
          }
        >
          {loading ? "..." : "Send"}
        </button>
      </form>

    </section>
  );
}

export default ChatBox;