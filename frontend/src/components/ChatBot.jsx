/**
 * components/ChatBot.jsx — AI Skincare Assistant
 * ================================================
 * A floating chat widget that:
 *   - Appears as a button in the bottom-right corner
 *   - Slides open a chat panel on click
 *   - Answers general skincare questions with pre-programmed smart responses
 *   - Is context-aware: if `analysisContext` is provided, can explain the result
 *   - Shows a clear disclaimer that it cannot replace a dermatologist
 *
 * Props:
 *   analysisContext: {
 *     condition:     string  — predicted label (e.g. "Melanocytic Nevus")
 *     conditionCode: string  — class code (e.g. "nv")
 *     confidence:    number  — 0–1
 *     riskLevel:     string  — "Low" | "High"
 *     recommendations: object|null — full recommendation response
 *   } | null
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MessageCircle, X, Send, Bot, User as UserIcon,
  AlertTriangle, Minimize2,
} from "lucide-react";

// ── HAM10000 condition descriptions ──────────────────────────────────────────
const CONDITION_INFO = {
  akiec: {
    name: "Actinic Keratoses / Intraepithelial Carcinoma",
    plain: "This is a type of pre-cancerous or early skin growth often caused by long-term sun exposure. It typically appears as rough, scaly patches. Early evaluation by a dermatologist is important.",
  },
  bcc: {
    name: "Basal Cell Carcinoma",
    plain: "This is the most common form of skin cancer. It grows slowly and rarely spreads, but it still needs professional evaluation. Early treatment has very good outcomes.",
  },
  bkl: {
    name: "Benign Keratosis",
    plain: "This includes seborrheic keratoses and other benign (non-cancerous) growths. These are very common, especially as people age. They typically don't require treatment, but a dermatologist can confirm.",
  },
  df: {
    name: "Dermatofibroma",
    plain: "A common benign skin growth that often appears as a small, firm bump. It's generally harmless. Avoid scratching or traumatizing the area.",
  },
  mel: {
    name: "Melanoma",
    plain: "Melanoma is a serious form of skin cancer. The AI flagged this as a melanoma-class result. This does NOT mean you have melanoma — but you should consult a qualified dermatologist as soon as possible for proper evaluation.",
  },
  nv: {
    name: "Melanocytic Nevus",
    plain: "This is a common mole (melanocytic nevus). Most moles are benign, but it's good practice to monitor them for changes using the ABCDE rule (Asymmetry, Border, Color, Diameter, Evolution).",
  },
  vasc: {
    name: "Vascular Lesions",
    plain: "Vascular lesions include angiomas, port-wine stains, and similar blood-vessel related marks. Most are benign. A dermatologist can assess whether any treatment or monitoring is needed.",
  },
};

// ── Smart response engine ─────────────────────────────────────────────────────
function generateResponse(userInput, ctx) {
  const q = userInput.toLowerCase().trim();

  // ── Result explanation queries ────────────────────────────────────────────
  if (ctx && (
    q.includes("my result") || q.includes("what does") ||
    q.includes("explain") || q.includes("mean") ||
    q.includes("condition") || q.includes("diagnosis")
  )) {
    const info = CONDITION_INFO[ctx.conditionCode];
    const confPct = (ctx.confidence * 100).toFixed(1);
    return (
      `The AI classified your skin image as **${info?.name ?? ctx.condition}** ` +
      `with **${confPct}% confidence**.\n\n` +
      `${info?.plain ?? ""}\n\n` +
      `⚠️ Remember: this is an AI-assisted educational assessment — not a medical diagnosis. ` +
      `Only a qualified dermatologist can make a clinical determination.`
    );
  }

  // ── Confidence/probability queries ────────────────────────────────────────
  if (q.includes("confidence") || q.includes("percent") || q.includes("probability") || q.includes("accurate")) {
    const confPct = ctx ? `${(ctx.confidence * 100).toFixed(1)}%` : "shown in your result";
    return (
      `The confidence score (${confPct}) represents how strongly the AI model associated your image ` +
      `with the predicted condition, based on patterns learned from the HAM10000 dataset.\n\n` +
      `A lower confidence doesn't mean the result is wrong — it means the image had features ` +
      `that the model found harder to classify. Always consult a dermatologist for definitive evaluation.`
    );
  }

  // ── What to do next ──────────────────────────────────────────────────────
  if (q.includes("what should i do") || q.includes("next step") || q.includes("what now") || q.includes("recommend")) {
    if (ctx?.riskLevel === "High") {
      return (
        `Given the **high-risk classification**, the most important next step is to **consult a qualified dermatologist** as soon as possible.\n\n` +
        `While you wait for an appointment:\n` +
        `• Do not scratch, pick, or apply home remedies to the area\n` +
        `• Apply SPF 50+ sunscreen daily\n` +
        `• Photograph the area to track any changes\n` +
        `• Avoid UV exposure\n\n` +
        `⚠️ This AI result is educational — not a clinical diagnosis.`
      );
    }
    return (
      `Based on the analysis, here are general steps:\n\n` +
      `1. **Keep the area clean** — use a gentle, fragrance-free cleanser\n` +
      `2. **Apply sunscreen daily** — SPF 50+ broad-spectrum\n` +
      `3. **Monitor for changes** — use the ABCDE rule monthly\n` +
      `4. **Schedule a skin check** — a routine dermatologist visit is always a good idea\n` +
      `5. **View your recommendations** — check the Recommendations section for personalized product and routine guidance\n\n` +
      `⚠️ Always consult a dermatologist for clinical evaluation.`
    );
  }

  // ── Products ─────────────────────────────────────────────────────────────
  if (q.includes("product") || q.includes("cleanser") || q.includes("moisturizer") || q.includes("moisturiser") || q.includes("sunscreen") || q.includes("serum")) {
    if (ctx?.recommendations?.products?.length > 0) {
      const names = ctx.recommendations.products.slice(0, 3).map(p => `• **${p.name}** (${p.category})`).join("\n");
      return (
        `Based on your AI result, some recommended product categories include:\n\n${names}\n\n` +
        `You can view full details, key ingredients, and how-to-use guides in the **Recommended Products** section on your dashboard.\n\n` +
        `⚠️ These are general skincare product suggestions — not medical treatments.`
      );
    }
    return (
      `For most skin conditions, a basic skincare routine may support skin health:\n\n` +
      `• **Gentle cleanser** — fragrance-free, pH-balanced\n` +
      `• **Moisturizer** — suited to your skin type\n` +
      `• **Broad-spectrum sunscreen** — SPF 50+ daily\n\n` +
      `Avoid strong actives (retinoids, acids) unless advised by a dermatologist.\n\n` +
      `Always patch-test new products and consult a pharmacist or dermatologist if unsure.`
    );
  }

  // ── Routine ──────────────────────────────────────────────────────────────
  if (q.includes("routine") || q.includes("morning") || q.includes("night") || q.includes("evening")) {
    return (
      `A basic daily skincare routine may support skin health:\n\n` +
      `**Morning:**\n` +
      `1. Gentle cleanser\n` +
      `2. Light moisturizer\n` +
      `3. Broad-spectrum SPF 50+ sunscreen\n\n` +
      `**Evening:**\n` +
      `1. Gentle cleanser\n` +
      `2. Moisturizer\n` +
      `3. Any prescribed treatment (if applicable)\n\n` +
      `Check the **Daily Routine** section in your results for a personalized routine based on your AI result.`
    );
  }

  // ── Dermatologist ─────────────────────────────────────────────────────────
  if (q.includes("dermatologist") || q.includes("doctor") || q.includes("see a") || q.includes("consult") || q.includes("when should")) {
    return (
      `You should see a dermatologist if you notice:\n\n` +
      `• **Rapid changes** in size, shape, or color of a lesion\n` +
      `• **Bleeding or oozing** without injury\n` +
      `• **Persistent pain** or itching that doesn't resolve\n` +
      `• **A wound that won't heal** after several weeks\n` +
      `• **Any change that concerns you** — trust your instincts\n\n` +
      `For high-risk AI results (Melanoma, BCC, AKIEC), please seek evaluation **promptly**.\n\n` +
      `Annual skin checks are recommended for everyone, especially those with a family history of skin cancer.`
    );
  }

  // ── Precautions ───────────────────────────────────────────────────────────
  if (q.includes("precaution") || q.includes("avoid") || q.includes("careful") || q.includes("warning")) {
    return (
      `General precautions for skin lesion care:\n\n` +
      `• **Do not scratch, pick, or squeeze** any lesion\n` +
      `• **Avoid harsh scrubs** or chemical exfoliants on affected areas\n` +
      `• **Always use sunscreen** — UV exposure can worsen many skin conditions\n` +
      `• **Patch-test** new skincare products before applying broadly\n` +
      `• **Don't self-medicate** with unverified home remedies\n` +
      `• **Photograph the area** periodically to track changes\n\n` +
      `If you notice any sudden changes or new symptoms, consult a dermatologist promptly.`
    );
  }

  // ── ABCDE rule ────────────────────────────────────────────────────────────
  if (q.includes("abcde") || q.includes("mole") || q.includes("monitor")) {
    return (
      `The **ABCDE rule** helps monitor pigmented skin lesions:\n\n` +
      `**A** — Asymmetry: one half doesn't match the other\n` +
      `**B** — Border: irregular, ragged, or blurred edges\n` +
      `**C** — Color: uneven shading or multiple colors\n` +
      `**D** — Diameter: larger than 6mm (pencil eraser size)\n` +
      `**E** — Evolution: any change over time\n\n` +
      `If you notice any of these signs, book an appointment with a dermatologist. Regular monthly self-checks are recommended.`
    );
  }

  // ── Sunscreen ─────────────────────────────────────────────────────────────
  if (q.includes("spf") || q.includes("sun") || q.includes("uv")) {
    return (
      `Sun protection is one of the most important parts of any skincare routine:\n\n` +
      `• Use **broad-spectrum SPF 50+** sunscreen daily — even on cloudy days\n` +
      `• Apply **30 minutes before** going outdoors\n` +
      `• **Reapply every 2 hours** when outdoors\n` +
      `• Wear **protective clothing**, hats, and sunglasses\n` +
      `• **Avoid tanning beds** — they significantly increase skin cancer risk\n` +
      `• Seek shade between **10am–4pm** when UV is strongest`
    );
  }

  // ── General skincare ──────────────────────────────────────────────────────
  if (q.includes("skincare") || q.includes("skin care") || q.includes("tips") || q.includes("advice")) {
    return (
      `Here are some general evidence-based skincare tips:\n\n` +
      `• **Cleanse gently** — avoid harsh soaps that strip the skin barrier\n` +
      `• **Moisturize daily** — even oily skin benefits from lightweight hydration\n` +
      `• **SPF 50+ sunscreen every day** — this is the most evidence-backed anti-aging and protective step\n` +
      `• **Stay hydrated** — 6–8 glasses of water daily supports skin from within\n` +
      `• **Get adequate sleep** — skin repairs itself during sleep\n` +
      `• **Don't over-exfoliate** — 1–2 times per week maximum\n` +
      `• **Patch-test** new products before using them on your face\n\n` +
      `For condition-specific advice, always consult a qualified dermatologist.`
    );
  }

  // ── Hello / greeting ─────────────────────────────────────────────────────
  if (q.length < 20 && (q.includes("hi") || q.includes("hello") || q.includes("hey"))) {
    const greeting = ctx
      ? `Hello! I can see you've had a skin analysis. Your result was **${ctx.condition}**. How can I help you understand your results or answer skincare questions?`
      : `Hello! I'm your AI Skincare Assistant. I can answer general skincare questions, explain skin conditions, and help you understand your AI analysis results. What would you like to know?`;
    return greeting;
  }

  // ── Help / what can you do ────────────────────────────────────────────────
  if (q.includes("help") || q.includes("what can you") || q.includes("how do you")) {
    return (
      `I can help you with:\n\n` +
      `• **Explaining your AI result** — "What does my result mean?"\n` +
      `• **Skincare routines** — "What routine should I follow?"\n` +
      `• **Product guidance** — "What products are recommended?"\n` +
      `• **Dermatologist advice** — "When should I see a dermatologist?"\n` +
      `• **Precautions** — "What should I avoid?"\n` +
      `• **Understanding confidence scores** — "What does the percentage mean?"\n` +
      `• **ABCDE rule** — "How do I monitor my moles?"\n\n` +
      `Just type your question and I'll do my best to help!`
    );
  }

  // ── Default fallback ─────────────────────────────────────────────────────
  return (
    `Thank you for your question. I can provide general skincare information, but for specific medical advice about your skin condition, please consult a qualified dermatologist.\n\n` +
    `I can help you with:\n` +
    `• Explaining your AI analysis result\n` +
    `• General skincare routines and tips\n` +
    `• When to see a dermatologist\n` +
    `• Understanding your confidence scores\n\n` +
    `Try asking: "What does my result mean?" or "When should I see a dermatologist?"`
  );
}

// ── Format message text (simple markdown-like) ────────────────────────────────
function FormattedText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

function MessageBubble({ msg }) {
  const lines = msg.text.split("\n");
  return (
    <div className={`chat-msg-enter flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
        msg.role === "user" ? "bg-blue-600" : "bg-gradient-to-br from-violet-500 to-blue-600"
      }`}>
        {msg.role === "user"
          ? <UserIcon size={13} className="text-white" />
          : <Bot size={13} className="text-white" />
        }
      </div>
      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
        msg.role === "user"
          ? "bg-blue-600 text-white rounded-tr-sm"
          : "bg-gray-100 text-gray-800 rounded-tl-sm"
      }`}>
        {lines.map((line, i) => (
          <div key={i}>
            {line ? <FormattedText text={line} /> : <br />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Suggested questions ───────────────────────────────────────────────────────
const SUGGESTIONS_WITH_CTX = [
  "What does my result mean?",
  "What should I do now?",
  "What products are recommended?",
  "When should I see a dermatologist?",
];

const SUGGESTIONS_NO_CTX = [
  "What can you help me with?",
  "What is the ABCDE rule?",
  "When should I see a dermatologist?",
  "Give me skincare tips",
];

// ── Main ChatBot component ────────────────────────────────────────────────────
function ChatBot({ analysisContext = null }) {
  const [isOpen, setIsOpen]       = useState(false);
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState("");
  const [isTyping, setIsTyping]   = useState(false);
  const messagesEndRef             = useRef(null);
  const inputRef                   = useRef(null);

  // ── Welcome message on first open ────────────────────────────────────────
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcome = analysisContext
        ? `Hello! I'm your AI Skincare Assistant. I can see you've completed a skin analysis.\n\nYour result: **${analysisContext.condition}** (${(analysisContext.confidence * 100).toFixed(1)}% confidence)\n\nHow can I help you understand your results or answer skincare questions?`
        : `Hello! I'm your AI Skincare Assistant.\n\nI can answer general skincare questions, explain skin conditions, and help you understand AI analysis results.\n\nWhat would you like to know?`;

      setMessages([{ id: 1, role: "bot", text: welcome }]);
    }
  }, [isOpen, analysisContext, messages.length]);

  // ── Auto-scroll to bottom ─────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Focus input when opened ───────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || isTyping) return;

    setInput("");
    const userMsg = { id: Date.now(), role: "user", text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate realistic typing delay
    await new Promise(r => setTimeout(r, 600 + Math.random() * 600));

    const response = generateResponse(trimmed, analysisContext);
    setMessages(prev => [...prev, { id: Date.now() + 1, role: "bot", text: response }]);
    setIsTyping(false);
  }, [input, isTyping, analysisContext]);

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const suggestions = analysisContext ? SUGGESTIONS_WITH_CTX : SUGGESTIONS_NO_CTX;

  return (
    <>
      {/* ── Floating button ────────────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        id="chatbot-toggle-btn"
        aria-label="Open AI Skincare Assistant"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl
                   bg-gradient-to-br from-violet-600 to-blue-600
                   hover:from-violet-700 hover:to-blue-700
                   flex items-center justify-center
                   transition-all duration-200 active:scale-95
                   hover:shadow-2xl hover:shadow-violet-200"
      >
        {isOpen
          ? <X size={22} className="text-white" />
          : <MessageCircle size={22} className="text-white" />
        }
        {/* Unread dot */}
        {!isOpen && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400
                           border-2 border-white" />
        )}
      </button>

      {/* ── Chat panel ─────────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="chat-panel-enter fixed bottom-24 right-6 z-50
                     w-[360px] max-w-[calc(100vw-24px)]
                     bg-white rounded-2xl shadow-2xl border border-gray-200
                     flex flex-col overflow-hidden"
          style={{ height: "520px" }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Bot size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm">AI Skincare Assistant</p>
              <p className="text-violet-200 text-[11px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                General skincare guidance
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <Minimize2 size={16} />
            </button>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 border-b border-amber-100 px-3 py-2 flex items-start gap-2">
            <AlertTriangle size={12} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-700 leading-relaxed">
              <strong>Disclaimer:</strong> I provide general information only. I cannot diagnose
              conditions or replace a dermatologist.
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-600
                               flex items-center justify-center shrink-0">
                  <Bot size={13} className="text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}

            {/* Suggested questions (after welcome, before user responds) */}
            {messages.length === 1 && !isTyping && (
              <div className="flex flex-col gap-2 mt-1">
                <p className="text-[11px] text-gray-400 font-medium">Try asking:</p>
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    className="text-left text-xs text-blue-700 bg-blue-50 hover:bg-blue-100
                               border border-blue-100 rounded-xl px-3 py-2 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 px-3 py-3 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a skincare question…"
              disabled={isTyping}
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300
                         disabled:bg-gray-50 disabled:text-gray-400 placeholder-gray-400"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              id="chatbot-send-btn"
              aria-label="Send message"
              className="w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-700
                         flex items-center justify-center shrink-0
                         disabled:bg-gray-200 disabled:cursor-not-allowed
                         transition-all active:scale-95"
            >
              <Send size={15} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatBot;
