import cv2
import numpy as np
from PIL import Image

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
profile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_profileface.xml')

def is_valid_face_or_skin(pil_image: Image.Image) -> bool:
    img_np = np.array(pil_image.convert("RGB"))
    gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)

    # 1. Try Haar Cascade face detection
    h, w = img_np.shape[:2]
    scale = 600.0 / max(h, w) if max(h, w) > 600 else 1.0
    if scale != 1.0:
        small_gray = cv2.resize(gray, (int(w * scale), int(h * scale)))
    else:
        small_gray = gray

    frontal_faces = face_cascade.detectMultiScale(small_gray, scaleFactor=1.1, minNeighbors=4, minSize=(30, 30))
    if len(frontal_faces) > 0:
        return True

    profile_faces = profile_cascade.detectMultiScale(small_gray, scaleFactor=1.1, minNeighbors=4, minSize=(30, 30))
    if len(profile_faces) > 0:
        return True

    # 2. Skin patch validation (for close-up photos without full face visible)
    # YCrCb skin threshold
    ycrcb = cv2.cvtColor(img_np, cv2.COLOR_RGB2YCrCb)
    ycrcb_mask = cv2.inRange(ycrcb, np.array([40, 133, 80], dtype=np.uint8), np.array([255, 173, 130], dtype=np.uint8))

    # HSV skin threshold (filters out overly saturated pink wrappers, vibrant flowers, green leaves, etc.)
    hsv = cv2.cvtColor(img_np, cv2.COLOR_RGB2HSV)
    hsv_mask1 = cv2.inRange(hsv, np.array([0, 25, 50], dtype=np.uint8), np.array([25, 155, 255], dtype=np.uint8))
    hsv_mask2 = cv2.inRange(hsv, np.array([165, 25, 50], dtype=np.uint8), np.array([180, 155, 255], dtype=np.uint8))
    hsv_mask = cv2.bitwise_or(hsv_mask1, hsv_mask2)

    combined_mask = cv2.bitwise_and(ycrcb_mask, hsv_mask)
    skin_ratio = np.count_nonzero(combined_mask) / combined_mask.size

    # Canny edge density check
    edges = cv2.Canny(gray, 50, 150)
    edge_density = np.count_nonzero(edges) / edges.size

    # Debug info
    print(f"Skin Ratio: {skin_ratio:.4f}, Edge Density: {edge_density:.4f}")

    # Skin patch must have substantial skin coverage AND relatively low edge clutter
    if skin_ratio >= 0.35 and edge_density <= 0.18:
        return True

    return False

# Test with a high-saturation pink / flower bouquet synthetic image
flower_mock = np.zeros((400, 400, 3), dtype=np.uint8)
# Add pink wrapping paper (high saturation pink)
flower_mock[50:350, 100:300] = [255, 180, 200]
# Add lots of high frequency edge noise (dried flowers)
for _ in range(300):
    x, y = np.random.randint(120, 280), np.random.randint(100, 250)
    flower_mock[y:y+3, x:x+3] = [150, 100, 50]

res = is_valid_face_or_skin(Image.fromarray(flower_mock))
print("Flower Mock Result:", res)

# Test with skin mock (smooth peach color, low edge density)
skin_mock = np.full((400, 400, 3), (230, 190, 165), dtype=np.uint8)
res_skin = is_valid_face_or_skin(Image.fromarray(skin_mock))
print("Skin Mock Result:", res_skin)
