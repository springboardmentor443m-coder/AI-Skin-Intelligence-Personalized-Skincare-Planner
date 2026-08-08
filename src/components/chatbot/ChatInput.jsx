import { Send } from 'lucide-react';

function ChatInput({ input, setInput, onSend, disabled }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSend();
  };

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <input
        type="text"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Ask anything about your skin..."
        disabled={disabled}
        aria-label="Chat message"
      />
      <button type="submit" disabled={disabled || !input.trim()}>
        <Send size={17} />
      </button>
    </form>
  );
}

export default ChatInput;
