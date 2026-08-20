"""
Ultra-Detailed MediaPipe Face Analysis System
World's Most Advanced Facial Landmark Detection with 478 Landmarks
"""

import cv2
import numpy as np
from PIL import Image
from typing import Dict, List, Tuple, Optional, Any
import logging

# MediaPipe Integration
try:
    import mediapipe as mp
    MEDIAPIPE_AVAILABLE = True
except ImportError:
    MEDIAPIPE_AVAILABLE = False
    logging.warning("MediaPipe not available. Install with: pip install mediapipe")

from config.settings import Config, FacialRegions

class MediaPipeFaceAnalyzer:
    """Ultra-detailed MediaPipe face analysis with 478 landmarks and 20+ regions"""
    
    def __init__(self):
        self.available = MEDIAPIPE_AVAILABLE
        if self.available:
            self.mp_face_mesh = mp.solutions.face_mesh
            self.face_mesh = self.mp_face_mesh.FaceMesh(
                static_image_mode=True,
                max_num_faces=Config.MEDIAPIPE_MAX_FACES,
                refine_landmarks=True,
                min_detection_confidence=Config.MEDIAPIPE_CONFIDENCE
            )
            self.facial_regions = FacialRegions()
            logging.info("MediaPipe Face Analyzer initialized successfully")
        else:
            logging.error("MediaPipe not available. Face analysis will use fallback methods.")
    
    def detect_face_landmarks(self, image: Image.Image) -> Optional[Dict[str, Any]]:
        """
        Detect facial landmarks using MediaPipe with 478 landmarks
        
        Args:
            image: PIL Image object
            
        Returns:
            Dictionary containing landmark data, region centers, and analysis info
        """
        if not self.available:
            return None
        
        try:
            # Convert PIL to OpenCV format
            image_rgb = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            image_rgb = cv2.cvtColor(image_rgb, cv2.COLOR_BGR2RGB)
            
            # Process with MediaPipe
            results = self.face_mesh.process(image_rgb)
            
            if not results.multi_face_landmarks:
                logging.warning("No face detected in image")
                return None
            
            # Get landmarks from first detected face
            face_landmarks = results.multi_face_landmarks[0]
            height, width = image_rgb.shape[:2]
            
            # Convert to pixel coordinates
            landmark_points = []
            for idx, landmark in enumerate(face_landmarks.landmark):
                x = int(landmark.x * width)
                y = int(landmark.y * height)
                z = landmark.z  # Depth information
                landmark_points.append({
                    'index': idx, 
                    'x': x, 
                    'y': y, 
                    'z': z,
                    'visibility': getattr(landmark, 'visibility', 1.0)
                })
            
            # Calculate region centers and boundaries
            region_data = self._calculate_region_data(landmark_points, width, height)
            
            # Create comprehensive analysis data
            analysis_data = {
                'landmarks': landmark_points,
                'total_landmarks': len(landmark_points),
                'image_dimensions': (width, height),
                'region_centers': region_data['centers'],
                'region_boundaries': region_data['boundaries'],
                'region_landmarks': region_data['landmarks'],
                'face_detected': True,
                'confidence': self._calculate_face_confidence(landmark_points),
                'face_orientation': self._detect_face_orientation(landmark_points),
                'quality_metrics': self._calculate_quality_metrics(landmark_points, width, height)
            }
            
            logging.info(f"Face analysis complete: {len(landmark_points)} landmarks detected")
            return analysis_data
            
        except Exception as e:
            logging.error(f"MediaPipe processing error: {str(e)}")
            return None
    
    def _calculate_region_data(self, landmarks: List[Dict], width: int, height: int) -> Dict[str, Any]:
        """Calculate detailed region data including centers, boundaries, and landmark mappings"""
        region_centers = {}
        region_boundaries = {}
        region_landmarks = {}
        
        for region_name, landmark_indices in self.facial_regions.REGIONS.items():
            if not landmark_indices:
                continue
            
            # Get coordinates for landmarks in this region
            region_coords = []
            region_landmark_data = []
            
            for idx in landmark_indices:
                if idx < len(landmarks):
                    point = landmarks[idx]
                    region_coords.append((point['x'], point['y']))
                    region_landmark_data.append({
                        'index': idx,
                        'x': point['x'],
                        'y': point['y'],
                        'z': point['z']
                    })
            
            if region_coords:
                # Calculate center
                center_x = sum(coord[0] for coord in region_coords) // len(region_coords)
                center_y = sum(coord[1] for coord in region_coords) // len(region_coords)
                region_centers[region_name] = (center_x, center_y)
                
                # Calculate boundaries
                min_x = min(coord[0] for coord in region_coords)
                max_x = max(coord[0] for coord in region_coords)
                min_y = min(coord[1] for coord in region_coords)
                max_y = max(coord[1] for coord in region_coords)
                
                region_boundaries[region_name] = {
                    'min_x': min_x,
                    'max_x': max_x,
                    'min_y': min_y,
                    'max_y': max_y,
                    'width': max_x - min_x,
                    'height': max_y - min_y,
                    'area': (max_x - min_x) * (max_y - min_y)
                }
                
                # Store landmark data for this region
                region_landmarks[region_name] = region_landmark_data
        
        return {
            'centers': region_centers,
            'boundaries': region_boundaries,
            'landmarks': region_landmarks
        }
    
    def _calculate_face_confidence(self, landmarks: List[Dict]) -> float:
        """Calculate overall confidence in face detection"""
        if not landmarks:
            return 0.0
        
        # Calculate average visibility
        avg_visibility = sum(point.get('visibility', 1.0) for point in landmarks) / len(landmarks)
        
        # Calculate landmark distribution quality
        x_coords = [point['x'] for point in landmarks]
        y_coords = [point['y'] for point in landmarks]
        
        x_range = max(x_coords) - min(x_coords)
        y_range = max(y_coords) - min(y_coords)
        
        # Good face should have reasonable aspect ratio
        aspect_ratio = x_range / y_range if y_range > 0 else 0
        aspect_confidence = 1.0 - abs(aspect_ratio - 0.75) / 0.75  # Ideal ratio around 0.75
        
        # Combine confidence metrics
        total_confidence = (avg_visibility * 0.7 + aspect_confidence * 0.3)
        return min(max(total_confidence, 0.0), 1.0)
    
    def _detect_face_orientation(self, landmarks: List[Dict]) -> str:
        """Detect face orientation (front, left, right, up, down)"""
        if len(landmarks) < 10:
            return "unknown"
        
        # Use key facial landmarks for orientation detection
        nose_tip = landmarks[1] if len(landmarks) > 1 else None
        left_eye = landmarks[33] if len(landmarks) > 33 else None
        right_eye = landmarks[362] if len(landmarks) > 362 else None
        
        if not all([nose_tip, left_eye, right_eye]):
            return "unknown"
        
        # Calculate eye center
        eye_center_x = (left_eye['x'] + right_eye['x']) / 2
        eye_center_y = (left_eye['y'] + right_eye['y']) / 2
        
        # Calculate nose position relative to eyes
        nose_offset_x = nose_tip['x'] - eye_center_x
        nose_offset_y = nose_tip['y'] - eye_center_y
        
        # Determine orientation based on offsets
        if abs(nose_offset_x) < 20 and abs(nose_offset_y) < 20:
            return "front"
        elif nose_offset_x > 20:
            return "right"
        elif nose_offset_x < -20:
            return "left"
        elif nose_offset_y > 20:
            return "down"
        elif nose_offset_y < -20:
            return "up"
        else:
            return "front"
    
    def _calculate_quality_metrics(self, landmarks: List[Dict], width: int, height: int) -> Dict[str, float]:
        """Calculate image quality metrics for analysis"""
        if not landmarks:
            return {}
        
        # Face size relative to image
        x_coords = [point['x'] for point in landmarks]
        y_coords = [point['y'] for point in landmarks]
        
        face_width = max(x_coords) - min(x_coords)
        face_height = max(y_coords) - min(y_coords)
        
        face_area_ratio = (face_width * face_height) / (width * height)
        
        # Face centering
        face_center_x = (max(x_coords) + min(x_coords)) / 2
        face_center_y = (max(y_coords) + min(y_coords)) / 2
        
        center_offset_x = abs(face_center_x - width / 2) / (width / 2)
        center_offset_y = abs(face_center_y - height / 2) / (height / 2)
        
        centering_score = 1.0 - (center_offset_x + center_offset_y) / 2
        
        # Image resolution quality
        resolution_score = min(1.0, (width * height) / (800 * 600))  # Minimum 800x600
        
        return {
            'face_area_ratio': face_area_ratio,
            'centering_score': centering_score,
            'resolution_score': resolution_score,
            'overall_quality': (face_area_ratio * 0.4 + centering_score * 0.3 + resolution_score * 0.3)
        }
    
    def get_region_coordinates(self, region_name: str, landmark_data: Dict[str, Any]) -> Optional[Tuple[int, int]]:
        """Get coordinates for a specific facial region"""
        if not landmark_data or 'region_centers' not in landmark_data:
            return None
        
        return landmark_data['region_centers'].get(region_name)
    
    def validate_coordinate_in_region(self, x: int, y: int, region_name: str, landmark_data: Dict[str, Any]) -> bool:
        """Validate if coordinates fall within a specific facial region"""
        if not landmark_data or 'region_boundaries' not in landmark_data:
            return False
        
        boundaries = landmark_data['region_boundaries'].get(region_name)
        if not boundaries:
            return False
        
        return (boundaries['min_x'] <= x <= boundaries['max_x'] and 
                boundaries['min_y'] <= y <= boundaries['max_y'])
    
    def get_available_regions(self) -> List[str]:
        """Get list of available facial regions"""
        return list(self.facial_regions.REGIONS.keys())
    
    def get_issue_regions(self, issue_type: str) -> List[str]:
        """Get regions where a specific issue type can occur"""
        return self.facial_regions.ISSUE_REGION_MAPPING.get(issue_type.upper(), [])
    
    def create_landmark_summary(self, landmark_data: Dict[str, Any]) -> str:
        """Create a summary string of landmark data for AI prompt"""
        if not landmark_data:
            return "No facial landmarks detected."
        
        summary_parts = [
            f"Facial Analysis Summary:",
            f"- Total Landmarks: {landmark_data['total_landmarks']}/478",
            f"- Image Dimensions: {landmark_data['image_dimensions'][0]}x{landmark_data['image_dimensions'][1]} pixels",
            f"- Face Confidence: {landmark_data['confidence']:.2f}",
            f"- Face Orientation: {landmark_data['face_orientation']}",
            f"- Overall Quality: {landmark_data['quality_metrics']['overall_quality']:.2f}",
            f"- Detected Regions: {len(landmark_data['region_centers'])}"
        ]
        
        # Add region centers
        summary_parts.append("\nRegion Centers:")
        for region, center in landmark_data['region_centers'].items():
            summary_parts.append(f"- {region}: ({center[0]}, {center[1]})")
        
        return "\n".join(summary_parts)
