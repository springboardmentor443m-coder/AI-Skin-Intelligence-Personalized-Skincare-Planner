import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/library")({
  head: () => ({
    meta: [
      { title: "Ingredient & Product Library — SkinIntel" },
      { name: "description", content: "Browse skincare ingredients, their purpose, irritation risk and compatible products." },
      { property: "og:title", content: "Ingredient & Product Library — SkinIntel" },
      { property: "og:description", content: "Evidence-informed ingredient intelligence for your routine." },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const [q, setQ] = React.useState("");

  const { data } = useQuery({
    queryKey: ["library"],
    queryFn: async () => {
      const [{ data: ingredients }, { data: products }] = await Promise.all([
        supabase.from("ingredients").select("*").order("name"),
        supabase.from("products").select("*").order("name"),
      ]);
      return { ingredients: ingredients ?? [], products: products ?? [] };
    },
  });

  const term = q.trim().toLowerCase();
  const ingredients = (data?.ingredients ?? []).filter(
    (i) => !term || i.name.toLowerCase().includes(term) || i.purpose.toLowerCase().includes(term),
  );
  const products = (data?.products ?? []).filter(
    (p) => !term || p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term),
  );

  const riskVariant = (risk: string) =>
    risk.toLowerCase() === "high" ? "destructive" : risk.toLowerCase() === "medium" ? "secondary" : "outline";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Ingredient intelligence</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          What each active does, who it suits, and what not to mix it with.
        </p>
      </header>

      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search ingredients or products…"
        aria-label="Search library"
        className="max-w-md"
      />

      <Tabs defaultValue="ingredients">
        <TabsList>
          <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="ingredients" className="mt-5 grid gap-4 md:grid-cols-2">
          {ingredients.map((i) => (
            <Card key={i.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-lg">{i.name}</CardTitle>
                  <Badge variant={riskVariant(i.irritation_risk)}>{i.irritation_risk} risk</Badge>
                </div>
                <CardDescription>{i.purpose}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {i.usage_guidance && <p>{i.usage_guidance}</p>}
                {i.compatibility && (
                  <p>
                    <span className="font-medium text-foreground">Pairs with:</span> {i.compatibility}
                  </p>
                )}
                {i.warnings && (
                  <p>
                    <span className="font-medium text-foreground">Caution:</span> {i.warnings}
                  </p>
                )}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {i.suitable_concerns.map((c) => (
                    <Badge key={c} variant="outline">
                      {c}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          {!ingredients.length && <p className="text-sm text-muted-foreground">No matching ingredients.</p>}
        </TabsContent>

        <TabsContent value="products" className="mt-5 grid gap-4 md:grid-cols-2">
          {products.map((p) => (
            <Card key={p.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-lg">{p.name}</CardTitle>
                  <Badge variant="secondary">{p.price_band}</Badge>
                </div>
                <CardDescription>
                  {p.brand ? `${p.brand} · ` : ""}
                  {p.category}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {p.description && <p>{p.description}</p>}
                <div className="flex flex-wrap gap-1.5">
                  {p.key_ingredients.map((k) => (
                    <Badge key={k} variant="outline">
                      {k}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          {!products.length && <p className="text-sm text-muted-foreground">No matching products.</p>}
        </TabsContent>
      </Tabs>
    </div>
  );
}
