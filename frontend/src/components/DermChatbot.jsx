import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, Bot, User, Sparkles, RefreshCw, ShieldCheck } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

export default function DermChatbot({ analysisResult, currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I am Dr. DermAI, your Board-Certified Senior Dermatologist AI. I have reviewed your facial scan analysis, prescribed products, and 7-day skin cycling routine. How can I assist your skin journey today?"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg = { role: 'user', content: query };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    try {
      // Build context object
      const contextObj = {
        ...analysisResult,
        gender: currentUser?.gender || 'Unisex'
      };

      const res = await axios.post(`${API_BASE_URL}/api/chat/ask`, {
        message: query,
        conversation_history: newHistory,
        context: contextObj
      });

      const botReply = res.data.reply || "I apologize, I couldn't process that response. Please try asking again!";
      setMessages(prev => [...prev, { role: 'assistant', content: botReply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm having trouble connecting to the clinical server right now. Please ensure your backend is running and try again!"
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickPrompts = [
    "Why were these specific products recommended for my skin?",
    "How do I apply my AM and PM products in order?",
    "What should I do on Barrier Recovery Night?"
  ];

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          zIndex: 90,
          background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '50px',
          padding: '14px 22px',
          fontSize: '14px',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.5), 0 0 15px rgba(6, 182, 212, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Bot size={20} />
          <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
        </div>
        <span>Ask Dr. DermAI</span>
      </button>

      {/* Chatbot Window Drawer / Modal */}
      {isOpen && (
        <div
          className="glass-card"
          style={{
            position: 'fixed',
            bottom: '95px',
            right: '28px',
            width: '380px',
            maxHeight: '560px',
            height: '80vh',
            zIndex: 95,
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(99, 102, 241, 0.2)',
            border: '1px solid var(--border-glass)',
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)'
          }}
        >
          {/* Header */}
          <div style={{ padding: '16px 20px', background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(6, 182, 212, 0.3))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(6, 182, 212, 0.4)' }}>
                <Bot size={20} color="#06B6D4" />
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Dr. DermAI
                  <ShieldCheck size={14} color="#10B981" />
                </h4>
                <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>
                  ● Clinical Context Active
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%'
                }}
              >
                {msg.role === 'assistant' && (
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <Bot size={14} color="#06B6D4" />
                  </div>
                )}

                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: msg.role === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    background: msg.role === 'user' ? 'linear-gradient(135deg, #6366F1, #4F46E5)' : 'rgba(255, 255, 255, 0.05)',
                    border: msg.role === 'user' ? 'none' : '1px solid var(--border-glass)',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-line'
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-start' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={14} color="#06B6D4" />
                </div>
                <div style={{ padding: '10px 14px', borderRadius: '16px 16px 16px 2px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-glass)', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RefreshCw size={12} className="animate-spin" />
                  <span>Analyzing clinical recommendation context...</span>
                </div>
              </div>
            )}

            {/* Quick Suggested Prompts */}
            {messages.length <= 2 && !isTyping && (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '2px' }}>Quick Questions:</span>
                {quickPrompts.map((promptText, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(promptText)}
                    style={{
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(99, 102, 241, 0.08)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      color: '#818CF8',
                      fontSize: '11px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    💡 {promptText}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            style={{ padding: '12px 16px', borderTop: '1px solid var(--border-glass)', background: 'rgba(0, 0, 0, 0.2)', display: 'flex', gap: '8px' }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about your scan or products..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-glass)',
                color: '#FFFFFF',
                fontSize: '12px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              style={{
                padding: '10px',
                borderRadius: '10px',
                background: inputText.trim() ? 'linear-gradient(135deg, #6366F1, #06B6D4)' : 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#FFFFFF',
                cursor: inputText.trim() ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Send size={15} />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
