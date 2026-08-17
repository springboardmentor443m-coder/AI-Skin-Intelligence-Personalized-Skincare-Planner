import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ScanFace, CalendarCheck, LineChart, MessagesSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { conditionLabel, MEDICAL_DISCLAIMER } from "@/lib/constants";
import { scoreBand } from "@/lib/skinScore";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — SkinIntel" },
      { name: "description", content: "Your skin health score, latest AI assessment and today's routine at a glance." },
      { property: "og:title", content: "Dashboard — SkinIntel" },
      { property: "og:description", content: "Track your skin health score and daily skincare routine." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ["dashboard", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const [assessment, profile, routine] = await Promise.all([
        supabase
          .from("assessments")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle(),
        supabase
          .from("routines")
          .select("id, start_date, rationale, is_active, week_number")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      return {
        assessment: assessment.data,
        profile: profile.data,
        routine: routine.data,
      };
    },
  });

  const score = data?.assessment?.skin_health_score ?? null;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Hello{data?.profile?.full_name ? `, ${data.profile.full_name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Here's your skin intelligence snapshot.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardDescription>AI Skin Health Score</CardDescription>
            <CardTitle className="font-display text-4xl">{score ?? "—"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={score ?? 0} />
            <Badge variant="secondary">{scoreBand(score)}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Latest assessment</CardDescription>
            <CardTitle className="font-display text-2xl">
              {conditionLabel(data?.assessment?.condition)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              {data?.assessment
                ? `${Math.round(Number(data.assessment.confidence) * 100)}% confidence`
                : "No scan yet."}
            </p>
            <Button asChild size="sm" variant="outline">
              <Link to="/analyze">
                <ScanFace className="size-4" /> Run analysis
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active plan</CardDescription>
            <CardTitle className="font-display text-2xl">
              {data?.routine ? `Week ${data.routine.week_number}` : "None"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p className="line-clamp-2">{data?.routine?.rationale ?? "Generate a personalised 7-day plan."}</p>
            <Button asChild size="sm" variant="outline">
              <Link to="/plan">
                <CalendarCheck className="size-4" /> Open plan
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <LineChart className="size-4 text-primary" /> Track progress
            </CardTitle>
            <CardDescription>Log sleep, hydration and adherence, and compare before/after photos.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" size="sm">
              <Link to="/progress">View progress</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessagesSquare className="size-4 text-primary" /> Ask the AI assistant
            </CardTitle>
            <CardDescription>Context-aware answers based on your profile and latest scan.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" size="sm">
              <Link to="/chat">Start chatting</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">{MEDICAL_DISCLAIMER}</p>
    </div>
  );
}
