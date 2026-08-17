import sys
import os

# Add the 'ml' directory directly to sys.path so its internal imports (like 'import model') work
ml_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'ml'))
sys.path.append(ml_path)

# pyrefly: ignore [missing-import]
from predict import analyze_skin
import shutil

import cv2
from fastapi import HTTPException

class MLService:
    def __init__(self):
        # Paths relative to this file's location to ensure they are found regardless of where uvicorn is run from
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
        self.type_model_path = os.path.join(base_dir, "ml", "skin_type_model.pth")
        self.concern_model_path = os.path.join(base_dir, "ml", "skin_concern_model.pth")
        
        self.upload_dir = os.path.join(os.path.dirname(__file__), '..', 'uploads')
        os.makedirs(self.upload_dir, exist_ok=True)

    def is_human_face_present(self, image_path: str) -> bool:
        """
        Strictly verifies if a human face (with facial features/eyes/mouth) is present in the photo.
        Rejects non-facial images like hands, palms, arms, legs, backgrounds, objects, and pets.
        """
        try:
            img = cv2.imread(image_path)
            if img is None:
                return False
                
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Paths to XML cascades in backend directory
            backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            face_xml = os.path.join(backend_dir, 'haarcascade_frontalface_default.xml')
            eye_xml = os.path.join(backend_dir, 'haarcascade_eye.xml')
            smile_xml = os.path.join(backend_dir, 'haarcascade_smile.xml')
            
            face_cascade = cv2.CascadeClassifier(face_xml)
            eye_cascade = cv2.CascadeClassifier(eye_xml)
            smile_cascade = cv2.CascadeClassifier(smile_xml)
            
            # Detect candidate face regions with strict minNeighbors
            faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=6, minSize=(70, 70))
            
            if len(faces) == 0:
                return False
                
            # Verify that candidate face region actually contains human facial features (eyes/smile) and valid aspect ratio
            for (x, y, w, h) in faces:
                # Facial aspect ratio check (a human face bounding box aspect ratio w/h is roughly 0.65 to 1.35)
                aspect_ratio = float(w) / float(h)
                if aspect_ratio < 0.6 or aspect_ratio > 1.4:
                    continue
                    
                roi_gray = gray[y:y+h, x:x+w]
                eyes = eye_cascade.detectMultiScale(roi_gray, scaleFactor=1.1, minNeighbors=3, minSize=(15, 15))
                smiles = smile_cascade.detectMultiScale(roi_gray, scaleFactor=1.1, minNeighbors=10, minSize=(25, 25))
                
                if len(eyes) > 0 or len(smiles) > 0:
                    return True  # Confirmed human face with facial features
                    
            # If candidate box was triggered by hand/skin texture but lacks facial features, reject it!
            return False
        except Exception as e:
            return False

    def analyze_uploaded_image(self, uploaded_file) -> dict:
        """Saves the uploaded file temporarily and runs PyTorch ML analysis directly."""
        
        file_path = os.path.join(self.upload_dir, uploaded_file.filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(uploaded_file.file, buffer)
            
        # Run PyTorch ML model directly
        result = analyze_skin(file_path, self.type_model_path, self.concern_model_path)
        
        return {
            "analysis": result,
            "saved_path": file_path
        }

ml_service = MLService()
