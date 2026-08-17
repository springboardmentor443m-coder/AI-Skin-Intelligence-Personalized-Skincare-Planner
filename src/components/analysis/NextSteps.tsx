import { Link } from "@tanstack/react-router";
import { CalendarCheck, LineChart, MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    to: "/plan",
    icon: CalendarCheck,
    title: "7-Day Plan",
    description: "Create your personalized skincare routine.",
    cta: "Open 7-Day Plan",
  },
  {
    to: "/chat",
    icon: MessagesSquare,
    title: "AI Assistant",
    description: "Ask skincare-related questions.",
    cta: "Ask AI Assistant",
  },
  {
    to: "/progress",
    icon: LineChart,
    title: "Progress",
    description: "Track your skincare journey.",
    cta: "View Progress",
  },
] as const;

export function NextSteps() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {STEPS.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.to} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-4" />
            </span>
            <div className="space-y-1">
              <p className="font-display text-sm font-semibold">{s.title}</p>
              <p className="text-xs text-muted-foreground">{s.description}</p>
            </div>
            <Button asChild variant="secondary" size="sm" className="mt-auto w-full">
              <Link to={s.to}>{s.cta}</Link>
            </Button>
          </div>
        );
      })}
    </div>
  );
}
