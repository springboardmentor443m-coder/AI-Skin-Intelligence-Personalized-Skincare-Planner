"""
OpenCV Annotation System for SkinAI Analyzer
Precise coordinate mapping and visual problem highlighting
"""

import cv2
import numpy as np
from PIL import Image
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any
import logging

from config.settings import Config, UIConfig

class VisualAnnotator:
    """Advanced visual annotation system for skincare analysis"""
    
    def __init__(self):
        self.coordinate_radius = Config.COORDINATE_RADIUS
        self.max_coordinates = Config.MAX_COORDINATES
        
        # Color scheme for different issue types
        self.issue_colors = {
            'ACNE': (255, 71, 87),      # Red
            'PIGMENTATION': (255, 165, 0),  # Orange
            'PORES': (128, 0, 128),     # Purple
            'DARK_CIRCLES': (0, 0, 255),    # Blue
            'WRINKLES': (0, 128, 0),    # Green
            'REDNESS': (255, 0, 0),     # Bright Red
            'TEXTURE': (255, 192, 203)  # Pink
        }
        
        logging.info("Visual Annotator initialized")
    
    def create_annotated_image(self, original_image: Image.Image, 
                             coordinates: List[Dict[str, Any]], 
                             landmark_data: Optional[Dict[str, Any]] = None) -> Image.Image:
        """
        Create annotated image with landmark-based coordinate markers and BIGGER circles
        
        Args:
            original_image: PIL Image object
            coordinates: List of coordinate dictionaries with landmark indices
            landmark_data: MediaPipe landmark data for coordinate conversion
            
        Returns:
            Annotated PIL Image
        """
        if not coordinates:
            return original_image
        
        try:
            # Convert to OpenCV format
            img_array = np.array(original_image)
            annotated_img = img_array.copy()
            
            # Draw annotations for each coordinate
            for i, coord in enumerate(coordinates[:self.max_coordinates]):
                try:
                    # Get landmark index and convert to pixel coordinates
                    landmark_index = coord.get('landmark_index')
                    if landmark_index is None:
                        # Fallback to direct pixel coordinates
                        x, y = coord.get('x', 0), coord.get('y', 0)
                        if x == 0 and y == 0:
                            logging.warning(f"Coordinate {i} has no valid x,y or landmark_index")
                            continue
                    else:
                        # Convert landmark to pixel coordinates
                        pixel_coords = self._convert_landmark_to_pixel(landmark_index, landmark_data)
                        if pixel_coords is None:
                            logging.warning(f"Failed to convert landmark {landmark_index} to pixel coordinates")
                            continue
                        x, y = pixel_coords
                    
                    # Validate coordinates are within image bounds
                    if x < 0 or y < 0 or x >= img_array.shape[1] or y >= img_array.shape[0]:
                        logging.warning(f"Coordinate {i} ({x}, {y}) is outside image bounds")
                        continue
                    
                    condition = coord.get('condition', 'UNKNOWN')
                    severity = coord.get('severity', 1)
                    region = coord.get('region', 'UNKNOWN')
                    
                    # Get color for condition type
                    color = self.issue_colors.get(condition, (255, 71, 87))  # Default red
                    
                    # BIGGER circles for better visibility
                    big_radius = max(20, self.coordinate_radius + 10)  # Make circles bigger
                    
                    # Draw main circle with transparency
                    overlay = annotated_img.copy()
                    cv2.circle(overlay, (x, y), big_radius, color, -1)
                    cv2.addWeighted(annotated_img, 0.7, overlay, 0.3, 0, annotated_img)
                    
                    # Draw border circle with thicker line
                    cv2.circle(annotated_img, (x, y), big_radius, color, 4)  # Thicker border
                    
                    # Draw inner white circle for number (bigger)
                    cv2.circle(annotated_img, (x, y), 12, (255, 255, 255), -1)  # Bigger white circle
                    
                    # Add number label with bigger font
                    cv2.putText(annotated_img, str(i + 1), (x - 6, y + 5),  # Adjusted position
                               cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)  # Bigger font
                    
                    # Add condition type label (optional, for debugging)
                    if len(coordinates) <= 5:  # Show labels for up to 5 coordinates
                        label_y = y - big_radius - 15
                        if label_y < 25:
                            label_y = y + big_radius + 25
                        
                        cv2.putText(annotated_img, condition.replace('_', ' '), 
                                   (x - 40, label_y), cv2.FONT_HERSHEY_SIMPLEX, 
                                   0.5, color, 2)  # Bigger font and thicker text
                
                except Exception as coord_error:
                    logging.error(f"Error processing coordinate {i}: {coord_error}")
                    continue
            
            return Image.fromarray(annotated_img)
            
        except Exception as e:
            logging.error(f"Annotation error: {str(e)}")
            return original_image
    
    def _convert_landmark_to_pixel(self, landmark_index: int, landmark_data: Optional[Dict[str, Any]]) -> Optional[Tuple[int, int]]:
        """
        Convert landmark index to pixel coordinates
        
        Args:
            landmark_index: MediaPipe landmark index (0-477)
            landmark_data: MediaPipe landmark data with image dimensions
            
        Returns:
            Pixel coordinates (x, y) or None if invalid
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
        
        if not landmarks or landmark_index >= len(landmarks):
            return None
        
        landmark = landmarks[landmark_index]
        if len(landmark) < 2:
            return None
        
        # Get image dimensions
        img_width, img_height = landmark_data.get('image_dimensions', (1000, 1000))
        
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
                x = int(landmark[0] * img_width)
                y = int(landmark[1] * img_height)
                return (x, y)
        
        return None
    
    def create_enhanced_annotated_image(self, original_image: Image.Image, 
                                      coordinates: List[Dict[str, Any]],
                                      landmark_data: Optional[Dict[str, Any]] = None) -> Image.Image:
        """
        Create enhanced annotated image with region highlighting
        
        Args:
            original_image: PIL Image object
            coordinates: List of coordinate dictionaries
            
        Returns:
            Enhanced annotated PIL Image
        """
        if not coordinates:
            return original_image
        
        try:
            # Convert to OpenCV format
            img_array = np.array(original_image)
            annotated_img = img_array.copy()
            
            # Group coordinates by region
            region_groups = {}
            for coord in coordinates:
                region = coord.get('region', 'UNKNOWN')
                if region not in region_groups:
                    region_groups[region] = []
                region_groups[region].append(coord)
            
            # Draw region highlights
            for region, coords in region_groups.items():
                if len(coords) > 1:
                    # Draw region boundary
                    self._draw_region_boundary(annotated_img, coords, region)
            
            # Draw individual coordinate markers
            for i, coord in enumerate(coordinates[:self.max_coordinates]):
                # Handle both old format (x, y) and new format (landmark_index)
                if 'landmark_index' in coord:
                    pixel_coords = self._convert_landmark_to_pixel(coord['landmark_index'], landmark_data)
                    if pixel_coords is None:
                        continue
                    x, y = pixel_coords
                    issue_type = coord.get('condition', 'UNKNOWN')
                else:
                    x, y = coord.get('x', 0), coord.get('y', 0)
                    issue_type = coord.get('issue', 'GENERAL')
                
                # Get color for issue type
                color = self.issue_colors.get(issue_type, (255, 71, 87))
                
                # Draw enhanced marker
                self._draw_enhanced_marker(annotated_img, x, y, i + 1, color, issue_type)
            
            return Image.fromarray(annotated_img)
            
        except Exception as e:
            logging.error(f"Enhanced annotation error: {str(e)}")
            return self.create_annotated_image(original_image, coordinates)
    
    def _draw_region_boundary(self, img_array: np.ndarray, coords: List[Dict], region: str):
        """Draw boundary around region with multiple coordinates"""
        try:
            if len(coords) < 2:
                return
            
            # Get bounding box for region
            x_coords = []
            y_coords = []
            for coord in coords:
                if 'landmark_index' in coord:
                    # Skip region boundary for landmark-based coordinates for now
                    # as we need landmark_data to convert them
                    return
                else:
                    x_coords.append(coord.get('x', 0))
                    y_coords.append(coord.get('y', 0))
            
            min_x, max_x = min(x_coords), max(x_coords)
            min_y, max_y = min(y_coords), max(y_coords)
            
            # Expand boundary
            padding = 20
            min_x = max(0, min_x - padding)
            max_x = min(img_array.shape[1], max_x + padding)
            min_y = max(0, min_y - padding)
            max_y = min(img_array.shape[0], max_y + padding)
            
            # Draw boundary rectangle
            cv2.rectangle(img_array, (min_x, min_y), (max_x, max_y), 
                         (0, 255, 255), 2)  # Yellow boundary
            
            # Add region label
            cv2.putText(img_array, region.replace('_', ' '), 
                       (min_x, min_y - 5), cv2.FONT_HERSHEY_SIMPLEX, 
                       0.5, (0, 255, 255), 1)
            
        except Exception as e:
            logging.warning(f"Region boundary drawing error: {str(e)}")
    
    def _draw_enhanced_marker(self, img_array: np.ndarray, x: int, y: int, 
                            number: int, color: Tuple[int, int, int], issue_type: str):
        """Draw enhanced marker for coordinate"""
        try:
            # Draw outer glow effect
            for radius in range(self.coordinate_radius + 5, self.coordinate_radius + 1, -1):
                alpha = 0.1 * (self.coordinate_radius + 5 - radius)
                overlay = img_array.copy()
                cv2.circle(overlay, (x, y), radius, color, -1)
                cv2.addWeighted(img_array, 1 - alpha, overlay, alpha, 0, img_array)
            
            # Draw main circle
            cv2.circle(img_array, (x, y), self.coordinate_radius, color, -1)
            cv2.circle(img_array, (x, y), self.coordinate_radius, (255, 255, 255), 2)
            
            # Draw inner circle for number
            cv2.circle(img_array, (x, y), 8, (255, 255, 255), -1)
            cv2.circle(img_array, (x, y), 8, (0, 0, 0), 1)
            
            # Add number
            cv2.putText(img_array, str(number), (x - 4, y + 4),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 2)
            
        except Exception as e:
            logging.warning(f"Enhanced marker drawing error: {str(e)}")
    
    def create_legend_dataframe(self, coordinates: List[Dict[str, Any]]) -> pd.DataFrame:
        """
        Create legend DataFrame for coordinates
        
        Args:
            coordinates: List of coordinate dictionaries
            
        Returns:
            Pandas DataFrame with legend information
        """
        if not coordinates:
            return pd.DataFrame()
        
        legend_data = []
        for i, coord in enumerate(coordinates[:self.max_coordinates], 1):
            # Handle both old format (x, y) and new format (landmark_index)
            if 'landmark_index' in coord:
                location = f"Landmark {coord['landmark_index']}"
                issue_type = coord.get('condition', 'UNKNOWN')
                confidence = f"{coord.get('confidence', 0.5):.1f}"
            else:
                location = f"({coord.get('x', 0)}, {coord.get('y', 0)})"
                issue_type = coord.get('issue', 'GENERAL')
                confidence = coord.get('confidence', 'high').title()
            
            region = coord.get('region', 'UNKNOWN')
            
            # Get color information
            color = self.issue_colors.get(issue_type, (255, 71, 87))
            color_hex = f"#{color[0]:02x}{color[1]:02x}{color[2]:02x}"
            
            legend_data.append({
                'ID': i,
                'Issue Type': issue_type.replace('_', ' ').title(),
                'Region': region.replace('_', ' ').title(),
                'Location': location,
                'Confidence': confidence,
                'Color': color_hex,
                'Severity': self._assess_severity(issue_type, region)
            })
        
        return pd.DataFrame(legend_data)
    
    def _assess_severity(self, issue_type: str, region: str) -> str:
        """Assess severity based on issue type and region"""
        severity_mapping = {
            'ACNE': 'High' if region in ['NOSE_TIP', 'CENTER_FOREHEAD'] else 'Medium',
            'PIGMENTATION': 'High' if region in ['LEFT_UNDER_EYE', 'RIGHT_UNDER_EYE'] else 'Medium',
            'DARK_CIRCLES': 'High',
            'WRINKLES': 'Medium',
            'REDNESS': 'Medium',
            'PORES': 'Low',
            'TEXTURE': 'Low'
        }
        return severity_mapping.get(issue_type, 'Medium')
    
    def create_comparison_image(self, original_image: Image.Image, 
                              annotated_image: Image.Image) -> Image.Image:
        """
        Create side-by-side comparison image
        
        Args:
            original_image: Original PIL Image
            annotated_image: Annotated PIL Image
            
        Returns:
            Side-by-side comparison PIL Image
        """
        try:
            # Ensure both images are the same size
            if original_image.size != annotated_image.size:
                annotated_image = annotated_image.resize(original_image.size, Image.Resampling.LANCZOS)
            
            # Create side-by-side image
            width, height = original_image.size
            comparison_width = width * 2
            comparison_height = height
            
            comparison_img = Image.new('RGB', (comparison_width, comparison_height))
            comparison_img.paste(original_image, (0, 0))
            comparison_img.paste(annotated_image, (width, 0))
            
            return comparison_img
            
        except Exception as e:
            logging.error(f"Comparison image creation error: {str(e)}")
            return annotated_image
    
    def create_analysis_summary_image(self, coordinates: List[Dict[str, Any]], 
                                    image_size: Tuple[int, int] = (400, 300)) -> Image.Image:
        """
        Create summary image showing all detected issues
        
        Args:
            coordinates: List of coordinate dictionaries
            image_size: Size of summary image
            
        Returns:
            Summary PIL Image
        """
        try:
            # Create blank image
            summary_img = np.ones((image_size[1], image_size[0], 3), dtype=np.uint8) * 255
            
            # Add title
            cv2.putText(summary_img, "Skin Analysis Summary", (20, 30),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)
            
            # Add issue counts
            issue_counts = {}
            for coord in coordinates:
                issue_type = coord.get('issue', 'GENERAL')
                issue_counts[issue_type] = issue_counts.get(issue_type, 0) + 1
            
            y_offset = 70
            for issue_type, count in issue_counts.items():
                color = self.issue_colors.get(issue_type, (255, 71, 87))
                
                # Draw color indicator
                cv2.circle(summary_img, (30, y_offset), 8, color, -1)
                
                # Add text
                text = f"{issue_type.replace('_', ' ').title()}: {count}"
                cv2.putText(summary_img, text, (50, y_offset + 5),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)
                
                y_offset += 25
            
            return Image.fromarray(summary_img)
            
        except Exception as e:
            logging.error(f"Summary image creation error: {str(e)}")
            # Return blank image
            return Image.new('RGB', image_size, (255, 255, 255))
    
    def get_issue_statistics(self, coordinates: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Get statistics about detected issues"""
        if not coordinates:
            return {}
        
        stats = {
            'total_issues': len(coordinates),
            'issue_types': {},
            'regions_affected': {},
            'severity_distribution': {'High': 0, 'Medium': 0, 'Low': 0}
        }
        
        for coord in coordinates:
            issue_type = coord.get('issue', 'GENERAL')
            region = coord.get('region', 'UNKNOWN')
            
            # Count issue types
            stats['issue_types'][issue_type] = stats['issue_types'].get(issue_type, 0) + 1
            
            # Count regions
            stats['regions_affected'][region] = stats['regions_affected'].get(region, 0) + 1
            
            # Count severity
            severity = self._assess_severity(issue_type, region)
            stats['severity_distribution'][severity] += 1
        
        return stats
