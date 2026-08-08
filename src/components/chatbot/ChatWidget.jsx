import { useEffect, useState } from 'react';
import { MessageCircleMore } from 'lucide-react';
import ChatWindow from './ChatWindow';
import './chatbot.css';
import { buildChatWelcomeMessage, loadSkinAnalysisContext, serializeChatContext, SKIN_ANALYSIS_CONTEXT_EVENT } from '../../utils/chatbotContext';

const createMessage = (role, content, error = false, retryText = '') => ({
  id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  role,
  content,
  timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
  error,
  retryText,
});

function ChatWidget() {
  const chatUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/chat` : '/chat';
  const [isOpen, setIsOpen] = useState(false);
  const [analysisContext, setAnalysisContext] = useState(() => loadSkinAnalysisContext());
  const [messages, setMessages] = useState(() => [
    createMessage('assistant', buildChatWelcomeMessage(loadSkinAnalysisContext())),
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [retryText, setRetryText] = useState('');

  useEffect(() => {
    const handleAnalysisContextChange = () => {
      const nextContext = loadSkinAnalysisContext();
      setAnalysisContext(nextContext);
      setMessages((prev) => {
        if (!prev.length) return prev;
        const nextMessage = buildChatWelcomeMessage(nextContext);
        return prev.map((message, index) => (index === 0 && message.role === 'assistant' ? { ...message, content: nextMessage } : message));
      });
    };

    window.addEventListener(SKIN_ANALYSIS_CONTEXT_EVENT, handleAnalysisContextChange);
    return () => window.removeEventListener(SKIN_ANALYSIS_CONTEXT_EVENT, handleAnalysisContextChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (!event.target.closest('.chat-widget')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const sendMessage = async (messageText = input) => {
    const text = messageText.trim();
    if (!text || isLoading) return;

    const userMessage = createMessage('user', text);
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setRetryText(text);
    setIsLoading(true);

    try {
      const response = await fetch(chatUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: serializeChatContext(analysisContext),
        }),
      });

      let data = null;
      const responseText = await response.text();

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          data = { detail: responseText };
        }
      }

      if (!response.ok) {
        const backendMessage = data?.detail || data?.message || 'The assistant service returned an error.';
        throw new Error(backendMessage);
      }

      setMessages((prev) => [
        ...prev,
        createMessage('assistant', data?.reply || 'I could not generate a response right now.'),
      ]);
    } catch (error) {
      let message = 'AI assistant is temporarily unavailable';

      if (error instanceof Error) {
        const lowerMessage = error.message.toLowerCase();
        if (lowerMessage.includes('fetch') || lowerMessage.includes('network') || lowerMessage.includes('failed to fetch')) {
          message = 'Backend server is offline';
        } else if (lowerMessage.includes('detail') || lowerMessage.includes('error') || lowerMessage.includes('unavailable')) {
          message = error.message;
        } else {
          message = error.message;
        }
      }

      setMessages((prev) => [
        ...prev,
        createMessage('assistant', message, true, text),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = (message) => {
    if (!message || message.role !== 'assistant' || !message.error) return;
    sendMessage(message.retryText || retryText);
  };

  const quickActions = [
    'Explain my prediction',
    'Morning Routine',
    'Night Routine',
    'Recommended Products',
    'Ingredients to Use',
    'Foods to Avoid',
  ];

  return (
    <div className="chat-widget">
      {isOpen ? (
        <div className="chat-window-shell">
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            onClose={() => setIsOpen(false)}
            onRetry={handleRetry}
            input={input}
            setInput={setInput}
            onSend={() => sendMessage(input)}
            disabled={isLoading}
            analysisContext={analysisContext}
            quickActions={quickActions}
            onQuickAction={(action) => sendMessage(action)}
          />
        </div>
      ) : null}
      <button type="button" className="chat-toggle" onClick={() => setIsOpen((prev) => !prev)} aria-label="Open AI assistant">
        <MessageCircleMore size={28} />
      </button>
    </div>
  );
}

export default ChatWidget;
