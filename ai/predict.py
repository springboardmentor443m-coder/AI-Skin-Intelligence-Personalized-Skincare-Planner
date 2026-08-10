import os
import argparse
import numpy as np
import cv2
import tensorflow as tf

# Suppress TensorFlow logging noise
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

class SkinClassifier:
    def __init__(self, model_path=None):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        
        if model_path is None:
            model_path = os.path.join(base_dir, "skin_type_model.h5")
            
        self.model_path = model_path
        self.model = None
        self.classes = ["dry", "normal", "oily"] # Fallback default
        
        # Load classes mapping if present
        classes_path = os.path.join(base_dir, "classes.txt")
        if os.path.exists(classes_path):
            with open(classes_path, "r") as f:
                self.classes = [line.strip() for line in f.read().splitlines() if line.strip()]
                
        self.load_model()
        
    def load_model(self):
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(
                f"Model file not found at {self.model_path}. Please run train.py to train the model first."
            )
        print(f"Loading skin classification model from {self.model_path}...")
        self.model = tf.keras.models.load_model(self.model_path)
        print("Model loaded successfully.")
        
    def predict(self, image_input):
        """
        Runs inference on the provided image input.
        image_input can be:
          - A string path to an image file.
          - Raw bytes of an uploaded image file.
        """
        if isinstance(image_input, str):
            # Read from file path
            img = cv2.imread(image_input)
            if img is None:
                raise ValueError(f"Could not load image from path: {image_input}")
        elif isinstance(image_input, bytes):
            # Decode from bytes
            nparr = np.frombuffer(image_input, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is None:
                raise ValueError("Could not decode image from bytes.")
        else:
            raise TypeError("image_input must be a file path string or bytes.")
            
        # 1. Preprocess: Resize to 224x224
        img = cv2.resize(img, (224, 224))
        
        # 2. Convert from BGR to RGB (OpenCV default is BGR, TensorFlow expects RGB)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # 3. Rescale pixel values
        img_array = img.astype(np.float32) / 255.0
        
        # 4. Expand dimensions (add batch size dimension)
        img_batch = np.expand_dims(img_array, axis=0)
        
        # 5. Run inference
        preds = self.model.predict(img_batch, verbose=0)[0]
        
        # 6. Retrieve label and confidence
        best_idx = np.argmax(preds)
        predicted_class = self.classes[best_idx]
        confidence = float(preds[best_idx])
        
        # Return all probabilities for comprehensive details
        all_probabilities = {self.classes[i]: float(preds[i]) for i in range(len(self.classes))}
        
        return predicted_class, confidence, all_probabilities

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run inference on skin image")
    parser.add_argument("--image", type=str, required=True, help="Path to facial skin image file")
    args = parser.parse_args()
    
    try:
        classifier = SkinClassifier()
        label, conf, probs = classifier.predict(args.image)
        print("\n--- Inference Results ---")
        print(f"Predicted Class: {label.upper()}")
        print(f"Confidence Score: {conf:.4%}")
        print("\nClass Probabilities:")
        for cls, prob in probs.items():
            print(f"  {cls}: {prob:.4%}")
    except Exception as e:
        print(f"Error running inference: {e}")
