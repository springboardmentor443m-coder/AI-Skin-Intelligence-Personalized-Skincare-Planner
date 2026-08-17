import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const Input = z.object({
  sessionId: z.string().uuid(),
  message: z.string().min(1).max(4000),
});

export const sendChatMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured.");

    const [{ data: profile }, { data: assessment }, { data: history }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase
        .from("assessments")
        .select("condition, confidence, skin_health_score, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("chat_messages")
        .select("role, message")
        .eq("session_id", data.sessionId)
        .order("created_at", { ascending: true })
        .limit(30),
    ]);

    await supabase.from("chat_messages").insert({
      session_id: data.sessionId,
      user_id: userId,
      role: "user",
      message: data.message,
      skin_condition_at_time: assessment?.condition ?? null,
      confidence_at_time: assessment?.confidence ?? null,
    });

    const system = [
      "You are SkinIntel, a warm, evidence-informed skincare coach.",
      "You never diagnose medical conditions and always recommend a dermatologist for severe, painful, spreading or bleeding skin issues.",
      "Answer concisely (max ~180 words), use plain language, and reference the user's context when relevant.",
      profile
        ? `User context: skin type ${profile.skin_type ?? "unknown"}, concerns ${(profile.skin_concerns ?? []).join(", ") || "none"}, sensitivities ${(profile.sensitivities ?? []).join(", ") || "none"}, budget ${profile.budget ?? "unspecified"}.`
        : "",
      assessment
        ? `Latest AI assessment: ${assessment.condition} (confidence ${(Number(assessment.confidence) * 100).toFixed(0)}%), skin health score ${assessment.skin_health_score ?? "n/a"}.`
        : "No skin assessment yet — encourage the user to run one.",
    ]
      .filter(Boolean)
      .join("\n");

    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const { generateText } = await import("ai");
    const gateway = createLovableAiGatewayProvider(key);

    let reply: string;
    try {
      const result = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        system,
        messages: [
          ...(history ?? []).map((m) => ({
            role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
            content: m.message,
          })),
          { role: "user" as const, content: data.message },
        ],
      });
      reply = result.text.trim();
    } catch (err) {
      const status = (err as { statusCode?: number; status?: number }).statusCode ?? (err as { status?: number }).status;
      if (status === 429) throw new Error("The AI assistant is busy right now. Please try again in a moment.");
      if (status === 402) throw new Error("AI credits are exhausted. Add credits to keep chatting.");
      throw new Error("The AI assistant could not respond. Please try again.");
    }

    const { data: inserted } = await supabase
      .from("chat_messages")
      .insert({
        session_id: data.sessionId,
        user_id: userId,
        role: "assistant",
        message: reply,
        skin_condition_at_time: assessment?.condition ?? null,
        confidence_at_time: assessment?.confidence ?? null,
      })
      .select("id, role, message, created_at")
      .single();

    await supabase
      .from("chat_sessions")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", data.sessionId);

    return { reply, messageId: inserted?.id ?? null };
  });
