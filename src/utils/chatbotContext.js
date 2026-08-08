export const SKIN_ANALYSIS_STORAGE_KEY = 'skin-analysis-context';
export const SKIN_ANALYSIS_CONTEXT_EVENT = 'skin-analysis-context-updated';

export function loadSkinAnalysisContext() {
  if (typeof window === 'undefined') return null;

  try {
    const storedValue = window.localStorage.getItem(SKIN_ANALYSIS_STORAGE_KEY);
    return storedValue ? JSON.parse(storedValue) : null;
  } catch {
    return null;
  }
}

export function saveSkinAnalysisContext(context) {
  if (typeof window === 'undefined') return;

  if (!context?.condition) {
    window.localStorage.removeItem(SKIN_ANALYSIS_STORAGE_KEY);
    window.dispatchEvent(new Event(SKIN_ANALYSIS_CONTEXT_EVENT));
    return;
  }

  window.localStorage.setItem(SKIN_ANALYSIS_STORAGE_KEY, JSON.stringify(context));
  window.dispatchEvent(new Event(SKIN_ANALYSIS_CONTEXT_EVENT));
}

export function buildChatWelcomeMessage(context) {
  if (!context?.condition) {
    return 'Hello! I can help with skincare routines, product advice, and skin concerns. Ask me anything.';
  }

  const confidence = Number(context.confidence ?? 0);
  const confidenceLabel = Number.isFinite(confidence)
    ? `${Math.round(confidence * 100)}%`
    : (context.confidence || 'N/A');

  return [
    'Hello 👋',
    '',
    'Your latest skin analysis',
    '',
    `Condition:\n${context.condition}`,
    '',
    `Confidence:\n${confidenceLabel}`,
    '',
    'How can I help you today?',
  ].join('\n');
}

export function serializeChatContext(context) {
  if (!context?.condition) return null;

  return {
    condition: context.condition,
    confidence: context.confidence,
    recommendation: context.recommendation,
  };
}
