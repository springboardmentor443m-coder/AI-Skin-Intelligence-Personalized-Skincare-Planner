"""
Image Processing Module for SkinAI Analyzer
Handles image validation, preprocessing, and optimization
"""

import cv2
import numpy as np
from PIL import Image, ImageEnhance
from typing import Dict, List, Tuple, Optional, Any
import logging
import io
import base64

from config.settings import Config

class ImageProcessor:
    """Advanced image processing for skincare analysis"""
    
    def __init__(self):
        self.max_size = Config.MAX_IMAGE_SIZE
        self.max_resolution = Config.MAX_IMAGE_RESOLUTION
        self.min_resolution = Config.MIN_IMAGE_RESOLUTION
        self.compression_quality = Config.COMPRESSION_QUALITY
        
        logging.info("Image Processor initialized")
    
    def validate_image(self, image: Image.Image) -> Dict[str, Any]:
        """
        Validate image for analysis
        
        Args:
            image: PIL Image object
            
        Returns:
            Dictionary with validation results and recommendations
        """
        validation_result = {
            'valid': True,
            'warnings': [],
            'errors': [],
            'recommendations': [],
            'image_info': {}
        }
        
        try:
            # Get image information
            width, height = image.size
            mode = image.mode
            format_name = image.format
            
            validation_result['image_info'] = {
                'width': width,
                'height': height,
                'mode': mode,
                'format': format_name,
                'aspect_ratio': width / height if height > 0 else 0
            }
            
            # Check image size
            if width < self.min_resolution or height < self.min_resolution:
                validation_result['warnings'].append(f"Image resolution ({width}x{height}) is below recommended minimum ({self.min_resolution}x{self.min_resolution})")
                validation_result['recommendations'].append("Use a higher resolution image for better analysis accuracy")
            
            if width > self.max_resolution or height > self.max_resolution:
                validation_result['warnings'].append(f"Image resolution ({width}x{height}) exceeds maximum ({self.max_resolution}x{self.max_resolution})")
                validation_result['recommendations'].append("Image will be resized for optimal processing")
            
            # Check aspect ratio
            aspect_ratio = width / height
            if aspect_ratio < 0.5 or aspect_ratio > 2.0:
                validation_result['warnings'].append(f"Unusual aspect ratio ({aspect_ratio:.2f}) may affect analysis accuracy")
                validation_result['recommendations'].append("Use images with aspect ratio between 0.5 and 2.0")
            
            # Check color mode
            if mode not in ['RGB', 'RGBA', 'L']:
                validation_result['warnings'].append(f"Color mode '{mode}' may not be optimal for analysis")
                validation_result['recommendations'].append("Convert to RGB mode for best results")
            
            # Check for face detection feasibility
            if width < 400 or height < 400:
                validation_result['warnings'].append("Small image size may make face detection difficult")
                validation_result['recommendations'].append("Use images with at least 400x400 pixels")
            
            # Overall validation
            if validation_result['warnings']:
                validation_result['valid'] = True  # Warnings don't make it invalid
            else:
                validation_result['recommendations'].append("Image is optimal for analysis")
            
            logging.info(f"Image validation complete: {len(validation_result['warnings'])} warnings, {len(validation_result['errors'])} errors")
            
        except Exception as e:
            validation_result['valid'] = False
            validation_result['errors'].append(f"Image validation failed: {str(e)}")
            logging.error(f"Image validation error: {str(e)}")
        
        return validation_result
    
    def preprocess_image(self, image: Image.Image) -> Image.Image:
        """
        Preprocess image for optimal analysis
        
        Args:
            image: PIL Image object
            
        Returns:
            Preprocessed PIL Image
        """
        try:
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize if too large
            width, height = image.size
            if width > self.max_resolution or height > self.max_resolution:
                image = self._resize_image(image, self.max_resolution)
            
            # Enhance image quality
            image = self._enhance_image_quality(image)
            
            logging.info(f"Image preprocessing complete: {image.size}")
            return image
            
        except Exception as e:
            logging.error(f"Image preprocessing error: {str(e)}")
            return image
    
    def _resize_image(self, image: Image.Image, max_size: int) -> Image.Image:
        """Resize image while maintaining aspect ratio"""
        width, height = image.size
        
        if width > height:
            new_width = max_size
            new_height = int((height * max_size) / width)
        else:
            new_height = max_size
            new_width = int((width * max_size) / height)
        
        return image.resize((new_width, new_height), Image.Resampling.LANCZOS)
    
    def _enhance_image_quality(self, image: Image.Image) -> Image.Image:
        """Enhance image quality for better analysis"""
        try:
            # Enhance contrast slightly
            enhancer = ImageEnhance.Contrast(image)
            image = enhancer.enhance(1.1)
            
            # Enhance sharpness slightly
            enhancer = ImageEnhance.Sharpness(image)
            image = enhancer.enhance(1.05)
            
            # Enhance brightness if needed
            enhancer = ImageEnhance.Brightness(image)
            image = enhancer.enhance(1.02)
            
            return image
            
        except Exception as e:
            logging.warning(f"Image enhancement failed: {str(e)}")
            return image
    
    def convert_to_base64(self, image: Image.Image) -> str:
        """Convert PIL image to base64 string for API transmission"""
        try:
            buffer = io.BytesIO()
            if image.mode != 'RGB':
                image = image.convert('RGB')
            image.save(buffer, format='JPEG', quality=self.compression_quality)
            buffer.seek(0)
            return base64.b64encode(buffer.read()).decode('utf-8')
        except Exception as e:
            logging.error(f"Base64 conversion error: {str(e)}")
            return ""
    
    def create_thumbnail(self, image: Image.Image, size: Tuple[int, int] = (300, 300)) -> Image.Image:
        """Create thumbnail for display"""
        try:
            return image.copy().thumbnail(size, Image.Resampling.LANCZOS)
        except Exception as e:
            logging.error(f"Thumbnail creation error: {str(e)}")
            return image
    
    def detect_image_orientation(self, image: Image.Image) -> str:
        """Detect if image needs rotation"""
        try:
            # Check EXIF data for orientation
            if hasattr(image, '_getexif'):
                exif = image._getexif()
                if exif is not None:
                    orientation = exif.get(274)  # Orientation tag
                    if orientation == 3:
                        return "rotate_180"
                    elif orientation == 6:
                        return "rotate_90_cw"
                    elif orientation == 8:
                        return "rotate_90_ccw"
            
            return "normal"
        except Exception as e:
            logging.warning(f"Orientation detection failed: {str(e)}")
            return "normal"
    
    def auto_rotate_image(self, image: Image.Image) -> Image.Image:
        """Auto-rotate image based on EXIF data"""
        orientation = self.detect_image_orientation(image)
        
        if orientation == "rotate_180":
            return image.rotate(180, expand=True)
        elif orientation == "rotate_90_cw":
            return image.rotate(-90, expand=True)
        elif orientation == "rotate_90_ccw":
            return image.rotate(90, expand=True)
        else:
            return image
    
    def get_image_statistics(self, image: Image.Image) -> Dict[str, Any]:
        """Get detailed image statistics"""
        try:
            # Convert to numpy array for analysis
            img_array = np.array(image)
            
            # Basic statistics
            stats = {
                'size': image.size,
                'mode': image.mode,
                'format': image.format,
                'mean_brightness': float(np.mean(img_array)),
                'std_brightness': float(np.std(img_array)),
                'min_value': int(np.min(img_array)),
                'max_value': int(np.max(img_array))
            }
            
            # Color channel statistics if RGB
            if image.mode == 'RGB':
                r_channel = img_array[:, :, 0]
                g_channel = img_array[:, :, 1]
                b_channel = img_array[:, :, 2]
                
                stats['color_stats'] = {
                    'red_mean': float(np.mean(r_channel)),
                    'green_mean': float(np.mean(g_channel)),
                    'blue_mean': float(np.mean(b_channel)),
                    'red_std': float(np.std(r_channel)),
                    'green_std': float(np.std(g_channel)),
                    'blue_std': float(np.std(b_channel))
                }
            
            return stats
            
        except Exception as e:
            logging.error(f"Image statistics error: {str(e)}")
            return {}
    
    def optimize_for_analysis(self, image: Image.Image) -> Image.Image:
        """Optimize image specifically for skincare analysis"""
        try:
            # Auto-rotate if needed
            image = self.auto_rotate_image(image)
            
            # Preprocess for quality
            image = self.preprocess_image(image)
            
            # Additional optimization for face analysis
            image = self._optimize_for_face_detection(image)
            
            return image
            
        except Exception as e:
            logging.error(f"Analysis optimization error: {str(e)}")
            return image
    
    def _optimize_for_face_detection(self, image: Image.Image) -> Image.Image:
        """Optimize image specifically for face detection"""
        try:
            # Convert to OpenCV format for processing
            img_array = np.array(image)
            
            # Apply slight histogram equalization for better contrast
            if len(img_array.shape) == 3:  # Color image
                # Convert to LAB color space
                lab = cv2.cvtColor(img_array, cv2.COLOR_RGB2LAB)
                l, a, b = cv2.split(lab)
                
                # Apply CLAHE to L channel
                clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
                l = clahe.apply(l)
                
                # Merge channels and convert back
                lab = cv2.merge([l, a, b])
                img_array = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
            
            return Image.fromarray(img_array)
            
        except Exception as e:
            logging.warning(f"Face detection optimization failed: {str(e)}")
            return image
