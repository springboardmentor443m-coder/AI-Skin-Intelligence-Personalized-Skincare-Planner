import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, ScanFace, CalendarCheck, LineChart, MessagesSquare, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/layout/AppShell";
import { MEDICAL_DISCLAIMER } from "@/lib/constants";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkinIntel — AI Skin Intelligence & Skincare Planner" },
      {
        name: "description",
        content:
          "Analyse your skin with explainable AI, get a personalised 7-day routine, track progress and chat with a skincare assistant.",
      },
      { property: "og:title", content: "SkinIntel — AI Skin Intelligence & Skincare Planner" },
      {
        property: "og:description",
        content: "Explainable AI skin analysis, personalised 7-day plans and progress tracking.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: ScanFace, title: "Explainable analysis", body: "EfficientNetV2B0 detection across six skin conditions with Grad-CAM heatmaps." },
  { icon: CalendarCheck, title: "7-day plans", body: "Morning and evening routines tuned to your skin type, sensitivities and goals." },
  { icon: LineChart, title: "Progress tracking", body: "A weighted skin health score with before/after photo comparison." },
  { icon: MessagesSquare, title: "AI assistant", body: "Context-aware guidance that remembers your profile and past scans." },
  { icon: FlaskConical, title: "Ingredient intelligence", body: "Purpose, irritation risk and pairing rules for every active." },
  { icon: Leaf, title: "Gentle by design", body: "Actives ramp slowly and rest days are built in for sensitive skin." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <span className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Leaf className="size-5" />
          </span>
          <span className="font-display text-lg font-semibold">
            Skin<span className="text-primary">Intel</span>
          </span>
        </span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm">
            <Link to="/auth">Get started</Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="font-display text-4xl leading-tight font-semibold tracking-tight sm:text-6xl">
            Skin intelligence, <span className="text-primary">personalised</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
            Upload a photo, understand what your skin is doing, and follow a 7-day routine built around your
            condition, lifestyle and goals.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/auth">Analyse my skin</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth">Sign in</Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <Card key={f.title}>
                  <CardHeader>
                    <Icon className="size-5 text-primary" />
                    <CardTitle className="text-lg">{f.title}</CardTitle>
                    <CardDescription>{f.body}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <p className="text-xs text-muted-foreground">{MEDICAL_DISCLAIMER}</p>
        </div>
      </footer>
    </div>
  );
}
