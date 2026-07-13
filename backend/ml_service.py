import sys
import os

# Add ml folder to python path so we can import our PyTorch scripts
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'ml')))

# pyrefly: ignore [missing-import]
from predict import load_model, predict_image

class MLService:
    def __init__(self):
        self.type_classes = ['Combination', 'Dry', 'Normal', 'Oily', 'Sensitive']
        self.concern_classes = [
            'Redness', 'dark spots', 'inflammatory acne', 
            'non inflammatory acne black heads', 'non inflammatory acne white heads', 
            'pigmentation', 'pores', 'wrinkles'
        ]
        
        # Paths to models
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'ml'))
        self.type_model_path = os.path.join(base_dir, 'skin_type_model.pth')
        self.concern_model_path = os.path.join(base_dir, 'skin_concern_model.pth')
        
        self.type_model = None
        self.concern_model = None

    def load_models(self):
        print("Loading Skin Type Model...")
        if os.path.exists(self.type_model_path):
            self.type_model = load_model(self.type_model_path, len(self.type_classes))
        else:
            print(f"Warning: {self.type_model_path} not found.")

        print("Loading Skin Concern Model...")
        if os.path.exists(self.concern_model_path):
            self.concern_model = load_model(self.concern_model_path, len(self.concern_classes))
        else:
            print(f"Warning: {self.concern_model_path} not found.")

    def analyze_skin(self, image_path):
        results = {}
        
        if self.type_model:
            results['skin_type'] = predict_image(image_path, self.type_model, self.type_classes)
        else:
            results['skin_type'] = {"error": "Model not loaded"}
            
        if self.concern_model:
            results['skin_concerns'] = predict_image(image_path, self.concern_model, self.concern_classes)
        else:
            results['skin_concerns'] = {"error": "Model not loaded"}
            
        return results

# Initialize a singleton instance
ml_service = MLService()
