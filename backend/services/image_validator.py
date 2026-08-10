import os
import cv2
import numpy as np
from PIL import Image

# Singleton Haar Cascade Classifiers pre-loaded ONCE
_face_cascade = None
_profile_cascade = None

def get_face_cascades():
    global _face_cascade, _profile_cascade
    if _face_cascade is None or _profile_cascade is None:
        try:
            cascade_path = getattr(cv2, "data", None)
            if cascade_path and hasattr(cascade_path, "haarcascades"):
                c_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
                p_path = cv2.data.haarcascades + 'haarcascade_profileface.xml'
                _face_cascade = cv2.CascadeClassifier(c_path)
                _profile_cascade = cv2.CascadeClassifier(p_path)
        except Exception:
            _face_cascade = None
            _profile_cascade = None
    return _face_cascade, _profile_cascade

def validate_skin_image(image_path: str) -> dict:
    """
    Production-grade multi-signal image validation layer for AI Skin Care pipeline.
    Validates brightness, sharpness, face presence, skin color distribution,
    scene dominance (green foliage, blue sky/water), and object edge density.

    Returns:
        dict: {
            "valid_image": bool,
            "message": str or None,
            "reason": str,
            "details": dict
        }
    """
    if not os.path.exists(image_path):
        return {
            "valid_image": False,
            "message": "Image file not found.",
            "reason": "file_not_found",
            "details": {}
        }

    try:
        # Load image via OpenCV
        img_bgr = cv2.imread(image_path)
        if img_bgr is None or img_bgr.size == 0:
            # Fallback PIL load
            pil_img = Image.open(image_path).convert("RGB")
            img_rgb = np.array(pil_img)
            img_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)

        height, width = img_bgr.shape[:2]
        total_pixels = height * width

        if total_pixels < 100 * 100:
            return {
                "valid_image": False,
                "message": "Image resolution is too low. Please upload a higher resolution photo.",
                "reason": "low_resolution",
                "details": {"height": height, "width": width}
            }

        # Color Space Conversions
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        img_ycbcr = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2YCrCb)
        img_hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)

        # 1. Brightness / Luminance Check
        mean_brightness = float(np.mean(gray))
        if mean_brightness < 35.0:
            return {
                "valid_image": False,
                "message": "Lighting is too low for accurate skin diagnosis. Please take a photo in a well-lit area.",
                "reason": "too_dark",
                "details": {"brightness": round(mean_brightness, 2)}
            }
        if mean_brightness > 242.0:
            return {
                "valid_image": False,
                "message": "Lighting is overexposed. Please avoid harsh direct flash or bright background lighting.",
                "reason": "too_bright",
                "details": {"brightness": round(mean_brightness, 2)}
            }

        # 2. Blur / Sharpness Check (Laplacian Variance)
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        if laplacian_var < 18.0:
            return {
                "valid_image": False,
                "message": "Image is too blurry. Please hold steady and take a sharp photo of the skin area.",
                "reason": "blurry",
                "details": {"laplacian_variance": round(laplacian_var, 2)}
            }

        # 3. Face Detection Check (Haar Cascade - Singleton loaded with safe fallback)
        has_face = False
        face_count = 0
        try:
            face_cascade, profile_cascade = get_face_cascades()
            if face_cascade is not None:
                faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(50, 50))
                if len(faces) > 0:
                    has_face = True
                    face_count = len(faces)
            if not has_face and profile_cascade is not None:
                p_faces = profile_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(50, 50))
                if len(p_faces) > 0:
                    has_face = True
                    face_count = len(p_faces)
        except Exception:
            has_face = False

        # 4. Multi-Space Skin Color Mask (YCbCr + HSV)
        # YCbCr space: OpenCV YCrCb order is Y=0, Cr=1, Cb=2
        # Cb in [77, 128], Cr in [133, 173], Y in [20, 245]
        y_chan = img_ycbcr[:, :, 0]
        cr_chan = img_ycbcr[:, :, 1]
        cb_chan = img_ycbcr[:, :, 2]
        
        ycbcr_skin = (y_chan >= 20) & (y_chan <= 245) & (cb_chan >= 77) & (cb_chan <= 128) & (cr_chan >= 133) & (cr_chan <= 173)

        # HSV space: H=0, S=1, V=2
        # H in [0, 25] or [160, 180], S in [25, 180], V in [45, 250]
        h_chan = img_hsv[:, :, 0]
        s_chan = img_hsv[:, :, 1]
        v_chan = img_hsv[:, :, 2]
        
        hsv_skin = ((h_chan <= 25) | (h_chan >= 160)) & (s_chan >= 25) & (s_chan <= 180) & (v_chan >= 45) & (v_chan <= 250)

        skin_mask = ycbcr_skin & hsv_skin
        skin_pixels = np.sum(skin_mask)
        skin_ratio = float(skin_pixels / total_pixels)

        # 5. Scene Dominance & Non-Skin Filtering
        # Green dominance (Foliage / Grass / Trees)
        r_chan = img_rgb[:, :, 0]
        g_chan = img_rgb[:, :, 1]
        b_chan = img_rgb[:, :, 2]

        green_mask = (g_chan > r_chan + 10) & (g_chan > b_chan + 10)
        green_ratio = float(np.sum(green_mask) / total_pixels)

        # Blue dominance (Sky / Water / Sea)
        blue_mask = (b_chan > r_chan + 15) & (b_chan > g_chan + 10)
        blue_ratio = float(np.sum(blue_mask) / total_pixels)

        # Edge & Texture Density (Objects / Food / Keyboards / Print)
        edges = cv2.Canny(gray, 50, 150)
        edge_ratio = float(np.sum(edges > 0) / total_pixels)

        # 6. Evaluation Rules
        if green_ratio > 0.22:
            return {
                "valid_image": False,
                "message": "This doesn't appear to be a clear skin/face image. Please upload a clear photo of the affected skin area.",
                "reason": "green_foliage_landscape",
                "details": {"green_ratio": round(green_ratio, 3)}
            }

        if blue_ratio > 0.22:
            return {
                "valid_image": False,
                "message": "This doesn't appear to be a clear skin/face image. Please upload a clear photo of the affected skin area.",
                "reason": "sky_water_landscape",
                "details": {"blue_ratio": round(blue_ratio, 3)}
            }

        if not has_face:
            if edge_ratio > 0.28:
                return {
                    "valid_image": False,
                    "message": "This doesn't appear to be a clear skin/face image. Please upload a clear photo of the affected skin area.",
                    "reason": "high_edge_density_object",
                    "details": {"edge_ratio": round(edge_ratio, 3)}
                }

            if skin_ratio < 0.12:
                return {
                    "valid_image": False,
                    "message": "This doesn't appear to be a clear skin/face image. Please upload a clear photo of the affected skin area.",
                    "reason": "insufficient_skin_pixels",
                    "details": {"skin_ratio": round(skin_ratio, 3)}
                }

        # All validation checks passed
        return {
            "valid_image": True,
            "message": None,
            "reason": "valid_skin_image",
            "details": {
                "brightness": round(mean_brightness, 2),
                "laplacian_variance": round(laplacian_var, 2),
                "has_face": has_face,
                "face_count": face_count,
                "skin_ratio": round(skin_ratio, 3),
                "green_ratio": round(green_ratio, 3),
                "blue_ratio": round(blue_ratio, 3),
                "edge_ratio": round(edge_ratio, 3)
            }
        }

    except Exception as exc:
        return {
            "valid_image": False,
            "message": "Unable to process image validation. Please try uploading a different photo.",
            "reason": f"processing_error: {str(exc)}",
            "details": {}
        }
