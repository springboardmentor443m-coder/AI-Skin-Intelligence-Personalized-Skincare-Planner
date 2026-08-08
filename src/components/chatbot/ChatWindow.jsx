import { useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import ChatInput from './ChatInput';

function ChatWindow({ messages, isLoading, onClose, onRetry, input, setInput, onSend, disabled, analysisContext, quickActions, onQuickAction }) {
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="chat-window" role="dialog" aria-label="AI Skin Assistant">
      <ChatHeader onClose={onClose} />
      <div className="chat-body" ref={bodyRef}>
        {analysisContext?.condition ? (
          <div className="analysis-context-card">
            <p className="analysis-context-title">Latest skin analysis</p>
            <p className="analysis-context-line"><span>Condition</span> {analysisContext.condition}</p>
            <p className="analysis-context-line"><span>Confidence</span> {Math.round(Number(analysisContext.confidence || 0) * 100)}%</p>
            {analysisContext.recommendation ? <p className="analysis-context-line"><span>Recommendation</span> {analysisContext.recommendation}</p> : null}
          </div>
        ) : null}
        {quickActions?.length ? (
          <div className="quick-actions">
            {quickActions.map((action) => (
              <button key={action} type="button" className="quick-action" onClick={() => onQuickAction?.(action)}>
                {action}
              </button>
            ))}
          </div>
        ) : null}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} onRetry={() => onRetry(message)} />
        ))}
        {isLoading ? <TypingIndicator /> : null}
      </div>
      <ChatInput input={input} setInput={setInput} onSend={onSend} disabled={disabled} />
    </div>
  );
}

export default ChatWindow;
