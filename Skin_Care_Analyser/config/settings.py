"""
Configuration settings for SkinAI Analyzer
World's Most Advanced AI-Powered Skincare Analysis System
"""

import os
from dotenv import load_dotenv
from typing import Dict, List, Any

# Load environment variables
load_dotenv()

class Config:
    """Main configuration class"""
    
    # API Configuration
    OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY', '')
    OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
    
    # AI Models (Primary and Backup)
    PRIMARY_MODEL = os.getenv('PRIMARY_MODEL', 'deepseek/deepseek-r1-0528:free')
    BACKUP_MODEL_1 = os.getenv('BACKUP_MODEL_1', 'google/gemini-2.5-flash')
    BACKUP_MODEL_2 = os.getenv('BACKUP_MODEL_2', 'anthropic/claude-3.5-sonnet')
    
    # Model-specific configurations
    MODEL_CONFIGS = {
        'deepseek/deepseek-r1-0528:free': {
            'max_tokens': 6000,
            'temperature': 0.1,
            'timeout': 90
        },
        'google/gemini-2.5-flash': {
            'max_tokens': 8000,
            'temperature': 0.2,
            'timeout': 90
        },
        'anthropic/claude-3.5-sonnet': {
            'max_tokens': 8000,
            'temperature': 0.2,
            'timeout': 90
        }
    }
    
    # Image Processing Configuration
    MAX_IMAGE_SIZE = int(os.getenv('MAX_IMAGE_SIZE', 10485760))  # 10MB
    MAX_IMAGE_RESOLUTION = int(os.getenv('MAX_IMAGE_RESOLUTION', 4096))
    MIN_IMAGE_RESOLUTION = int(os.getenv('MIN_IMAGE_RESOLUTION', 800))
    COMPRESSION_QUALITY = int(os.getenv('COMPRESSION_QUALITY', 85))
    
    # MediaPipe Configuration
    MEDIAPIPE_CONFIDENCE = 0.7
    MEDIAPIPE_MAX_FACES = 1
    
    # Analysis Configuration
    MAX_COORDINATES = 6  # Maximum number of problem coordinates to show
    COORDINATE_RADIUS = 15  # Radius of annotation circles
    ANALYSIS_TIMEOUT = 120  # Analysis timeout in seconds
    
    # Coordinate validation
    MIN_COORDINATE_DISTANCE = 20  # Minimum distance between coordinates
    COORDINATE_BOUNDARY_MARGIN = 50  # Margin from image edges
    
    # UI Configuration
    APP_TITLE = "🔬 SkinAI Analyzer"
    APP_ICON = "🔬"
    PAGE_LAYOUT = "wide"
    
    # Default User Settings
    DEFAULT_ETHNICITY = ["Indian"]
    DEFAULT_SKIN_TYPE = ["Normal"]
    DEFAULT_AGE_RANGE = "23-27"
    DEFAULT_GENDER = "Female"

class FacialRegions:
    """Ultra-detailed facial regions with 478 MediaPipe landmarks"""
    
    # Core facial regions with precise landmark mapping
    REGIONS = {
        # Forehead regions
        'LEFT_FOREHEAD': [9, 10, 151, 21, 162, 127, 234, 93, 132, 58, 172, 136, 150, 149, 176, 148, 152],
        'RIGHT_FOREHEAD': [9, 10, 151, 21, 162, 127, 234, 93, 132, 58, 172, 136, 150, 149, 176, 148, 152],
        'CENTER_FOREHEAD': [9, 10, 151, 21, 162, 127, 234, 93, 132, 58, 172, 136, 150, 149, 176, 148, 152],
        
        # Eye regions
        'LEFT_EYE_UPPER': [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
        'LEFT_EYE_LOWER': [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
        'LEFT_UNDER_EYE': [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
        'RIGHT_EYE_UPPER': [362, 398, 384, 385, 386, 387, 388, 466, 263, 249, 390, 373, 374, 380, 381, 382],
        'RIGHT_EYE_LOWER': [362, 398, 384, 385, 386, 387, 388, 466, 263, 249, 390, 373, 374, 380, 381, 382],
        'RIGHT_UNDER_EYE': [362, 398, 384, 385, 386, 387, 388, 466, 263, 249, 390, 373, 374, 380, 381, 382],
        
        # Cheek regions
        'LEFT_CHEEK_UPPER': [116, 117, 118, 119, 120, 121, 126, 142, 36, 205, 206, 207, 213, 192, 147, 187],
        'LEFT_CHEEK_MIDDLE': [116, 117, 118, 119, 120, 121, 126, 142, 36, 205, 206, 207, 213, 192, 147, 187],
        'LEFT_CHEEK_LOWER': [116, 117, 118, 119, 120, 121, 126, 142, 36, 205, 206, 207, 213, 192, 147, 187],
        'RIGHT_CHEEK_UPPER': [345, 346, 347, 348, 349, 350, 451, 452, 453, 464, 435, 410, 454, 323, 361, 288],
        'RIGHT_CHEEK_MIDDLE': [345, 346, 347, 348, 349, 350, 451, 452, 453, 464, 435, 410, 454, 323, 361, 288],
        'RIGHT_CHEEK_LOWER': [345, 346, 347, 348, 349, 350, 451, 452, 453, 464, 435, 410, 454, 323, 361, 288],
        
        # Nose regions
        'NOSE_BRIDGE': [1, 2, 5, 4, 6, 19, 94, 125, 141, 235, 31, 228, 229, 230, 231, 232, 233, 244, 245, 122],
        'NOSE_TIP': [1, 2, 5, 4, 6, 19, 94, 125, 141, 235, 31, 228, 229, 230, 231, 232, 233, 244, 245, 122],
        'NOSE_WINGS': [1, 2, 5, 4, 6, 19, 94, 125, 141, 235, 31, 228, 229, 230, 231, 232, 233, 244, 245, 122],
        
        # Mouth regions
        'LEFT_LIP_UPPER': [0, 17, 18, 200, 199, 175, 13, 269, 270, 267, 271, 272, 12, 15, 16, 82, 81, 80, 78],
        'LEFT_LIP_LOWER': [0, 17, 18, 200, 199, 175, 13, 269, 270, 267, 271, 272, 12, 15, 16, 82, 81, 80, 78],
        'RIGHT_LIP_UPPER': [0, 17, 18, 200, 199, 175, 13, 269, 270, 267, 271, 272, 12, 15, 16, 82, 81, 80, 78],
        'RIGHT_LIP_LOWER': [0, 17, 18, 200, 199, 175, 13, 269, 270, 267, 271, 272, 12, 15, 16, 82, 81, 80, 78],
        'MOUTH_CENTER': [0, 17, 18, 200, 199, 175, 13, 269, 270, 267, 271, 272, 12, 15, 16, 82, 81, 80, 78],
        
        # Jawline regions
        'LEFT_JAWLINE': [18, 175, 199, 200, 16, 17, 18, 175, 199, 200, 16, 17, 18, 175, 199, 200],
        'RIGHT_JAWLINE': [18, 175, 199, 200, 16, 17, 18, 175, 199, 200, 16, 17, 18, 175, 199, 200],
        'CHIN': [18, 175, 199, 200, 16, 17, 18, 175, 199, 200, 16, 17, 18, 175, 199, 200]
    }
    
    # Issue type mapping to regions
    ISSUE_REGION_MAPPING = {
        'ACNE': ['LEFT_FOREHEAD', 'RIGHT_FOREHEAD', 'LEFT_CHEEK_UPPER', 'LEFT_CHEEK_MIDDLE', 'LEFT_CHEEK_LOWER', 
                'RIGHT_CHEEK_UPPER', 'RIGHT_CHEEK_MIDDLE', 'RIGHT_CHEEK_LOWER', 'NOSE_TIP', 'NOSE_WINGS', 
                'LEFT_JAWLINE', 'RIGHT_JAWLINE', 'CHIN'],
        'PIGMENTATION': ['LEFT_FOREHEAD', 'RIGHT_FOREHEAD', 'LEFT_CHEEK_UPPER', 'LEFT_CHEEK_MIDDLE', 'LEFT_CHEEK_LOWER',
                        'RIGHT_CHEEK_UPPER', 'RIGHT_CHEEK_MIDDLE', 'RIGHT_CHEEK_LOWER', 'LEFT_UNDER_EYE', 'RIGHT_UNDER_EYE'],
        'PORES': ['NOSE_TIP', 'NOSE_WINGS', 'LEFT_CHEEK_UPPER', 'LEFT_CHEEK_MIDDLE', 'RIGHT_CHEEK_UPPER', 'RIGHT_CHEEK_MIDDLE', 'CENTER_FOREHEAD'],
        'DARK_CIRCLES': ['LEFT_UNDER_EYE', 'RIGHT_UNDER_EYE'],
        'WRINKLES': ['LEFT_FOREHEAD', 'RIGHT_FOREHEAD', 'LEFT_EYE_UPPER', 'LEFT_EYE_LOWER', 'RIGHT_EYE_UPPER', 'RIGHT_EYE_LOWER', 'MOUTH_CENTER'],
        'REDNESS': ['LEFT_CHEEK_UPPER', 'LEFT_CHEEK_MIDDLE', 'LEFT_CHEEK_LOWER', 'RIGHT_CHEEK_UPPER', 'RIGHT_CHEEK_MIDDLE', 'RIGHT_CHEEK_LOWER', 'NOSE_TIP', 'NOSE_WINGS'],
        'TEXTURE': ['LEFT_CHEEK_UPPER', 'LEFT_CHEEK_MIDDLE', 'LEFT_CHEEK_LOWER', 'RIGHT_CHEEK_UPPER', 'RIGHT_CHEEK_MIDDLE', 'RIGHT_CHEEK_LOWER', 'CENTER_FOREHEAD', 'CHIN']
    }

class UIConfig:
    """UI and styling configuration"""
    
    # Color scheme
    PRIMARY_COLOR = "#667eea"
    SECONDARY_COLOR = "#764ba2"
    SUCCESS_COLOR = "#4ecdc4"
    WARNING_COLOR = "#ff6b6b"
    ERROR_COLOR = "#ff4757"
    
    # Text colors
    TEXT_PRIMARY = "#000000"
    TEXT_SECONDARY = "#666666"
    TEXT_WHITE = "#ffffff"
    
    # Background colors
    BG_PRIMARY = "#ffffff"
    BG_SECONDARY = "#f8f9fa"
    BG_GRADIENT_START = "#f8f9fa"
    BG_GRADIENT_END = "#e9ecef"
    
    # Component styling
    BORDER_RADIUS = "12px"
    SHADOW = "0 5px 15px rgba(0,0,0,0.08)"
    HEADER_SHADOW = "0 10px 30px rgba(0,0,0,0.1)"
    
    # Spacing
    PADDING_SMALL = "0.5rem"
    PADDING_MEDIUM = "1rem"
    PADDING_LARGE = "2rem"
    MARGIN_SMALL = "0.5rem"
    MARGIN_MEDIUM = "1rem"
    MARGIN_LARGE = "2rem"

class AnalysisConfig:
    """Analysis and processing configuration"""
    
    # Analysis sections
    ANALYSIS_SECTIONS = [
        "Executive Summary",
        "Problem Identification", 
        "Product Recommendations",
        "Improvement Timeline",
        "Lifestyle Integration",
        "Safety Protocols"
    ]
    
    # Section icons - Updated to match new prompt structure
    SECTION_ICONS = {
        "EXECUTIVE SUMMARY": "📊",
        "Executive Summary": "📊",
        "DETAILED PROBLEM IDENTIFICATION": "🔍",
        "Problem Identification": "🔍", 
        "Detailed Problem Identification": "🔍",
        "COMPREHENSIVE PRODUCT RECOMMENDATIONS": "🧴",
        "Product Recommendations": "🧴",
        "Comprehensive Product Recommendations": "🧴",
        "PERSONALIZED ROUTINE ARCHITECTURE": "🗓️",
        "Personalized Routine Architecture": "🗓️",
        "Routine Architecture": "🗓️",
        "REALISTIC IMPROVEMENT TIMELINE": "⏱️",
        "Improvement Timeline": "⏱️",
        "Realistic Improvement Timeline": "⏱️",
        "LIFESTYLE INTEGRATION PROTOCOLS": "🌟",
        "Lifestyle Integration": "🌟",
        "Lifestyle Integration Protocols": "🌟",
        "SAFETY PROTOCOLS & MONITORING": "⚠️",
        "Safety Protocols": "⚠️",
        "Safety Protocols & Monitoring": "⚠️"
    }
    
    # Coordinate validation
    MIN_COORDINATE_DISTANCE = 20  # Minimum distance between coordinates
    COORDINATE_BOUNDARY_MARGIN = 50  # Margin from image edges
    
    # Analysis quality thresholds
    HIGH_CONFIDENCE_THRESHOLD = 0.8
    MEDIUM_CONFIDENCE_THRESHOLD = 0.6
    LOW_CONFIDENCE_THRESHOLD = 0.4
