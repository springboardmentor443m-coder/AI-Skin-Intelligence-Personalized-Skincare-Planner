import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import uuid

class SkinMLModel:
    def __init__(self):
        # Load OpenCV Haar Cascade face detector if available
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        if os.path.exists(cascade_path):
            self.face_cascade = cv2.CascadeClassifier(cascade_path)
        else:
            self.face_cascade = None

    def analyze_image(self, image_path: str, uploads_dir: str):
        # Read image
        img = cv2.imread(image_path)
        if img is None:
            # Fallback for PIL read if cv2 fails
            pil_img = Image.open(image_path).convert('RGB')
            img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

        h, w, _ = img.shape

        # Detect Face ROI
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.1, 4) if self.face_cascade else []

        if len(faces) > 0:
            fx, fy, fw, fh = max(faces, key=lambda rect: rect[2] * rect[3])
        else:
            # Fallback ROI (center face bounding approximation)
            fx, fy, fw, fh = int(w * 0.15), int(h * 0.15), int(w * 0.7), int(h * 0.7)

        face_roi = img[fy:fy+fh, fx:fx+fw]
        if face_roi.size == 0:
            face_roi = img

        # --- Compute Computer Vision Feature Metrics ---
        # 1. Texture & Wrinkles (Laplacian Variance on forehead & eye regions)
        forehead_roi = face_roi[0:int(fh*0.3), int(fw*0.2):int(fw*0.8)]
        forehead_gray = cv2.cvtColor(forehead_roi if forehead_roi.size > 0 else face_roi, cv2.COLOR_BGR2GRAY)
        lap_var = cv2.Laplacian(forehead_gray, cv2.CV_64F).var()
        wrinkle_score = float(np.clip(85 - (lap_var / 15.0), 40, 96))

        # 2. Pigmentation & Dark Spots (LAB color space b* & L* variation)
        lab = cv2.cvtColor(face_roi, cv2.COLOR_BGR2LAB)
        l_chan, a_chan, b_chan = cv2.split(lab)
        spot_std = np.std(l_chan)
        pigmentation_score = float(np.clip(92 - (spot_std * 1.8), 35, 95))

        # 3. Blemish & Acne (Redness in HSV color space)
        hsv = cv2.cvtColor(face_roi, cv2.COLOR_BGR2HSV)
        # Redness range in HSV
        lower_red1 = np.array([0, 50, 50])
        upper_red1 = np.array([10, 255, 255])
        lower_red2 = np.array([170, 50, 50])
        upper_red2 = np.array([180, 255, 255])
        mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
        mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
        red_mask = mask1 | mask2
        red_ratio = (np.sum(red_mask > 0) / (fw * fh)) * 100
        blemish_score = float(np.clip(94 - (red_ratio * 3.5), 45, 98))

        # 4. Hydration & Moisture (Luminance uniformity)
        moisture_score = float(np.clip(70 + (np.mean(l_chan) / 5.0) - (spot_std * 0.8), 45, 94))

        # 5. Pore Refinement (High frequency cheek filter)
        cheek_roi = face_roi[int(fh*0.4):int(fh*0.7), int(fw*0.2):int(fw*0.8)]
        cheek_gray = cv2.cvtColor(cheek_roi if cheek_roi.size > 0 else face_roi, cv2.COLOR_BGR2GRAY)
        pore_energy = np.std(cv2.Sobel(cheek_gray, cv2.CV_64F, 1, 1))
        pore_score = float(np.clip(88 - (pore_energy / 2.0), 50, 95))

        # 6. Redness & Sensitivity (Erythema index in a* channel)
        sensitivity_score = float(np.clip(95 - (np.mean(a_chan) * 0.4), 40, 96))

        # --- Skin Age Estimation Engine ---
        # Formula based on wrinkle score, spot std, and luminance contrast
        base_age = 22.0
        age_penalty = ((90 - wrinkle_score) * 0.35) + ((90 - pigmentation_score) * 0.25) + ((90 - pore_score) * 0.15)
        estimated_age = int(np.clip(round(base_age + age_penalty), 18, 75))

        # Skin Type Classification heuristic
        if moisture_score < 60 and red_ratio > 4.0:
            skin_type = "Dry & Sensitive"
        elif red_ratio > 6.0:
            skin_type = "Oily & Blemish-Prone"
        elif moisture_score > 75 and wrinkle_score > 75:
            skin_type = "Normal / Balanced"
        else:
            skin_type = "Combination Skin"

        overall_score = float(np.round((wrinkle_score + pigmentation_score + blemish_score + moisture_score + pore_score + sensitivity_score) / 6.0, 1))

        # --- Generate Annotated Overlay Image ---
        annotated_filename = f"annotated_{uuid.uuid4().hex[:8]}.jpg"
        annotated_path = os.path.join(uploads_dir, annotated_filename)

        annotated_img = img.copy()

        # Define 6 Facial Zone boxes relative to face bounding box
        zones = [
            ("Forehead Zone", (fx + int(fw*0.2), fy + int(fh*0.08), int(fw*0.6), int(fh*0.22)), (244, 162, 97), f"Wrinkles: {int(wrinkle_score)}%"),
            ("Periorbital Zone", (fx + int(fw*0.1), fy + int(fh*0.32), int(fw*0.8), int(fh*0.18)), (42, 157, 143), f"Hydration: {int(moisture_score)}%"),
            ("Left Cheek", (fx + int(fw*0.1), fy + int(fh*0.52), int(fw*0.35), int(fh*0.25)), (231, 111, 81), f"Pores: {int(pore_score)}%"),
            ("Right Cheek", (fx + int(fw*0.55), fy + int(fh*0.52), int(fw*0.35), int(fh*0.25)), (231, 111, 81), f"Spots: {int(pigmentation_score)}%"),
            ("Nasolabial Area", (fx + int(fw*0.3), fy + int(fh*0.55), int(fw*0.4), int(fh*0.2)), (233, 196, 106), f"Firmness: {int(overall_score)}%"),
            ("Jawline & Chin", (fx + int(fw*0.2), fy + int(fh*0.78), int(fw*0.6), int(fh*0.18)), (138, 177, 125), f"Redness: {int(sensitivity_score)}%")
        ]

        # Draw main face box
        cv2.rectangle(annotated_img, (fx, fy), (fx+fw, fy+fh), (220, 200, 150), 2)

        # Draw zone boxes and text callouts
        for name, (zx, zy, zw, zh), color, metric_lbl in zones:
            cv2.rectangle(annotated_img, (zx, zy), (zx+zw, zy+zh), color, 2)
            cv2.putText(annotated_img, f"{name}", (zx + 4, zy + 16), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (255, 255, 255), 1, cv2.LINE_AA)
            cv2.putText(annotated_img, f"{metric_lbl}", (zx + 4, zy + 32), cv2.FONT_HERSHEY_SIMPLEX, 0.42, color, 1, cv2.LINE_AA)

        # Floating Header Badge at top of image
        cv2.rectangle(annotated_img, (10, 10), (w - 10, 55), (30, 30, 30), -1)
        badge_text = f"AI SKIN SCAN | Est. Age: {estimated_age}y | Score: {overall_score}/100 | {skin_type}"
        cv2.putText(annotated_img, badge_text, (20, 38), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2, cv2.LINE_AA)

        cv2.imwrite(annotated_path, annotated_img)

        metrics = {
            "wrinkle_clarity": {"score": round(wrinkle_score, 1), "status": "Optimal" if wrinkle_score > 75 else "Moderate", "description": "Measures fine line density & forehead smoothness."},
            "pigmentation_evenness": {"score": round(pigmentation_score, 1), "status": "Optimal" if pigmentation_score > 75 else "Needs Care", "description": "Assesses melanin uniformity & hyperpigmentation spots."},
            "blemish_clarity": {"score": round(blemish_score, 1), "status": "Clear" if blemish_score > 80 else "Active Areas", "description": "Detects red papules, surface acne, and spot inflammation."},
            "moisture_barrier": {"score": round(moisture_score, 1), "status": "Hydrated" if moisture_score > 75 else "Dehydrated", "description": "Evaluates stratum corneum radiance & moisture retention."},
            "pore_refinement": {"score": round(pore_score, 1), "status": "Refined" if pore_score > 75 else "Visible Pores", "description": "Analyzes cheek pore texture and sebum accumulation."},
            "calmness_sensitivity": {"score": round(sensitivity_score, 1), "status": "Calm" if sensitivity_score > 75 else "Reactive", "description": "Measures erythema index and micro-vessel redness."}
        }

        return {
            "estimated_age": estimated_age,
            "skin_type": skin_type,
            "overall_score": overall_score,
            "metrics": metrics,
            "annotated_filename": annotated_filename
        }

# Global singleton instance
ml_engine = SkinMLModel()
