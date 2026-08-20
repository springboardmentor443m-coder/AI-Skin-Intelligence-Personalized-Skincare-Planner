"""
Coordinate Parser for SkinAI Analyzer
Parses and validates landmark-based coordinates from AI analysis responses
"""

import re
import logging
from typing import List, Dict, Any, Tuple, Optional
from config.settings import Config
from core.landmark_mapper import landmark_mapper

logger = logging.getLogger(__name__)

class CoordinateParser:
    """Parses landmark-based coordinates from AI analysis text and validates them"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.landmark_mapper = landmark_mapper
    
    def parse_coordinates_from_analysis(self, analysis_text: str, landmark_data: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Parse landmark-based coordinates from AI analysis text
        
        Args:
            analysis_text: Raw analysis text from AI
            landmark_data: MediaPipe landmark data for validation
            
        Returns:
            List of parsed coordinate dictionaries with landmark indices
        """
        try:
            coordinates = []
            
            # Pattern for [LANDMARK_INDEX, CONDITION, SEVERITY, CONFIDENCE] format
            landmark_pattern = r'\[(\d+),\s*([A-Z_]+),\s*(\d+),\s*([\d.]+)\]'
            landmark_matches = re.findall(landmark_pattern, analysis_text)
            
            for landmark_idx, condition, severity, confidence in landmark_matches:
                coord = {
                    'landmark_index': int(landmark_idx),
                    'condition': condition,
                    'severity': int(severity),
                    'confidence': float(confidence),
                    'type': 'landmark'
                }
                coordinates.append(coord)
            
            # Pattern for [LANDMARK_INDEX, CONDITION, SEVERITY] format (without confidence)
            landmark_simple_pattern = r'\[(\d+),\s*([A-Z_]+),\s*(\d+)\]'
            landmark_simple_matches = re.findall(landmark_simple_pattern, analysis_text)
            
            for landmark_idx, condition, severity in landmark_simple_matches:
                coord = {
                    'landmark_index': int(landmark_idx),
                    'condition': condition,
                    'severity': int(severity),
                    'confidence': 0.8,  # Default confidence
                    'type': 'landmark'
                }
                coordinates.append(coord)
            
            # Legacy support for [X,Y] format - convert to nearest landmark
            xy_pattern = r'\[(\d+),\s*(\d+)\]'
            xy_matches = re.findall(xy_pattern, analysis_text)
            
            for x, y in xy_matches:
                # Find nearest landmark to pixel coordinates
                nearest_landmark = self._find_nearest_landmark(int(x), int(y), landmark_data)
                if nearest_landmark:
                    coord = {
                        'landmark_index': nearest_landmark['index'],
                        'condition': 'UNKNOWN',
                        'severity': 2,  # Default severity
                        'confidence': 0.6,  # Lower confidence for converted coordinates
                        'type': 'landmark',
                        'original_pixel': (int(x), int(y))
                    }
                    coordinates.append(coord)
            
            # Validate coordinates
            coordinates = self._validate_landmark_coordinates(coordinates)
            
            self.logger.info(f"Extracted {len(coordinates)} landmark coordinates from analysis")
            return coordinates
            
        except Exception as e:
            self.logger.error(f"Landmark coordinate extraction error: {e}")
            return []
    
    def _find_nearest_landmark(self, x: int, y: int, landmark_data: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """
        Find the nearest landmark to given pixel coordinates
        
        Args:
            x, y: Pixel coordinates
            landmark_data: MediaPipe landmark data
            
        Returns:
            Nearest landmark information or None
        """
        if not landmark_data:
            return None
        
        # Try different landmark data formats
        landmarks = None
        if 'landmarks' in landmark_data:
            landmarks = landmark_data['landmarks']
        elif 'face_landmarks' in landmark_data:
            landmarks = landmark_data['face_landmarks']
        elif 'landmark_data' in landmark_data:
            landmarks = landmark_data['landmark_data']
        
        if not landmarks:
            return None
        
        min_distance = float('inf')
        nearest_landmark = None
        
        for i, landmark in enumerate(landmarks):
            if len(landmark) >= 2:
                lx, ly = landmark[0], landmark[1]
                
                # Handle normalized coordinates
                if lx <= 1.0 and ly <= 1.0:
                    # Convert to pixel coordinates for comparison
                    img_width, img_height = landmark_data.get('image_dimensions', (1000, 1000))
                    lx = lx * img_width
                    ly = ly * img_height
                
                distance = ((x - lx) ** 2 + (y - ly) ** 2) ** 0.5
                if distance < min_distance:
                    min_distance = distance
                    nearest_landmark = {
                        'index': i,
                        'distance': distance,
                        'landmark_coords': (lx, ly)
                    }
        
        return nearest_landmark
    
    def _validate_landmark_coordinates(self, coordinates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Validate landmark-based coordinates
        
        Args:
            coordinates: List of coordinate dictionaries
            
        Returns:
            Validated coordinates list
        """
        validated_coords = []
        
        for coord in coordinates:
            landmark_idx = coord.get('landmark_index')
            
            # Check if landmark index is valid (0-477)
            if landmark_idx is None or landmark_idx < 0 or landmark_idx > 477:
                continue
            
            # Check if landmark exists in our mapping
            landmark_info = self.landmark_mapper.get_landmark_info(landmark_idx)
            if not landmark_info:
                continue
            
            # Validate severity (1-5)
            severity = coord.get('severity', 1)
            if severity < 1 or severity > 5:
                coord['severity'] = max(1, min(5, severity))
            
            # Validate confidence (0.0-1.0)
            confidence = coord.get('confidence', 0.5)
            if confidence < 0.0 or confidence > 1.0:
                coord['confidence'] = max(0.0, min(1.0, confidence))
            
            # Add landmark information
            coord['landmark_info'] = landmark_info
            coord['region'] = landmark_info.get('region', 'Unknown')
            coord['description'] = landmark_info.get('description', '')
            
            validated_coords.append(coord)
        
        # Remove duplicates based on landmark index and condition
        unique_coords = []
        seen = set()
        
        for coord in validated_coords:
            key = (coord['landmark_index'], coord['condition'])
            if key not in seen:
                seen.add(key)
                unique_coords.append(coord)
        
        return unique_coords
    
    def convert_landmark_to_pixel(self, landmark_index: int, landmark_data: Optional[Dict[str, Any]]) -> Optional[Tuple[int, int]]:
        """
        Convert landmark index to pixel coordinates
        
        Args:
            landmark_index: MediaPipe landmark index (0-477)
            landmark_data: MediaPipe landmark data with image dimensions
            
        Returns:
            Pixel coordinates (x, y) or None if invalid
        """
        if not landmark_data or 'landmarks' not in landmark_data:
            return None
        
        landmarks = landmark_data['landmarks']
        if landmark_index >= len(landmarks):
            return None
        
        landmark = landmarks[landmark_index]
        
        # Handle MediaPipe landmark format (dictionary with x, y, z keys)
        if isinstance(landmark, dict):
            if 'x' in landmark and 'y' in landmark:
                return (int(landmark['x']), int(landmark['y']))
            else:
                return None
        
        # Handle list/tuple format
        elif isinstance(landmark, (list, tuple)) and len(landmark) >= 2:
            # Check if these are already pixel coordinates (large numbers)
            if landmark[0] > 1.0 or landmark[1] > 1.0:
                # Already pixel coordinates
                return (int(landmark[0]), int(landmark[1]))
            else:
                # Normalized coordinates - convert to pixels
                img_width, img_height = landmark_data.get('image_dimensions', (1000, 1000))
                x = int(landmark[0] * img_width)
                y = int(landmark[1] * img_height)
                return (x, y)
        
        return None
    
    def get_coordinate_summary(self, coordinates: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Get summary statistics for coordinates
        
        Args:
            coordinates: List of coordinate dictionaries
            
        Returns:
            Summary statistics dictionary
        """
        if not coordinates:
            return {
                'total_coordinates': 0,
                'conditions_found': [],
                'severity_distribution': {},
                'confidence_average': 0.0,
                'regions_affected': []
            }
        
        conditions = set()
        severities = {}
        confidences = []
        regions = set()
        
        for coord in coordinates:
            conditions.add(coord.get('condition', 'UNKNOWN'))
            
            severity = coord.get('severity', 1)
            severities[severity] = severities.get(severity, 0) + 1
            
            confidences.append(coord.get('confidence', 0.5))
            
            region = coord.get('region', 'Unknown')
            regions.add(region)
        
        return {
            'total_coordinates': len(coordinates),
            'conditions_found': list(conditions),
            'severity_distribution': severities,
            'confidence_average': sum(confidences) / len(confidences) if confidences else 0.0,
            'regions_affected': list(regions)
        }
