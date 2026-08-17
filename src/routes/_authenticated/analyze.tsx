import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Brain, Gauge, ScanEye, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { computeSkinHealthScore } from "@/lib/skinScore";
import { MEDICAL_DISCLAIMER } from "@/lib/constants";
import {
  analyzeSkin,
  checkModelHealth,
  AnalysisError,
  type AnalysisErrorCode,
  type ModelStatusValue,
  type SkinAnalysis,
} from "@/lib/api";
import { ModelStatus } from "@/components/analysis/ModelStatus";
import { SkinUploader } from "@/components/analysis/SkinUploader";
import { ImagePreview } from "@/components/analysis/ImagePreview";
import { AnalyzeButton } from "@/components/analysis/AnalyzeButton";
import { AnalysisErrorCard } from "@/components/analysis/AnalysisError";
import { AnalysisResult } from "@/components/analysis/AnalysisResult";
import { ConfidenceChart } from "@/components/analysis/ConfidenceChart";
import { GradCAMViewer } from "@/components/analysis/GradCAMViewer";
import { SkinInsights } from "@/components/analysis/SkinInsights";
import { NextSteps } from "@/components/analysis/NextSteps";

export const Route = createFileRoute("/_authenticated/analyze")({
  head: () => ({
    meta: [
      { title: "AI Skin Analysis — SkinIntel" },
      {
        name: "description",
        content:
          "Upload a photo for EfficientNetV2B0 skin analysis with confidence breakdown and Grad-CAM explainability.",
      },
      { property: "og:title", content: "AI Skin Analysis — SkinIntel" },
      { property: "og:description", content: "Explainable AI skin condition detection in seconds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyzePage,
});

const FEATURES = [
  { icon: Brain, title: "AI Prediction", description: "AI-generated classification" },
  { icon: Gauge, title: "Confidence", description: "Model confidence score" },
  { icon: ScanEye, title: "Grad-CAM", description: "Visual explanation" },
] as const;

function AnalyzePage() {
  const { user } = useAuth();
  const [status, setStatus] = React.useState<ModelStatusValue>("checking");
  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [running, setRunning] = React.useState(false);
  const [result, setResult] = React.useState<SkinAnalysis | null>(null);
  const [errorCode, setErrorCode] = React.useState<AnalysisErrorCode | null>(null);

  React.useEffect(() => {
    let active = true;
    checkModelHealth().then((s) => {
      if (active) setStatus(s);
    });
    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const selectFile = (f: File) => {
    setErrorCode(null);
    setResult(null);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setErrorCode(null);
  };

  const persist = async (analysis: SkinAnalysis, image: File) => {
    if (!user) return;
    try {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      const breakdown = computeSkinHealthScore({
        condition: analysis.prediction,
        confidence: analysis.confidence,
        lifestyle: profile?.lifestyle ?? null,
        sleepQuality: profile?.sleep_quality ?? null,
        routineAdherence: null,
        waterIntakeLitres: profile?.water_intake_litres ?? null,
      });

      const path = `${user.id}/${Date.now()}-${image.name.replace(/[^\w.-]/g, "_")}`;
      const upload = await supabase.storage.from("skin-images").upload(path, image, { upsert: true });

      const { data: assessment, error } = await supabase
        .from("assessments")
        .insert({
          user_id: user.id,
          condition: analysis.prediction,
          confidence: analysis.confidence,
          skin_health_score: breakdown.total,
          image_path: upload.error ? null : path,
          gradcam_url: analysis.gradcamUrl?.startsWith("http") ? analysis.gradcamUrl : null,
          model_version: analysis.modelVersion,
        })
        .select("id")
        .single();
      if (error || !assessment) return;

      if (analysis.distribution.length > 0) {
        await supabase.from("assessment_predictions").insert(
          analysis.distribution.map((p, i) => ({
            assessment_id: assessment.id,
            user_id: user.id,
            condition: p.condition,
            confidence: p.confidence,
            rank: i + 1,
          })),
        );
      }

      await supabase.from("progress").insert({
        user_id: user.id,
        entry_date: new Date().toISOString().slice(0, 10),
        skin_health_score: breakdown.total,
        confidence: analysis.confidence,
        sleep: breakdown.sleep,
        hydration: breakdown.hydration,
        routine_adherence: breakdown.routine,
      });
    } catch {
      /* persistence is best-effort; analysis result is still shown */
    }
  };

  const run = async () => {
    if (!file || running) return;
    setRunning(true);
    setErrorCode(null);
    try {
      const analysis = await analyzeSkin(file);
      setResult(analysis);
      setStatus("ready");
      await persist(analysis, file);
    } catch (err) {
      setResult(null);
      setErrorCode(err instanceof AnalysisError ? err.code : "AI_ANALYSIS_FAILED");
      if (err instanceof AnalysisError && err.code === "AI_API_NOT_CONFIGURED") setStatus("unconfigured");
      if (err instanceof AnalysisError && err.code === "AI_API_OFFLINE") setStatus("offline");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">AI Skin Analysis</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Upload a clear skin image and let our AI model analyze visible skin patterns.
          </p>
        </div>
        <ModelStatus status={status} />
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Upload your skin photo</CardTitle>
            <CardDescription>Use a clear, well-lit JPG or PNG image.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!previewUrl ? (
              <SkinUploader onSelect={selectFile} onInvalid={() => setErrorCode("AI_INVALID_IMAGE")} />
            ) : (
              <ImagePreview
                url={previewUrl}
                name={file?.name ?? "image"}
                onChange={() => setPreviewUrl(null)}
                onRemove={clearFile}
              />
            )}

            <AnalyzeButton onClick={run} loading={running} disabled={!file} />

            {errorCode && <AnalysisErrorCard code={errorCode} onRetry={file ? run : undefined} />}

            <p className="text-xs text-muted-foreground">{MEDICAL_DISCLAIMER}</p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {!result ? (
            <Card className="h-fit">
              <CardContent className="space-y-6 py-10 text-center">
                <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Sparkles className="size-5" />
                </span>
                <div className="space-y-1">
                  <p className="font-display text-lg font-semibold">Your AI analysis will appear here</p>
                  <p className="text-sm text-muted-foreground">
                    Upload a skin image and click Analyze Skin to see your results.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {FEATURES.map((f) => {
                    const Icon = f.icon;
                    return (
                      <div
                        key={f.title}
                        className="space-y-1 rounded-2xl border border-border bg-secondary/40 p-4 text-left"
                      >
                        <Icon className="size-4 text-primary" />
                        <p className="text-sm font-medium">{f.title}</p>
                        <p className="text-xs text-muted-foreground">{f.description}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <AnalysisResult result={result} />
              <ConfidenceChart distribution={result.distribution} />
            </>
          )}
        </div>
      </div>

      {result && (
        <div className="space-y-6">
          <GradCAMViewer originalUrl={previewUrl} gradcamUrl={result.gradcamUrl} />
          <SkinInsights label={result.predictionLabel} confidence={result.confidence} />
          <NextSteps />
        </div>
      )}
    </div>
  );
}
