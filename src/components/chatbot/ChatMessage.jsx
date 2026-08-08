function ChatMessage({ message, onRetry }) {
  const isUser = message.role === 'user';
  const isError = Boolean(message.error);

  return (
    <div className={`message-row ${isUser ? 'message-row-user' : 'message-row-assistant'}`}>
      <div className={`message-bubble ${isUser ? 'message-bubble-user' : 'message-bubble-assistant'} ${isError ? 'message-bubble-error' : ''}`}>
        <p>{message.content}</p>
        <span className="message-time">{message.timestamp}</span>
        {isError && onRetry ? (
          <button type="button" className="retry-button" onClick={onRetry}>
            Retry
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default ChatMessage;
