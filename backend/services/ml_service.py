import sys
import os

# Add the 'ml' directory directly to sys.path so its internal imports (like 'import model') work
ml_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'ml'))
sys.path.append(ml_path)

# pyrefly: ignore [missing-import]
from predict import analyze_skin
import shutil

class MLService:
    def __init__(self):
        # Paths relative to this file's location to ensure they are found regardless of where uvicorn is run from
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
        self.type_model_path = os.path.join(base_dir, "ml", "skin_type_model.pth")
        self.concern_model_path = os.path.join(base_dir, "ml", "skin_concern_model.pth")
        
        self.upload_dir = os.path.join(os.path.dirname(__file__), '..', 'uploads')
        os.makedirs(self.upload_dir, exist_ok=True)

    def analyze_uploaded_image(self, uploaded_file) -> dict:
        """Saves the uploaded file temporarily and runs ML analysis."""
        
        file_path = os.path.join(self.upload_dir, uploaded_file.filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(uploaded_file.file, buffer)
            
        # Run ML model
        result = analyze_skin(file_path, self.type_model_path, self.concern_model_path)
        
        return {
            "analysis": result,
            "saved_path": file_path
        }

ml_service = MLService()
