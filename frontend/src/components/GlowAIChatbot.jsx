import React, { useState, useEffect, useRef } from 'react';
import { fetchGreeting, sendChatMessage } from '../services/api';
import {
  X,
  Send,
  Bot,
  User,
  Wand2,
  RefreshCw,
  Sparkles
} from 'lucide-react';


export default function GlowAIChatbot() {

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [greetingLoaded, setGreetingLoaded] = useState(false);

  const messagesEndRef = useRef(null);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };


  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);


  useEffect(() => {

    if (isOpen && !greetingLoaded) {

      const getGreeting = async () => {

        try {

          const res = await fetchGreeting();

          setMessages([
            {
              sender: 'bot',
              text:
                res.greeting ||
                'Hello! How can I assist with your skincare routine or scan history today?',
            },
          ]);

          setGreetingLoaded(true);

        } catch (err) {

          setMessages([
            {
              sender: 'bot',
              text:
                'Hello! I am GlowAI, your personal AI skincare assistant. How can I help you today?',
            },
          ]);

          setGreetingLoaded(true);

        }

      };

      getGreeting();

    }

  }, [isOpen, greetingLoaded]);


  const handleSend = async (customText = null) => {

    const textToSend =
      customText || inputMessage;

    if (!textToSend.trim() || loading) return;


    if (!customText) {
      setInputMessage('');
    }


    setMessages((prev) => [
      ...prev,
      {
        sender: 'user',
        text: textToSend
      }
    ]);

    setLoading(true);


    try {

      const response =
        await sendChatMessage(textToSend);

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text:
            response.reply ||
            response.response ||
            'I analyzed your data to answer that.',
        },
      ]);

    } catch (err) {

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text:
            'Sorry, I encountered an issue accessing your context. Please try again.',
        },
      ]);

    } finally {

      setLoading(false);

    }
  };


  /*
   * ============================================================
   * QUICK PROMPTS
   *
   * The routine prompt is intentionally condition-neutral.
   *
   * It works with all six model classes:
   *
   * 1. Acne
   * 2. Blackheads
   * 3. Clear Skin
   * 4. Dark Spots
   * 5. Puffy Eyes
   * 6. Wrinkles
   *
   * The backend can use the user's latest scan context to
   * determine the appropriate condition-specific response.
   * ============================================================
   */

  const quickPrompts = [
    "Analyze my latest scan result",
    "Show product ingredients & prices",
    "Suggest a 7-day skincare routine for my detected condition",
    "How does sleep affect my skin?",
  ];


  return (
    <div className="fixed bottom-6 right-6 z-50">

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl shadow-emerald-900/50 transition duration-300 transform hover:scale-105 cursor-pointer font-bold ring-2 ring-emerald-400/30"
        >

          <Wand2 className="w-5 h-5" />

          <span>Ask GlowAI</span>

          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-200"></span>
          </span>

        </button>
      )}


      {isOpen && (
        <div className="w-[360px] sm:w-[420px] h-[560px] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-200">

          {/* HEADER */}

          <div className="bg-slate-800 p-4 border-b border-slate-700/80 flex items-center justify-between">

            <div className="flex items-center gap-2.5">

              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 ring-1 ring-emerald-500/20">
                <Bot className="w-5 h-5" />
              </div>

              <div>

                <h4 className="font-bold text-white text-sm">
                  GlowAI Clinical Consultant
                </h4>

                <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">

                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />

                  Context-Aware AI Dermatologist

                </p>

              </div>

            </div>


            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

          </div>


          {/* CHAT MESSAGES */}

          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-950/50">

            {messages.map((msg, idx) => (

              <div
                key={idx}
                className={`flex gap-2.5 ${
                  msg.sender === 'user'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >

                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-500/20">
                    <Bot className="w-4 h-4" />
                  </div>
                )}


                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none font-medium'
                      : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/60'
                  }`}
                >
                  {msg.text}
                </div>


                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-700">
                    <User className="w-4 h-4" />
                  </div>
                )}

              </div>

            ))}


            {/* LOADING */}

            {loading && (
              <div className="flex gap-2.5 items-center text-slate-400 text-xs italic">

                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">

                  <RefreshCw className="w-4 h-4 animate-spin" />

                </div>

                <span>
                  GlowAI is analyzing your skin context and preparing a response...
                </span>

              </div>
            )}


            <div ref={messagesEndRef} />

          </div>


          {/* QUICK PROMPTS */}

          <div className="px-3 py-2 bg-slate-900 border-t border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar">

            {quickPrompts.map((prompt, pIdx) => (

              <button
                key={pIdx}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded-full border border-slate-700 whitespace-nowrap transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
              >

                <Sparkles className="w-3 h-3 text-emerald-400" />

                <span>{prompt}</span>

              </button>

            ))}

          </div>


          {/* INPUT */}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-800 border-t border-slate-700/80 flex items-center gap-2"
          >

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about active scan, ingredients, prices, routines..."
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition cursor-pointer disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>

          </form>

        </div>
      )}

    </div>
  );
}