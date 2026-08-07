import React, { useState, useRef, useEffect } from 'react';
import type { ScanMetrics } from '../App';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface ConsultantChatProps {
  scanMetrics: ScanMetrics;
}

export const ConsultantChat: React.FC<ConsultantChatProps> = ({ scanMetrics }) => {
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });
  const [tempKey, setTempKey] = useState(apiKey);
  const [showKeyInput, setShowKeyInput] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Set initial assistant message dynamically based on whether API key is provided
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeText = apiKey 
        ? `Hello! I'm your Aetheris AI Skincare Consultant, powered by your live Gemini API connection. I've analyzed your skin profile: ${scanMetrics.skinType || 'Normal'} Skin with a Health Score of ${scanMetrics.score}/100. How can I assist you with your routine or skin concerns today?`
        : `Hello! I'm your Aetheris AI Skincare Consultant. I've analyzed your skin profile: ${scanMetrics.skinType || 'Normal'} Skin with a Health Score of ${scanMetrics.score}/100. For direct live AI consulting, click the "Connect Gemini API Key" button above to link your key. How can I assist you today?`;
      
      setMessages([
        {
          sender: 'ai',
          text: welcomeText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [scanMetrics, apiKey, messages.length]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const presetQuestions = [
    "How can I treat my dark spots?",
    "What morning cleanser is best for my skin type?",
    "How do I clear whiteheads and congestion?",
    "Can you explain my skincare routine?"
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Call server API for consultant chat with apiKey passed in body
    fetch('http://localhost:5000/api/consultant/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: text,
        history: messages,
        metrics: scanMetrics,
        apiKey: apiKey
      })
    })
      .then(res => res.json())
      .then(data => {
        const aiMsg: Message = {
          sender: 'ai',
          text: data.reply || "I'm sorry, I couldn't process that question. Please try asking about specific active ingredients or routine steps.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
      })
      .catch(err => {
        console.error("Error sending message to consultant:", err);
        const errorMsg: Message = {
          sender: 'ai',
          text: "Connection to skincare server timed out. Please try sending your message again shortly.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, errorMsg]);
        setIsTyping(false);
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-on-surface">AI Skincare Consultant</h2>
          <p className="text-xs text-on-surface-variant font-medium mt-1">Get personalized guidance on active ingredients, routine updates, and concern resolutions from our trained AI.</p>
        </div>
        <button 
          onClick={() => setShowKeyInput(!showKeyInput)}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-xs font-bold transition-all border self-start md:self-center cursor-pointer shadow-sm ${
            apiKey 
              ? 'border-emerald-500/20 text-emerald-600 bg-emerald-500/10' 
              : 'border-primary/20 text-primary bg-primary/5 hover:bg-primary/10'
          }`}
        >
          <span className="material-symbols-outlined text-sm">{apiKey ? 'lock_open' : 'lock'}</span>
          {apiKey ? 'API Linked' : 'Connect Gemini API Key'}
        </button>
      </div>

      {showKeyInput && (
        <div className="p-4 glass-card border border-outline-variant/30 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between bg-surface-container-low dark:bg-zinc-800/40">
          <div className="flex-1 w-full text-left">
            <h4 className="text-xs font-bold text-on-surface">Google Gemini API Configuration</h4>
            <p className="text-[10px] text-on-surface-variant mt-0.5">Paste your personal free `GEMINI_API_KEY` below, or set it as a terminal environment variable ($env:GEMINI_API_KEY) in the backend to run the chatbot and recommendations keylessly.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto shrink-0 items-center">
            <input 
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="Enter Gemini API Key (AIzaSy...)"
              className="flex-1 sm:w-64 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-outline-variant/30 rounded-xl text-xs focus:outline-none text-on-surface focus:border-primary"
            />
            <button 
              onClick={() => {
                setApiKey(tempKey);
                localStorage.setItem('gemini_api_key', tempKey);
                setShowKeyInput(false);
              }}
              className="px-3 py-1.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Save Key
            </button>
            {apiKey && (
              <button 
                onClick={() => {
                  setTempKey('');
                  setApiKey('');
                  localStorage.removeItem('gemini_api_key');
                  setShowKeyInput(false);
                }}
                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-500 font-bold text-xs rounded-xl cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-card-gap h-[calc(100vh-220px)] min-h-[450px]">
        {/* Skin Profile Summary sidebar */}
        <div className="col-span-12 lg:col-span-4 glass-card p-5 rounded-2xl border border-white/20 flex flex-col justify-between h-full bg-white/20 dark:bg-zinc-900/20">
          <div>
            <h3 className="font-display text-sm font-bold text-on-surface uppercase tracking-wider mb-4">Patient Profile File</h3>
            <div className="space-y-4">
              <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl space-y-3">
                <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase">Biometric Skin Type</span>
                  <span className="text-xs font-bold text-primary">{scanMetrics.skinType || 'Normal'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase">Skin Health Index</span>
                  <span className="text-xs font-bold text-secondary">{scanMetrics.score}/100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase">Cellular Turnover</span>
                  <span className="text-xs font-bold text-on-surface">28 Days</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Concern Severity Records</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-on-surface-variant">Acne & Congestion</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${scanMetrics.acneDetected ? 'text-rose-600 bg-rose-500/10' : 'text-emerald-600 bg-emerald-500/10'}`}>
                      {scanMetrics.acneDetected ? `Seen (${scanMetrics.acne}%)` : 'Not Seen'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-on-surface-variant">Pigmentation (Dark Spots)</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${scanMetrics.darkSpotsDetected ? 'text-rose-600 bg-rose-500/10' : 'text-emerald-600 bg-emerald-500/10'}`}>
                      {scanMetrics.darkSpotsDetected ? `Seen (${scanMetrics.darkSpots || scanMetrics.pigmentation}%)` : 'Not Seen'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-on-surface-variant">Sebum (White/Blackheads)</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${scanMetrics.whiteheadsDetected ? 'text-rose-600 bg-rose-500/10' : 'text-emerald-600 bg-emerald-500/10'}`}>
                      {scanMetrics.whiteheadsDetected ? `Seen (${scanMetrics.whiteheads || 30}%)` : 'Not Seen'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-secondary/5 border border-secondary/10 rounded-xl mt-4">
            <div className="flex items-center gap-2 text-secondary mb-1">
              <span className="material-symbols-outlined text-lg">medical_services</span>
              <span className="text-[10px] font-bold uppercase tracking-wider">Consultation Advice</span>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Ask about target ingredients like **Retinol**, **Salicylic Acid**, or **Vitamin C** to see how they fit into your 7-day routine plan.
            </p>
          </div>
        </div>

        {/* Chat Feed */}
        <div className="col-span-12 lg:col-span-8 glass-card rounded-2xl border border-white/20 flex flex-col justify-between h-full overflow-hidden">
          {/* Messages display */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[calc(100%-80px)] scrollbar-thin scrollbar-thumb-outline-variant">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                  msg.sender === 'user' ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                }`}>
                  {msg.sender === 'user' ? 'U' : 'AI'}
                </div>
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm text-left ${
                  msg.sender === 'user' 
                    ? 'bg-gradient-to-r from-primary to-primary-container text-white rounded-tr-none' 
                    : 'bg-surface-container-low dark:bg-zinc-800 text-on-surface border border-outline-variant/10 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span className={`block text-[9px] mt-1.5 text-right ${
                    msg.sender === 'user' ? 'text-white/60' : 'text-on-surface-variant/60'
                  }`}>{msg.timestamp}</span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-primary/10 text-primary text-xs font-bold">
                  AI
                </div>
                <div className="p-3.5 bg-surface-container-low dark:bg-zinc-800 text-on-surface border border-outline-variant/10 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick presets & Text Input footer */}
          <div className="p-4 border-t border-outline-variant/10 bg-surface-container-lowest/50 dark:bg-zinc-950/20">
            {/* Presets */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {presetQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="px-3 py-1.5 rounded-full border border-outline-variant/30 hover:border-primary bg-white/50 dark:bg-zinc-900/50 hover:bg-primary/5 text-[10px] text-on-surface-variant font-bold hover:text-primary transition-all cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
              className="flex gap-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about ingredients, acne, routines..."
                className="flex-1 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary/60 shadow-inner"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="px-4 py-2 bg-gradient-to-r from-primary to-secondary disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
