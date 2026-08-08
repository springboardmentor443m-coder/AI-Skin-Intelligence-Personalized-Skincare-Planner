function TypingIndicator() {
  return (
    <div className="message-row message-row-assistant">
      <div className="message-bubble message-bubble-assistant typing-bubble" aria-live="polite">
        <div className="typing-indicator" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

export default TypingIndicator;
