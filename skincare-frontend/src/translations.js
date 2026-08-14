export const translations = {
  en: {
    brand: "Skin Intelligence",
    tagline: "AI Skin Intelligence & Personalized Skincare Planner",
    profileTab: "🧬 Profile",
    scanTab: "📷 Scan & Analyze",
    plannerTab: "📅 7-Day Plan",
    productsTab: "🛍️ Products",
    signOut: "Sign out",
    scoreLabel: "Skin Health Score",
    scoreSub: "Score updates after your AI photo scan is processed.",
    aiDetected: "AI Detected",
    skinType: "Skin Type",
    ageGroup: "Age Group",
    sleepQuality: "Sleep Quality",
    waterIntake: "Water Intake",
    skinConcerns: "Skin Concerns",
    allergies: "Allergies",
    editProfile: "✏️ Edit Profile",
    createProfile: "➕ Create Profile",
    saveProfile: "Save Profile",
    cancel: "Cancel",
    scanTitle: "📷 AI Skin Scan & Photo Analysis",
    scanSub: "Upload a clear photo of your face. Your photo & scan results will stay saved even when switching tabs.",
    clickToUpload: "Click to upload a photo",
    chooseDifferentPhoto: "🔄 Choose a different photo",
    choosePhoto: "📁 Choose photo",
    analyzing: "✦ AI is analyzing your skin — please wait…",
    analysisResults: "Analysis Results",
    concernDetected: "Skin Concern Detected",
    typeDetected: "Skin Type Detected",
    disclaimer: "⚕️ AI-estimated from photo quality — not a medical diagnosis. For best results use natural light.",
    plannerTitle: "🗓️ 7-Day Personalized Skincare Routine",
    plannerSub: "Targeting:",
    clinicalMode: "🛍️ Clinical Product Routine",
    naturalMode: "🌿 100% Natural Home Remedy",
    keyActives: "⚡ Key Active Ingredients:",
    naturalNotice: "✨ Chemical-free natural routines using honey, neem, turmeric, aloe vera, rice water & botanical herbs.",
    morning: "☀️ Morning",
    evening: "🌙 Evening",
    focus: "🎯 Focus:",
    productsTitle: "🛍️ Recommended Skincare Products",
    productsSub: "Matched to your AI scan. Click Add to cart to open the product directly on Amazon.",
    addToCart: "Add to cart 🛒",
    freeDelivery: "FREE delivery Fri, 7 Aug",
    fastestDelivery: "Or fastest delivery Tomorrow, 6 Aug",
    askSkinAI: "💬 DermaSense AI",
    ragTitle: "✦ DermaSense AI Skincare Advisor",
    ragSub: "Grounded on Skincare Dataset & Clinical Knowledge",
    ragPlaceholder: "Ask DermaSense AI about products, ingredients, acne, dark spots...",
    enterApiKey: "🔑 Enter Groq or Gemini API Key (Optional)",
    send: "Send",
    days: {
      Monday: "Monday",
      Tuesday: "Tuesday",
      Wednesday: "Wednesday",
      Thursday: "Thursday",
      Friday: "Friday",
      Saturday: "Saturday",
      Sunday: "Sunday"
    }
  }
};

export function translateConcern(term) {
  if (!term) return "";
  return term.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export function translateSkinType(term) {
  if (!term) return "";
  return term.charAt(0).toUpperCase() + term.slice(1);
}

export function translateRoutineText(text) {
  return text || "";
}
