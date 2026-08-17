import { MSC6_CLASSES } from "./constants";

export type Prediction = { condition: string; confidence: number };

export type VisionResult = {
  predictions: Prediction[];
  gradcamDataUrl?: string | null;
  modelVersion: string;
};

const API_URL = import.meta.env["VITE_AI_API_URL"] as string | undefined;

function normaliseClass(raw: string): string {
  const key = String(raw).trim().toLowerCase().replace(/[\s-]+/g, "_");
  if ((MSC6_CLASSES as readonly string[]).includes(key)) return key;
  if (key.includes("acne")) return "acne";
  if (key.includes("eczema")) return "eczema";
  if (key.includes("spot") || key.includes("pigment")) return "dark_spots";
  if (key.includes("rosacea")) return "rosacea";
  if (key.includes("wrinkle")) return "wrinkles";
  return "normal_skin";
}

/**
 * Calls the external EfficientNetV2B0 inference API.
 * The endpoint must accept multipart/form-data with a `file` field and return
 * either { predictions: [{ class, confidence }], gradcam } or { class, confidence }.
 */
export async function analyseSkinImage(file: File): Promise<VisionResult> {
  if (!API_URL) {
    throw new Error(
      "The skin analysis model endpoint is not configured. Set VITE_AI_API_URL to your EfficientNetV2B0 API.",
    );
  }

  const form = new FormData();
  form.append("file", file);
  form.append("image", file);

  const res = await fetch(`${API_URL.replace(/\/$/, "")}/predict`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Model API responded with ${res.status}. Please try again shortly.`);
  }

  const json = (await res.json()) as Record<string, unknown>;

  const rawPreds =
    (json["predictions"] as Array<Record<string, unknown>> | undefined) ??
    (json["class"] || json["label"]
      ? [{ class: json["class"] ?? json["label"], confidence: json["confidence"] ?? 0 }]
      : []);

  const predictions: Prediction[] = rawPreds
    .map((p) => {
      const conf = Number(p["confidence"] ?? p["score"] ?? 0);
      return {
        condition: normaliseClass(String(p["class"] ?? p["label"] ?? p["condition"] ?? "")),
        confidence: conf > 1 ? conf / 100 : conf,
      };
    })
    .sort((a, b) => b.confidence - a.confidence);

  if (predictions.length === 0) {
    throw new Error("The model returned no prediction for this image.");
  }

  const gradcam = (json["gradcam"] ?? json["gradcam_url"] ?? json["heatmap"]) as string | undefined;

  return {
    predictions,
    gradcamDataUrl: gradcam
      ? gradcam.startsWith("data:") || gradcam.startsWith("http")
        ? gradcam
        : `data:image/png;base64,${gradcam}`
      : null,
    modelVersion: String(json["model_version"] ?? "efficientnetv2b0"),
  };
}

export const isVisionConfigured = Boolean(API_URL);
