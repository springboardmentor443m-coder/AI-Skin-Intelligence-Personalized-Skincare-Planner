"""
AI Engine for SkinAI Analyzer
Handles AI model interactions, analysis processing, and coordinate extraction
"""

import requests
import json
import re
import logging
from typing import Dict, List, Tuple, Optional, Any
import time

from config.settings import Config
from config.models import ModelConfig
from prompts.analysis_prompt import AnalysisPrompt
from core.landmark_mapper import landmark_mapper
from core.image_processor import ImageProcessor

class AIEngine:
    """Advanced AI engine for skincare analysis"""
    
    def __init__(self):
        self.api_key = Config.OPENROUTER_API_KEY
        self.api_url = Config.OPENROUTER_API_URL
        self.image_processor = ImageProcessor()
        self.models = [Config.PRIMARY_MODEL, Config.BACKUP_MODEL_1, Config.BACKUP_MODEL_2]
        
        logging.info("AI Engine initialized")
    
    def analyze_image(self, image, landmark_data: Optional[Dict[str, Any]], 
                     user_context: str, progress_callback=None) -> Dict[str, Any]:
        """
        Analyze image with AI models
        
        Args:
            image: PIL Image object
            landmark_data: MediaPipe landmark data
            user_context: User profile and context
            progress_callback: Progress callback function
            
        Returns:
            Analysis results with coordinates and recommendations
        """
        try:
            if progress_callback:
                progress_callback(10, "Preparing image for analysis...")
            
            # Preprocess image
            processed_image = self.image_processor.optimize_for_analysis(image)
            
            if progress_callback:
                progress_callback(20, "Generating ultra-detailed analysis prompt...")
            
            # Create analysis prompt with landmark data
            prompt_generator = AnalysisPrompt()
            prompt = prompt_generator.get_prompt()
            
            if progress_callback:
                progress_callback(30, "Sending request to AI model...")
            
            # Get AI analysis
            analysis_result = self._get_ai_analysis(processed_image, prompt, progress_callback)
            
            if progress_callback:
                progress_callback(80, "Extracting coordinates and formatting results...")
            
            # Extract coordinates
            coordinates = self._extract_coordinates(analysis_result['analysis'], landmark_data)
            
            if progress_callback:
                progress_callback(100, "Analysis complete!")
            
            return {
                'analysis': analysis_result['analysis'],
                'coordinates': coordinates,
                'model_used': analysis_result['model_used'],
                'landmark_data': landmark_data,
                'total_coordinates': len(coordinates),
                'analysis_quality': self._assess_analysis_quality(analysis_result['analysis'])
            }
            
        except Exception as e:
            logging.error(f"AI analysis error: {str(e)}")
            raise Exception(f"Analysis failed: {str(e)}")
    
    def _get_ai_analysis(self, image, prompt: str, progress_callback=None) -> Dict[str, Any]:
        """Get analysis from AI models with fallback"""
        
        for i, model in enumerate(self.models):
            try:
                if progress_callback:
                    progress = 30 + (i * 20)
                    progress_callback(progress, f"Trying model: {model.split('/')[-1]}...")
                
                # Get model configuration
                model_config = ModelConfig.get_model_config(model)
                
                # Convert image to base64
                img_base64 = self.image_processor.convert_to_base64(image)
                if not img_base64:
                    raise Exception("Image conversion failed")
                
                # Prepare request
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "model": model,
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": prompt},
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/jpeg;base64,{img_base64}"
                                    }
                                }
                            ]
                        }
                    ],
                    "max_tokens": model_config['max_tokens'],
                    "temperature": model_config['temperature']
                }
                
                # Make request
                response = requests.post(
                    self.api_url, 
                    headers=headers, 
                    json=payload, 
                    timeout=model_config['timeout']
                )
                response.raise_for_status()
                
                result = response.json()
                
                if 'choices' not in result or not result['choices']:
                    raise Exception("Invalid response format")
                
                analysis_text = result['choices'][0]['message']['content']
                
                logging.info(f"AI analysis successful with model: {model}")
                return {
                    'analysis': analysis_text,
                    'model_used': model
                }
                
            except Exception as e:
                logging.warning(f"Model {model} failed: {str(e)}")
                if i == len(self.models) - 1:  # Last model
                    raise Exception(f"All models failed. Last error: {str(e)}")
                continue
    
    def _extract_coordinates(self, analysis_text: str, landmark_data: Optional[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract landmark-based coordinates from AI analysis"""
        try:
            from utils.coordinate_parser import CoordinateParser
            
            parser = CoordinateParser()
            coordinates = parser.parse_coordinates_from_analysis(analysis_text, landmark_data)
            
            logging.info(f"Extracted {len(coordinates)} landmark coordinates from analysis")
            return coordinates
            
        except Exception as e:
            logging.error(f"Landmark coordinate extraction error: {e}")
            return []
    
    def _validate_coordinate(self, x: int, y: int, region: str, landmark_data: Optional[Dict[str, Any]]) -> bool:
        """Validate coordinate against image bounds and region"""
        if not landmark_data:
            return True  # Skip validation if no landmark data
        
        # Check image bounds
        img_width, img_height = landmark_data.get('image_dimensions', (1000, 1000))
        margin = Config.COORDINATE_BOUNDARY_MARGIN
        
        if (x < margin or x > img_width - margin or 
            y < margin or y > img_height - margin):
            return False
        
        # Check if coordinate is in valid region (if region boundaries available)
        if 'region_boundaries' in landmark_data:
            boundaries = landmark_data['region_boundaries'].get(region)
            if boundaries:
                return (boundaries['min_x'] <= x <= boundaries['max_x'] and 
                        boundaries['min_y'] <= y <= boundaries['max_y'])
        
        return True
    
    def _assess_analysis_quality(self, analysis_text: str) -> Dict[str, Any]:
        """Assess the quality of AI analysis"""
        quality_metrics = {
            'completeness': 0.0,
            'structure': 0.0,
            'detail_level': 0.0,
            'coordinate_count': 0,
            'overall_quality': 0.0
        }
        
        try:
            # Check for required sections
            required_sections = ['Executive Summary', 'Problem Identification', 'Product Recommendations']
            found_sections = sum(1 for section in required_sections if section in analysis_text)
            quality_metrics['completeness'] = found_sections / len(required_sections)
            
            # Check for proper formatting
            bullet_points = analysis_text.count('•')
            quality_metrics['structure'] = min(1.0, bullet_points / 10)  # Expect at least 10 bullet points
            
            # Count coordinates
            coordinate_pattern = r'\[([A-Z_]+),\s*([A-Z_]+),\s*(\d+),\s*(\d+)\]'
            coordinates = re.findall(coordinate_pattern, analysis_text)
            quality_metrics['coordinate_count'] = len(coordinates)
            
            # Assess detail level
            word_count = len(analysis_text.split())
            quality_metrics['detail_level'] = min(1.0, word_count / 1000)  # Expect at least 1000 words
            
            # Calculate overall quality
            quality_metrics['overall_quality'] = (
                quality_metrics['completeness'] * 0.3 +
                quality_metrics['structure'] * 0.3 +
                quality_metrics['detail_level'] * 0.2 +
                min(1.0, quality_metrics['coordinate_count'] / 4) * 0.2
            )
            
        except Exception as e:
            logging.error(f"Quality assessment error: {str(e)}")
        
        return quality_metrics
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about available models"""
        model_info = {}
        for model in self.models:
            model_info[model] = ModelConfig.get_model_info(model)
        return model_info
    
    def validate_api_key(self) -> bool:
        """Validate API key"""
        return bool(self.api_key and len(self.api_key) > 10)
