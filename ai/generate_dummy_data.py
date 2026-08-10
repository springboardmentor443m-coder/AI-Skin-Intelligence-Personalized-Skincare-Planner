import os
import numpy as np
import cv2

def create_skin_texture(class_name, size=(224, 224, 3)):
    """Generates a synthetic skin texture image based on the skin type class."""
    img = np.zeros(size, dtype=np.uint8)
    
    # Base skin tone (peach/pinkish base)
    img[:, :, 0] = 160  # Blue
    img[:, :, 1] = 185  # Green
    img[:, :, 2] = 230  # Red (BGR in OpenCV)
    
    # Add subtle skin pores/noise
    noise = np.random.normal(0, 10, size[:2])
    for c in range(3):
        img[:, :, c] = np.clip(img[:, :, c] + noise, 0, 255)
        
    if class_name == "dry":
        # Draw dry patches (whitish, fine crack lines)
        for _ in range(15):
            x1, y1 = np.random.randint(0, 224, size=2)
            length = np.random.randint(5, 25)
            angle = np.random.uniform(0, 2 * np.pi)
            x2 = int(x1 + length * np.cos(angle))
            y2 = int(y1 + length * np.sin(angle))
            cv2.line(img, (x1, y1), (x2, y2), (210, 220, 235), 1)  # Light cracks
            
    elif class_name == "oily":
        # Draw shiny oily highlights (translucent yellow/white blobs)
        for _ in range(8):
            cx, cy = np.random.randint(20, 204, size=2)
            r = np.random.randint(10, 30)
            overlay = img.copy()
            cv2.circle(overlay, (cx, cy), r, (120, 240, 255), -1)  # Yellow shine
            cv2.addWeighted(overlay, 0.35, img, 0.65, 0, img)
            
    elif class_name == "normal":
        # Smooth tone, minimal blemishes, slightly blur to look soft
        img = cv2.GaussianBlur(img, (3, 3), 0)
        
    return img

def setup_dummy_dataset():
    classes = ["dry", "oily", "normal"]
    splits = {"train": 35, "validation": 10}
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, "data")
    
    print(f"Generating dummy skin image dataset in {data_dir}...")
    
    for split, count in splits.items():
        for cls in classes:
            folder_path = os.path.join(data_dir, split, cls)
            os.makedirs(folder_path, exist_ok=True)
            
            for i in range(count):
                img = create_skin_texture(cls)
                filename = f"{cls}_sample_{i+1}.jpg"
                filepath = os.path.join(folder_path, filename)
                cv2.imwrite(filepath, img)
                
    print("Dummy dataset creation complete!")

if __name__ == "__main__":
    setup_dummy_dataset()
