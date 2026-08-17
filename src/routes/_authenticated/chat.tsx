import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { sendChatMessage } from "@/lib/chat.functions";
import { MEDICAL_DISCLAIMER } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({
    meta: [
      { title: "AI Skincare Assistant — SkinIntel" },
      { name: "description", content: "Chat with a context-aware skincare assistant that knows your profile and latest scan." },
      { property: "og:title", content: "AI Skincare Assistant — SkinIntel" },
      { property: "og:description", content: "Personalised skincare answers with persistent chat history." },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const send = useServerFn(sendChatMessage);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const bottom = React.useRef<HTMLDivElement>(null);

  const { data: sessionId } = useQuery({
    queryKey: ["chat-session", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data: existing } = await supabase
        .from("chat_sessions")
        .select("id")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (existing) return existing.id;
      const { data: created, error } = await supabase
        .from("chat_sessions")
        .insert({ user_id: user!.id, title: "Skincare chat" })
        .select("id")
        .single();
      if (error) throw error;
      return created.id;
    },
  });

  const { data: messages } = useQuery({
    queryKey: ["chat-messages", sessionId],
    enabled: !!sessionId,
    queryFn: async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("id, role, message, created_at")
        .eq("session_id", sessionId!)
        .order("created_at", { ascending: true });
      return data ?? [];
    },
  });

  React.useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !sessionId) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    try {
      await send({ data: { sessionId, message: text } });
      qc.invalidateQueries({ queryKey: ["chat-messages", sessionId] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "The assistant could not respond.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">AI assistant</h1>
        <p className="mt-1 text-sm text-muted-foreground">{MEDICAL_DISCLAIMER}</p>
      </header>

      <Card className="flex-1 overflow-hidden">
        <CardContent className="h-full space-y-4 overflow-y-auto p-4">
          {!messages?.length && (
            <p className="text-sm text-muted-foreground">
              Ask anything — "Can I use retinol with niacinamide?", "Why is my skin flaking?"
            </p>
          )}
          {messages?.map((m) => (
            <div
              key={m.id}
              className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap",
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
                )}
              >
                {m.message}
              </div>
            </div>
          ))}
          <div ref={bottom} />
        </CardContent>
      </Card>

      <form onSubmit={submit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your routine, ingredients or a flare-up…"
          aria-label="Message"
        />
        <Button type="submit" disabled={sending || !input.trim()}>
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
