import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import {
  AGE_GROUPS,
  BUDGETS,
  ENVIRONMENTS,
  GOALS,
  LIFESTYLES,
  SKIN_CONCERNS,
  SKIN_TYPES,
  SUN_EXPOSURE,
} from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Skin Profile — SkinIntel" },
      { name: "description", content: "Tell SkinIntel about your skin type, concerns, lifestyle and goals." },
      { property: "og:title", content: "Skin Profile — SkinIntel" },
      { property: "og:description", content: "Personalise your AI skincare plan with your skin profile." },
    ],
  }),
  component: ProfilePage,
});

type ProfileForm = {
  full_name: string;
  age: string;
  age_group: string;
  skin_type: string;
  lifestyle: string;
  sun_exposure: string;
  environment: string;
  budget: string;
  sleep_quality: string;
  water_intake_litres: string;
  skin_concerns: string[];
  goals: string[];
  sensitivities: string;
  allergies: string;
  current_products: string;
};

const empty: ProfileForm = {
  full_name: "",
  age: "",
  age_group: "",
  skin_type: "",
  lifestyle: "",
  sun_exposure: "",
  environment: "",
  budget: "",
  sleep_quality: "",
  water_intake_litres: "",
  skin_concerns: [],
  goals: [],
  sensitivities: "",
  allergies: "",
  current_products: "",
};

function toList(v: string) {
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = React.useState<ProfileForm>(empty);
  const [saving, setSaving] = React.useState(false);

  const { data } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  React.useEffect(() => {
    if (!data) return;
    setForm({
      full_name: data.full_name ?? "",
      age: data.age?.toString() ?? "",
      age_group: data.age_group ?? "",
      skin_type: data.skin_type ?? "",
      lifestyle: data.lifestyle ?? "",
      sun_exposure: data.sun_exposure ?? "",
      environment: data.environment ?? "",
      budget: data.budget ?? "",
      sleep_quality: data.sleep_quality?.toString() ?? "",
      water_intake_litres: data.water_intake_litres?.toString() ?? "",
      skin_concerns: data.skin_concerns ?? [],
      goals: data.goals ?? [],
      sensitivities: (data.sensitivities ?? []).join(", "),
      allergies: (data.allergies ?? []).join(", "),
      current_products: (data.current_products ?? []).join(", "),
    });
  }, [data]);

  const set = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggle = (key: "skin_concerns" | "goals", value: string) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value],
    }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: form.full_name || null,
      age: form.age ? Number(form.age) : null,
      age_group: form.age_group || null,
      skin_type: form.skin_type || null,
      lifestyle: form.lifestyle || null,
      sun_exposure: form.sun_exposure || null,
      environment: form.environment || null,
      budget: form.budget || null,
      sleep_quality: form.sleep_quality ? Number(form.sleep_quality) : null,
      water_intake_litres: form.water_intake_litres ? Number(form.water_intake_litres) : null,
      skin_concerns: form.skin_concerns,
      goals: form.goals,
      sensitivities: toList(form.sensitivities),
      allergies: toList(form.allergies),
      current_products: toList(form.current_products),
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Skin profile saved.");
  };

  const pick = (label: string, key: keyof ProfileForm, options: readonly string[]) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={form[key] as string} onValueChange={(v) => set(key, v as never)}>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <form onSubmit={save} className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Skin profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The more we know, the more precise your plan and AI guidance become.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basics</CardTitle>
          <CardDescription>About you and your skin.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input id="age" type="number" min={10} max={100} value={form.age} onChange={(e) => set("age", e.target.value)} />
          </div>
          {pick("Age group", "age_group", AGE_GROUPS)}
          {pick("Skin type", "skin_type", SKIN_TYPES)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Concerns & goals</CardTitle>
          <CardDescription>Tap all that apply.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Skin concerns</Label>
            <div className="flex flex-wrap gap-2">
              {SKIN_CONCERNS.map((c) => (
                <Badge
                  key={c}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggle("skin_concerns", c)}
                  variant={form.skin_concerns.includes(c) ? "default" : "outline"}
                  className="cursor-pointer"
                >
                  {c}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Goals</Label>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <Badge
                  key={g}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggle("goals", g)}
                  variant={form.goals.includes(g) ? "default" : "outline"}
                  className="cursor-pointer"
                >
                  {g}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lifestyle & environment</CardTitle>
          <CardDescription>These feed directly into your skin health score.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {pick("Lifestyle", "lifestyle", LIFESTYLES)}
          {pick("Sun exposure", "sun_exposure", SUN_EXPOSURE)}
          {pick("Environment", "environment", ENVIRONMENTS)}
          {pick("Budget", "budget", BUDGETS)}
          <div className="space-y-2">
            <Label htmlFor="sleep">Sleep quality (1–10)</Label>
            <Input
              id="sleep"
              type="number"
              min={1}
              max={10}
              value={form.sleep_quality}
              onChange={(e) => set("sleep_quality", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="water">Water intake (litres/day)</Label>
            <Input
              id="water"
              type="number"
              step="0.1"
              min={0}
              max={6}
              value={form.water_intake_litres}
              onChange={(e) => set("water_intake_litres", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sensitivities & products</CardTitle>
          <CardDescription>Comma separated.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sens">Sensitivities</Label>
            <Input id="sens" value={form.sensitivities} onChange={(e) => set("sensitivities", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="allerg">Allergies</Label>
            <Input id="allerg" value={form.allergies} onChange={(e) => set("allergies", e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="prods">Current products</Label>
            <Input id="prods" value={form.current_products} onChange={(e) => set("current_products", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
