import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Sun, Moon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from "@/hooks/useAuth";
import { generatePlan } from "@/lib/planGenerator";
import { FEEDBACK_OPTIONS } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/plan")({
  head: () => ({
    meta: [
      { title: "7-Day Skincare Plan — SkinIntel" },
      { name: "description", content: "A personalised 7-day morning and evening skincare routine with daily task tracking." },
      { property: "og:title", content: "7-Day Skincare Plan — SkinIntel" },
      { property: "og:description", content: "Follow a plan built around your skin condition, type and goals." },
    ],
  }),
  component: PlanPage,
});

function PlanPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [generating, setGenerating] = React.useState(false);

  const { data } = useQuery({
    queryKey: ["plan", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data: routine } = await supabase
        .from("routines")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!routine) return { routine: null, days: [], tasks: [] };
      const [{ data: days }, { data: tasks }] = await Promise.all([
        supabase.from("routine_days").select("*").eq("routine_id", routine.id).order("day_number"),
        supabase.from("routine_tasks").select("*").eq("user_id", user!.id),
      ]);
      return { routine, days: days ?? [], tasks: tasks ?? [] };
    },
  });

  const generate = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const [{ data: assessment }, { data: profile }] = await Promise.all([
        supabase
          .from("assessments")
          .select("id, condition")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      ]);

      const plan = generatePlan(assessment?.condition ?? "normal_skin", {
        skinType: profile?.skin_type ?? null,
        concerns: profile?.skin_concerns ?? [],
        sensitivities: profile?.sensitivities ?? [],
        budget: profile?.budget ?? null,
        goals: profile?.goals ?? [],
      });

      await supabase.from("routines").update({ is_active: false }).eq("user_id", user.id).eq("is_active", true);

      const { data: routine, error } = await supabase
        .from("routines")
        .insert({
          user_id: user.id,
          assessment_id: assessment?.id ?? null,
          rationale: plan.rationale,
          start_date: new Date().toISOString().slice(0, 10),
          is_active: true,
          generated_by: "rule_engine",
          week_number: 1,
        })
        .select("id")
        .single();
      if (error) throw error;

      const { data: insertedDays, error: dayError } = await supabase
        .from("routine_days")
        .insert(
          plan.days.map((d) => ({
            routine_id: routine.id,
            user_id: user.id,
            day_number: d.dayNumber,
            title: d.title,
            focus: d.focus,
            morning_steps: d.morningSteps,
            evening_steps: d.eveningSteps,
            notes: d.notes,
          })),
        )
        .select("id, day_number");
      if (dayError) throw dayError;

      const taskRows = (insertedDays ?? []).flatMap((row) => {
        const src = plan.days.find((d) => d.dayNumber === row.day_number);
        return (src?.tasks ?? []).map((t) => ({
          routine_day_id: row.id,
          user_id: user.id,
          label: t.label,
          category: t.category,
        }));
      });
      await supabase.from("routine_tasks").insert(taskRows);

      toast.success("Your 7-day plan is ready.");
      qc.invalidateQueries({ queryKey: ["plan", user.id] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not generate the plan.");
    } finally {
      setGenerating(false);
    }
  };

  const toggleTask = async (id: string, completed: boolean) => {
    await supabase
      .from("routine_tasks")
      .update({ completed, completed_at: completed ? new Date().toISOString() : null })
      .eq("id", id);
    qc.invalidateQueries({ queryKey: ["plan", user?.id] });
  };

  const logFeedback = async (dayId: string, feedback: string) => {
    if (!user) return;
    await supabase.from("daily_feedback").insert({ user_id: user.id, routine_day_id: dayId, feedback });
    toast.success("Feedback logged.");
  };

  const total = data?.tasks.length ?? 0;
  const done = data?.tasks.filter((t) => t.completed).length ?? 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">7-day plan</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total ? `${done} of ${total} tasks completed` : "Generate a routine tailored to your latest assessment."}
          </p>
        </div>
        <Button onClick={generate} disabled={generating}>
          <Sparkles className="size-4" />
          {generating ? "Generating…" : data?.routine ? "Regenerate plan" : "Generate plan"}
        </Button>
      </header>

      {data?.routine?.rationale && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Why this plan</CardTitle>
            <CardDescription>{data.routine.rationale}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {!data?.routine && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No active plan yet. Run a skin analysis first for the most accurate routine.
          </CardContent>
        </Card>
      )}

      {!!data?.days.length && (
        <Accordion type="single" collapsible defaultValue="day-1" className="space-y-3">
          {data.days.map((day) => {
            const tasks = data.tasks.filter((t) => t.routine_day_id === day.id);
            return (
              <AccordionItem key={day.id} value={`day-${day.day_number}`} className="rounded-2xl border border-border px-4">
                <AccordionTrigger className="text-left">
                  <div className="flex flex-1 items-center justify-between gap-3 pr-2">
                    <span className="font-medium">{day.title}</span>
                    <Badge variant="secondary">
                      {tasks.filter((t) => t.completed).length}/{tasks.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-5 pb-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                        <Sun className="size-4 text-primary" /> Morning
                      </p>
                      <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                        {day.morning_steps.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ol>
                    </div>
                    <div>
                      <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                        <Moon className="size-4 text-primary" /> Evening
                      </p>
                      <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                        {day.evening_steps.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {day.notes && <p className="rounded-xl bg-secondary p-3 text-xs">{day.notes}</p>}

                  <div className="space-y-2">
                    {tasks.map((t) => (
                      <label key={t.id} className="flex items-center gap-3 text-sm">
                        <Checkbox
                          checked={t.completed}
                          onCheckedChange={(v) => toggleTask(t.id, v === true)}
                        />
                        <span className={t.completed ? "text-muted-foreground line-through" : ""}>{t.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">How did your skin feel?</span>
                    {FEEDBACK_OPTIONS.map((f) => (
                      <Button key={f} size="sm" variant="outline" onClick={() => logFeedback(day.id, f)}>
                        {f}
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

    </div>
  );
}
