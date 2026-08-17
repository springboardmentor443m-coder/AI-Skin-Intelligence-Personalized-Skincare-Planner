import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { conditionLabel } from "@/lib/constants";
import { scoreBand } from "@/lib/skinScore";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/progress")({
  head: () => ({
    meta: [
      { title: "Progress Tracking — SkinIntel" },
      { name: "description", content: "See how your skin health score trends over time and compare before/after scans." },
      { property: "og:title", content: "Progress Tracking — SkinIntel" },
      { property: "og:description", content: "Before and after comparison plus skin health score history." },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ["progress", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const [{ data: entries }, { data: assessments }] = await Promise.all([
        supabase.from("progress").select("*").order("entry_date", { ascending: true }),
        supabase.from("assessments").select("*").order("created_at", { ascending: true }),
      ]);
      return { entries: entries ?? [], assessments: assessments ?? [] };
    },
  });

  const [firstUrl, setFirstUrl] = React.useState<string | null>(null);
  const [lastUrl, setLastUrl] = React.useState<string | null>(null);

  const first = data?.assessments[0];
  const last = data?.assessments.length ? data.assessments[data.assessments.length - 1] : undefined;

  React.useEffect(() => {
    let cancelled = false;
    const sign = async (path: string | null | undefined, set: (v: string | null) => void) => {
      if (!path) return set(null);
      const { data } = await supabase.storage.from("skin-images").createSignedUrl(path, 3600);
      if (!cancelled) set(data?.signedUrl ?? null);
    };
    sign(first?.image_path, setFirstUrl);
    sign(last?.image_path, setLastUrl);
    return () => {
      cancelled = true;
    };
  }, [first?.image_path, last?.image_path]);

  const scores = (data?.entries ?? []).map((e) => e.skin_health_score ?? 0);
  const latest = scores.length ? scores[scores.length - 1]! : null;
  const delta = scores.length > 1 ? latest! - scores[0]! : 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Progress</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your skin health trajectory across assessments.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Current score</CardDescription>
            <CardTitle className="font-display text-4xl">{latest ?? "—"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">{scoreBand(latest)}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Change since first scan</CardDescription>
            <CardTitle className="font-display text-4xl">
              {delta > 0 ? `+${delta}` : delta}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {data?.entries.length ?? 0} logged entries
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Latest condition</CardDescription>
            <CardTitle className="font-display text-2xl">{conditionLabel(last?.condition)}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {last ? `${Math.round(Number(last.confidence) * 100)}% confidence` : "No scans yet"}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Score history</CardTitle>
          <CardDescription>Each bar is one logged assessment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!data?.entries.length && <p className="text-sm text-muted-foreground">No entries yet.</p>}
          {data?.entries.map((e) => (
            <div key={e.id} className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{e.entry_date}</span>
                <span>{e.skin_health_score ?? "—"}</span>
              </div>
              <Progress value={e.skin_health_score ?? 0} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Before & after</CardTitle>
          <CardDescription>First scan compared with your most recent one.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <figure className="space-y-2">
            {firstUrl ? (
              <img src={firstUrl} alt="First skin assessment photo" className="w-full rounded-2xl object-cover" />
            ) : (
              <div className="flex h-48 items-center justify-center rounded-2xl bg-secondary text-sm text-muted-foreground">
                No image
              </div>
            )}
            <figcaption className="text-xs text-muted-foreground">
              Before — {conditionLabel(first?.condition)} · score {first?.skin_health_score ?? "—"}
            </figcaption>
          </figure>
          <figure className="space-y-2">
            {lastUrl ? (
              <img src={lastUrl} alt="Most recent skin assessment photo" className="w-full rounded-2xl object-cover" />
            ) : (
              <div className="flex h-48 items-center justify-center rounded-2xl bg-secondary text-sm text-muted-foreground">
                No image
              </div>
            )}
            <figcaption className="text-xs text-muted-foreground">
              After — {conditionLabel(last?.condition)} · score {last?.skin_health_score ?? "—"}
            </figcaption>
          </figure>
        </CardContent>
      </Card>
    </div>
  );
}
