import io
import os
import pytest
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from fastapi.testclient import TestClient

# pyrefly: ignore [missing-import]
from main import app
from services.image_validator import validate_skin_image

client = TestClient(app)

def create_synthetic_image(img_type="face"):
    """Helper to generate test images for pipeline validation testing."""
    img = Image.new("RGB", (300, 300), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    if img_type == "dark":
        # Pure dark image (brightness < 35)
        img = Image.new("RGB", (300, 300), color=(10, 10, 10))

    elif img_type == "blurry":
        # Skin color background with extreme Gaussian blur (Laplacian var < 18)
        img = Image.new("RGB", (300, 300), color=(210, 155, 125))
        img = img.filter(ImageFilter.GaussianBlur(radius=25))

    elif img_type == "landscape_green":
        # Green nature/landscape image with sharp foliage textures
        draw.rectangle([0, 0, 300, 300], fill=(30, 170, 40))
        for i in range(0, 300, 10):
            draw.line([(i, 0), (300 - i, 300)], fill=(10, 220, 20), width=3)
            draw.line([(0, i), (300, 300 - i)], fill=(5, 120, 15), width=2)

    elif img_type == "landscape_sunset":
        # Sunset landscape: orange top, golden horizon with sharp sun rays
        for y in range(300):
            r = min(255, 200 + y // 4)
            g = max(0, 110 - y // 3)
            b = max(0, 30 - y // 5)
            draw.line([(0, y), (300, y)], fill=(r, g, b))
        # Add sharp sun details
        draw.ellipse([100, 40, 200, 140], fill=(255, 230, 150))
        for i in range(0, 300, 15):
            draw.line([(150, 90), (i, 290)], fill=(255, 200, 50), width=2)

    elif img_type == "object_keyboard":
        # High edge density object grid
        draw.rectangle([0, 0, 300, 300], fill=(220, 220, 220))
        for x in range(10, 290, 15):
            for y in range(10, 290, 15):
                draw.rectangle([x, y, x + 8, y + 8], fill=(30, 30, 30))

    elif img_type == "skin_patch" or img_type == "face":
        # Realistic human skin tone RGB: R=215, G=155, B=125 -> YCbCr: Cb=104, Cr=157 (perfect skin range)
        arr = np.full((300, 300, 3), [215, 155, 125], dtype=np.uint8)
        # Add sharp pore/lesion texture so Laplacian variance is sharp (>50)
        np.random.seed(42)
        noise = np.random.randint(-25, 25, (300, 300, 3), dtype=np.int16)
        arr = np.clip(arr.astype(np.int16) + noise, 0, 255).astype(np.uint8)
        
        # Keep border clear of heavy noise so border_skin_ratio is central
        arr[:40, :, :] = [240, 240, 240]  # Light neutral background framing
        arr[260:, :, :] = [240, 240, 240]
        arr[:, :40, :] = [240, 240, 240]
        arr[:, 260:, :] = [240, 240, 240]
        img = Image.fromarray(arr)

    elif img_type == "unframed_skin_patch":
        # Full skin photo with no framing (affected skin area filling whole photo)
        arr = np.full((300, 300, 3), [215, 155, 125], dtype=np.uint8)
        np.random.seed(42)
        noise = np.random.randint(-25, 25, (300, 300, 3), dtype=np.int16)
        arr = np.clip(arr.astype(np.int16) + noise, 0, 255).astype(np.uint8)
        img = Image.fromarray(arr)

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=95)
    buf.seek(0)
    return buf.getvalue()


# -------------------------------------------------------------------------
# Test Cases A-G (Requirement 12)
# -------------------------------------------------------------------------

def test_case_a_clear_face_image():
    """A. Clear skin/face image → should reach CNN and be valid."""
    img_bytes = create_synthetic_image("face")
    response = client.post(
        "/predict",
        files={"file": ("face.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["valid_image"] is True, f"Expected valid_image=True, got {data}"


def test_case_b_skin_disease_image():
    """B. Skin disease image → should pass validation layer and produce prediction status."""
    img_bytes = create_synthetic_image("skin_patch")
    response = client.post(
        "/predict",
        files={"file": ("skin_disease.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["valid_image"] is True
    # Should either return a disease label or an ambiguous low-confidence message (never invalid_image=false)
    if data["prediction"]:
        assert isinstance(data["prediction"], str)
        assert data["recommendation"] is not None


def test_case_b2_unframed_skin_disease_image():
    """B2. Full unframed skin disease photo (close-up of affected skin area without face) → should pass validation."""
    img_bytes = create_synthetic_image("unframed_skin_patch")
    response = client.post(
        "/predict",
        files={"file": ("skin_unframed.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["valid_image"] is True, f"Expected valid_image=True for unframed skin patch, got {data}"


def test_case_c_landscape_image_rejection():
    """C. Landscape image (green nature or sunset) → should be rejected."""
    green_img = create_synthetic_image("landscape_green")
    res_green = client.post(
        "/predict",
        files={"file": ("landscape.jpg", green_img, "image/jpeg")}
    )
    assert res_green.status_code == 200
    data_green = res_green.json()
    assert data_green["valid_image"] is False
    assert data_green["prediction"] is None
    assert "clear skin/face image" in data_green["message"] or "affected skin area" in data_green["message"]

    sunset_img = create_synthetic_image("landscape_sunset")
    res_sunset = client.post(
        "/predict",
        files={"file": ("sunset.jpg", sunset_img, "image/jpeg")}
    )
    assert res_sunset.status_code == 200
    data_sunset = res_sunset.json()
    assert data_sunset["valid_image"] is False
    assert data_sunset["prediction"] is None


def test_case_d_food_object_image_rejection():
    """D. Food/object image (high edge density) → should be rejected."""
    object_img = create_synthetic_image("object_keyboard")
    response = client.post(
        "/predict",
        files={"file": ("keyboard.jpg", object_img, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["valid_image"] is False
    assert data["prediction"] is None


def test_case_e_very_blurry_image_rejection():
    """E. Very blurry image → should be rejected with blur message."""
    blurry_img = create_synthetic_image("blurry")
    response = client.post(
        "/predict",
        files={"file": ("blurry.jpg", blurry_img, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["valid_image"] is False
    assert "blurry" in data["message"].lower() or "hold steady" in data["message"].lower()


def test_case_f_very_dark_image_rejection():
    """F. Very dark image → should be rejected with dark message."""
    dark_img = create_synthetic_image("dark")
    response = client.post(
        "/predict",
        files={"file": ("dark.jpg", dark_img, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["valid_image"] is False
    assert "dark" in data["message"].lower() or "lighting is too low" in data["message"].lower()


def test_case_g_ambiguous_low_confidence_rejection():
    """G. Low-confidence/ambiguous skin image → should not force a disease label."""
    # A generic plain skin patch might yield low confidence or low margin from CNN
    img_bytes = create_synthetic_image("skin_patch")
    response = client.post(
        "/predict",
        files={"file": ("skin_ambiguous.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["valid_image"] is True
    if data.get("is_ambiguous", False):
        assert data.get("disease") is None or data.get("prediction") is None
        assert "Unable to confidently identify" in data.get("message", "")
        assert data["recommendation"] is None
    else:
        assert data.get("disease") is not None or data.get("prediction") is not None
