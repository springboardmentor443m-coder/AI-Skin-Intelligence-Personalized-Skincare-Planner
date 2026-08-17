import { conditionLabel } from "./constants";

const API_URL = (import.meta.env["VITE_AI_API_URL"] as string | undefined)?.replace(/\/$/, "");

export const isAiConfigured = Boolean(API_URL);

export type AnalysisErrorCode =
  | "AI_API_NOT_CONFIGURED"
  | "AI_API_OFFLINE"
  | "AI_ANALYSIS_FAILED"
  | "AI_ANALYSIS_TIMEOUT"
  | "AI_INVALID_IMAGE";

export class AnalysisError extends Error {
  code: AnalysisErrorCode;
  constructor(code: AnalysisErrorCode) {
    super(code);
    this.code = code;
    this.name = "AnalysisError";
  }
}

export const ERROR_COPY: Record<AnalysisErrorCode, { title: string; description: string }> = {
  AI_API_NOT_CONFIGURED: {
    title: "AI model is not configured",
    description: "Please configure VITE_AI_API_URL.",
  },
  AI_API_OFFLINE: {
    title: "AI model is currently offline",
    description: "Please start or deploy the EfficientNetV2B0 API.",
  },
  AI_ANALYSIS_FAILED: {
    title: "Analysis failed",
    description: "Unable to analyze this image. Please try again.",
  },
  AI_ANALYSIS_TIMEOUT: {
    title: "Analysis timed out",
    description: "Please try again.",
  },
  AI_INVALID_IMAGE: {
    title: "Invalid image",
    description: "Please upload a JPG, JPEG, or PNG image.",
  },
};

export type ModelStatusValue = "checking" | "ready" | "offline" | "unconfigured";

export async function checkModelHealth(): Promise<ModelStatusValue> {
  if (!API_URL) return "unconfigured";
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${API_URL}/health`, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return "offline";
    const json = (await res.json().catch(() => null)) as { status?: string } | null;
    if (json && typeof json.status === "string" && json.status.toLowerCase() !== "ok") return "offline";
    return "ready";
  } catch {
    return "offline";
  }
}

export type SkinPrediction = { condition: string; label: string; confidence: number };

export type SkinAnalysis = {
  prediction: string;
  predictionLabel: string;
  confidence: number;
  distribution: SkinPrediction[];
  gradcamUrl: string | null;
  modelVersion: string;
};

function prettify(raw: string): string {
  const key = String(raw).trim().toLowerCase().replace(/[\s-]+/g, "_");
  const known = conditionLabel(key);
  if (known !== key && known !== "—") return known;
  return key
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function normaliseConfidence(value: unknown): number {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return 0;
  return n > 1 ? n / 100 : n;
}

/** Sends the image to the external EfficientNetV2B0 API. */
export async function analyzeSkin(file: File): Promise<SkinAnalysis> {
  if (!API_URL) throw new AnalysisError("AI_API_NOT_CONFIGURED");

  const formData = new FormData();
  formData.append("file", file);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);

  let response: Response;
  try {
    response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new AnalysisError("AI_ANALYSIS_TIMEOUT");
    }
    throw new AnalysisError("AI_API_OFFLINE");
  }
  clearTimeout(timer);

  if (!response.ok) throw new AnalysisError("AI_ANALYSIS_FAILED");

  const json = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (!json) throw new AnalysisError("AI_ANALYSIS_FAILED");

  const rawDistribution =
    (json["class_distribution"] as Record<string, unknown> | undefined) ??
    (json["distribution"] as Record<string, unknown> | undefined) ??
    (json["probabilities"] as Record<string, unknown> | undefined) ??
    (json["scores"] as Record<string, unknown> | undefined);

  let distribution: SkinPrediction[] = [];

  if (rawDistribution && typeof rawDistribution === "object" && !Array.isArray(rawDistribution)) {
    distribution = Object.entries(rawDistribution).map(([k, v]) => ({
      condition: k.toLowerCase().replace(/[\s-]+/g, "_"),
      label: prettify(k),
      confidence: normaliseConfidence(v),
    }));
  } else {
    const arr =
      (json["predictions"] as Array<Record<string, unknown>> | undefined) ??
      (Array.isArray(rawDistribution) ? (rawDistribution as Array<Record<string, unknown>>) : undefined);
    if (arr) {
      distribution = arr.map((p) => {
        const raw = String(p["class"] ?? p["label"] ?? p["condition"] ?? "");
        return {
          condition: raw.toLowerCase().replace(/[\s-]+/g, "_"),
          label: prettify(raw),
          confidence: normaliseConfidence(p["confidence"] ?? p["score"] ?? p["probability"]),
        };
      });
    }
  }

  distribution.sort((a, b) => b.confidence - a.confidence);

  const rawPrediction =
    (json["prediction"] as string | undefined) ??
    (json["class"] as string | undefined) ??
    (json["label"] as string | undefined) ??
    distribution[0]?.condition;

  if (!rawPrediction) throw new AnalysisError("AI_ANALYSIS_FAILED");

  const prediction = String(rawPrediction).toLowerCase().replace(/[\s-]+/g, "_");
  const confidence =
    json["confidence"] != null
      ? normaliseConfidence(json["confidence"])
      : (distribution.find((d) => d.condition === prediction)?.confidence ?? 0);

  const gradcamRaw = (json["gradcam_url"] ?? json["gradcam"] ?? json["heatmap"]) as string | undefined;
  const gradcamUrl = gradcamRaw
    ? gradcamRaw.startsWith("data:") || gradcamRaw.startsWith("http")
      ? gradcamRaw
      : `data:image/png;base64,${gradcamRaw}`
    : null;

  return {
    prediction,
    predictionLabel: prettify(prediction),
    confidence,
    distribution,
    gradcamUrl,
    modelVersion: String(json["model_version"] ?? "efficientnetv2b0"),
  };
}
