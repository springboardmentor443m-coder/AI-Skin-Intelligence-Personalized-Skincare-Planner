import { Bot, X } from 'lucide-react';

function ChatHeader({ onClose }) {
  return (
    <div className="chat-header">
      <div className="chat-header-brand">
        <div className="chat-avatar">
          <Bot size={18} />
        </div>
        <div>
          <h3>AI Skin Assistant</h3>
          <p>Powered by AI Skin Intelligence</p>
        </div>
      </div>
      <div className="chat-header-actions">
        <span className="status-pill">
          <span className="online-dot" />
          Online
        </span>
        <button type="button" className="close-button" onClick={onClose} aria-label="Close assistant">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

export default ChatHeader;
