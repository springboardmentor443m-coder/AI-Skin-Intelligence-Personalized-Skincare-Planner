"""
MediaPipe Landmark Mapper - Ultra-Precise Facial Region Mapping
Uses the 478-landmark MediaPipe Face Mesh for surgical accuracy
"""

import csv
import os
from typing import Dict, List, Tuple, Any
import logging

logger = logging.getLogger(__name__)

class MediaPipeLandmarkMapper:
    """Maps MediaPipe landmarks to precise facial regions for skin analysis"""
    
    def __init__(self):
        self.landmarks_data = {}
        self.region_mappings = {}
        self.skin_condition_landmarks = {}
        self._load_landmark_data()
        self._create_region_mappings()
        self._create_skin_condition_mappings()
    
    def _load_landmark_data(self):
        """Load landmark data from CSV file"""
        csv_path = os.path.join(os.path.dirname(__file__), '..', 'mediapipe_face_mesh_478_with_anatomical_labels.csv')
        
        try:
            with open(csv_path, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                for row in reader:
                    index = int(row['Index'])
                    self.landmarks_data[index] = {
                        'x': float(row['X']),
                        'y': float(row['Y']),
                        'z': float(row['Z']),
                        'region': row['Region'],
                        'description': row['Description']
                    }
            logger.info(f"Loaded {len(self.landmarks_data)} landmarks from CSV")
        except Exception as e:
            logger.error(f"Error loading landmark data: {e}")
            # Fallback to basic landmark structure
            self._create_fallback_landmarks()
    
    def _create_fallback_landmarks(self):
        """Create fallback landmark data if CSV loading fails"""
        logger.warning("Using fallback landmark data")
        # Basic landmark structure for essential regions
        basic_landmarks = {
            # Forehead region
            **{i: {'region': 'Forehead', 'description': f'Forehead landmark {i}'} for i in range(10, 30)},
            # Left eye region
            **{i: {'region': 'Left Eye', 'description': f'Left eye landmark {i}'} for i in range(33, 50)},
            # Right eye region  
            **{i: {'region': 'Right Eye', 'description': f'Right eye landmark {i}'} for i in range(263, 280)},
            # Nose region
            **{i: {'region': 'Nose', 'description': f'Nose landmark {i}'} for i in range(1, 50)},
            # Cheek region
            **{i: {'region': 'Cheek', 'description': f'Cheek landmark {i}'} for i in range(130, 200)},
            # Lips region
            **{i: {'region': 'Lips', 'description': f'Lips landmark {i}'} for i in range(61, 100)},
            # Chin region
            **{i: {'region': 'Chin', 'description': f'Chin landmark {i}'} for i in range(175, 200)},
            # Jawline region
            **{i: {'region': 'Jawline', 'description': f'Jawline landmark {i}'} for i in range(330, 400)}
        }
        self.landmarks_data = basic_landmarks
    
    def _create_region_mappings(self):
        """Create detailed region mappings for precise analysis"""
        self.region_mappings = {
            'FOREHEAD': {
                'landmarks': [i for i in range(10, 30) if i in self.landmarks_data],
                'description': 'Forehead region including hairline to eyebrow area',
                'common_issues': ['acne', 'oiliness', 'fine_lines', 'hyperpigmentation']
            },
            'LEFT_EYEBROW': {
                'landmarks': [i for i in range(70, 110) if i in self.landmarks_data],
                'description': 'Left eyebrow and supraorbital ridge',
                'common_issues': ['fine_lines', 'sparse_hair', 'asymmetry']
            },
            'RIGHT_EYEBROW': {
                'landmarks': [i for i in range(300, 340) if i in self.landmarks_data],
                'description': 'Right eyebrow and supraorbital ridge', 
                'common_issues': ['fine_lines', 'sparse_hair', 'asymmetry']
            },
            'LEFT_EYE': {
                'landmarks': [i for i in range(33, 50) if i in self.landmarks_data],
                'description': 'Left eye orbital region including eyelids',
                'common_issues': ['dark_circles', 'fine_lines', 'puffiness', 'dryness']
            },
            'RIGHT_EYE': {
                'landmarks': [i for i in range(263, 280) if i in self.landmarks_data],
                'description': 'Right eye orbital region including eyelids',
                'common_issues': ['dark_circles', 'fine_lines', 'puffiness', 'dryness']
            },
            'LEFT_UNDER_EYE': {
                'landmarks': [i for i in range(50, 70) if i in self.landmarks_data],
                'description': 'Left under-eye area and tear trough',
                'common_issues': ['dark_circles', 'bags', 'fine_lines', 'hollowing']
            },
            'RIGHT_UNDER_EYE': {
                'landmarks': [i for i in range(280, 300) if i in self.landmarks_data],
                'description': 'Right under-eye area and tear trough',
                'common_issues': ['dark_circles', 'bags', 'fine_lines', 'hollowing']
            },
            'NOSE': {
                'landmarks': [i for i in range(1, 50) if i in self.landmarks_data and self.landmarks_data[i]['region'] == 'Nose'],
                'description': 'Nasal region including bridge, tip, and alar base',
                'common_issues': ['blackheads', 'pores', 'oiliness', 'redness']
            },
            'LEFT_CHEEK': {
                'landmarks': [i for i in range(130, 200) if i in self.landmarks_data and 'left' in self.landmarks_data[i]['description'].lower()],
                'description': 'Left cheek malar region',
                'common_issues': ['acne', 'hyperpigmentation', 'fine_lines', 'pores']
            },
            'RIGHT_CHEEK': {
                'landmarks': [i for i in range(300, 400) if i in self.landmarks_data and 'right' in self.landmarks_data[i]['description'].lower()],
                'description': 'Right cheek malar region',
                'common_issues': ['acne', 'hyperpigmentation', 'fine_lines', 'pores']
            },
            'UPPER_LIP': {
                'landmarks': [i for i in range(61, 85) if i in self.landmarks_data],
                'description': 'Upper lip vermilion and philtrum',
                'common_issues': ['fine_lines', 'dryness', 'pigmentation']
            },
            'LOWER_LIP': {
                'landmarks': [i for i in range(85, 100) if i in self.landmarks_data],
                'description': 'Lower lip vermilion and labial region',
                'common_issues': ['fine_lines', 'dryness', 'pigmentation']
            },
            'CHIN': {
                'landmarks': [i for i in range(175, 200) if i in self.landmarks_data and self.landmarks_data[i]['region'] == 'Chin'],
                'description': 'Chin and mental region',
                'common_issues': ['acne', 'hyperpigmentation', 'texture']
            },
            'LEFT_JAWLINE': {
                'landmarks': [i for i in range(330, 380) if i in self.landmarks_data and 'left' in self.landmarks_data[i]['description'].lower()],
                'description': 'Left jawline and mandibular contour',
                'common_issues': ['acne', 'texture', 'fine_lines']
            },
            'RIGHT_JAWLINE': {
                'landmarks': [i for i in range(380, 430) if i in self.landmarks_data and 'right' in self.landmarks_data[i]['description'].lower()],
                'description': 'Right jawline and mandibular contour',
                'common_issues': ['acne', 'texture', 'fine_lines']
            }
        }
    
    def _create_skin_condition_mappings(self):
        """Create mappings for specific skin conditions and their associated landmarks"""
        self.skin_condition_landmarks = {
            'ACNE': {
                'primary_regions': ['FOREHEAD', 'LEFT_CHEEK', 'RIGHT_CHEEK', 'CHIN', 'LEFT_JAWLINE', 'RIGHT_JAWLINE'],
                'landmark_patterns': {
                    'inflammatory': [i for i in range(130, 200) if i in self.landmarks_data],  # Cheek areas
                    'comedonal': [i for i in range(1, 50) if i in self.landmarks_data],  # T-zone
                    'hormonal': [i for i in range(330, 400) if i in self.landmarks_data]  # Jawline
                },
                'symptoms': [
                    'Red, inflamed bumps (papules)',
                    'White or yellow pus-filled lesions (pustules)',
                    'Deep, painful nodules or cysts',
                    'Blackheads (open comedones)',
                    'Whiteheads (closed comedones)',
                    'Enlarged pores with visible sebum',
                    'Post-inflammatory hyperpigmentation (dark spots)',
                    'Scarring or pitting from previous breakouts'
                ]
            },
            'DARK_CIRCLES': {
                'primary_regions': ['LEFT_UNDER_EYE', 'RIGHT_UNDER_EYE'],
                'landmark_patterns': {
                    'vascular': [i for i in range(50, 70) if i in self.landmarks_data],  # Under-eye area
                    'pigmented': [i for i in range(280, 300) if i in self.landmarks_data]  # Under-eye area
                },
                'symptoms': [
                    'Dark, bluish or purple discoloration under eyes',
                    'Hollow or sunken appearance (tear trough depression)',
                    'Puffy or swollen under-eye area',
                    'Thin, translucent skin showing underlying blood vessels',
                    'Hyperpigmentation from sun damage or genetics',
                    'Allergic shiners (dark circles from allergies)'
                ]
            },
            'FINE_LINES': {
                'primary_regions': ['LEFT_EYE', 'RIGHT_EYE', 'FOREHEAD', 'UPPER_LIP', 'LOWER_LIP'],
                'landmark_patterns': {
                    'crow_feet': [i for i in range(33, 50) if i in self.landmarks_data],  # Eye corners
                    'forehead_lines': [i for i in range(10, 30) if i in self.landmarks_data],  # Forehead
                    'lip_lines': [i for i in range(61, 100) if i in self.landmarks_data]  # Around lips
                },
                'symptoms': [
                    'Small, shallow lines around the eyes (crow\'s feet)',
                    'Horizontal lines across the forehead',
                    'Vertical lines between eyebrows (frown lines)',
                    'Fine lines around the mouth (smoker\'s lines)',
                    'Nasolabial folds (lines from nose to mouth)',
                    'Marionette lines (lines from mouth to chin)',
                    'Dynamic lines that appear with facial expressions',
                    'Static lines visible even at rest'
                ]
            },
            'HYPERPIGMENTATION': {
                'primary_regions': ['LEFT_CHEEK', 'RIGHT_CHEEK', 'FOREHEAD', 'NOSE', 'CHIN'],
                'landmark_patterns': {
                    'melasma': [i for i in range(130, 200) if i in self.landmarks_data],  # Cheek areas
                    'sun_spots': [i for i in range(10, 50) if i in self.landmarks_data],  # Forehead/nose
                    'post_inflammatory': [i for i in range(130, 400) if i in self.landmarks_data]  # Any area
                },
                'symptoms': [
                    'Brown or gray-brown patches on cheeks, forehead, or upper lip',
                    'Sun spots or age spots (solar lentigines)',
                    'Post-inflammatory hyperpigmentation (PIH) from acne or injury',
                    'Freckles or ephelides',
                    'Uneven skin tone or blotchy appearance',
                    'Dark patches that worsen with sun exposure',
                    'Melasma (mask of pregnancy) - symmetrical dark patches'
                ]
            },
            'LARGE_PORES': {
                'primary_regions': ['NOSE', 'LEFT_CHEEK', 'RIGHT_CHEEK', 'FOREHEAD'],
                'landmark_patterns': {
                    't_zone': [i for i in range(1, 50) if i in self.landmarks_data],  # Nose and forehead
                    'cheek_pores': [i for i in range(130, 200) if i in self.landmarks_data]  # Cheek areas
                },
                'symptoms': [
                    'Visible, enlarged pores on nose and T-zone',
                    'Pores filled with blackheads or sebaceous filaments',
                    'Orange peel texture on cheeks',
                    'Pores that appear larger due to oiliness',
                    'Stretched pores from previous acne or blackhead extraction',
                    'Pores that become more visible with age or sun damage'
                ]
            },
            'REDNESS': {
                'primary_regions': ['LEFT_CHEEK', 'RIGHT_CHEEK', 'NOSE', 'FOREHEAD'],
                'landmark_patterns': {
                    'rosacea': [i for i in range(130, 200) if i in self.landmarks_data],  # Cheek areas
                    'sensitivity': [i for i in range(1, 200) if i in self.landmarks_data]  # Any area
                },
                'symptoms': [
                    'Persistent redness on cheeks, nose, or forehead',
                    'Visible blood vessels (telangiectasias)',
                    'Flushing or blushing easily',
                    'Burning or stinging sensation',
                    'Red bumps or pustules (rosacea)',
                    'Thickened skin on nose (rhinophyma)',
                    'Sensitive or reactive skin',
                    'Redness that worsens with triggers (heat, stress, alcohol)'
                ]
            },
            'DRYNESS': {
                'primary_regions': ['LEFT_CHEEK', 'RIGHT_CHEEK', 'FOREHEAD', 'UPPER_LIP', 'LOWER_LIP'],
                'landmark_patterns': {
                    'cheek_dryness': [i for i in range(130, 200) if i in self.landmarks_data],
                    'lip_dryness': [i for i in range(61, 100) if i in self.landmarks_data]
                },
                'symptoms': [
                    'Tight, uncomfortable feeling in skin',
                    'Flaky or scaly patches',
                    'Rough, uneven texture',
                    'Fine lines and wrinkles more prominent',
                    'Dull, lackluster appearance',
                    'Chapped or cracked lips',
                    'Itching or irritation',
                    'Skin that feels rough to the touch'
                ]
            }
        }
    
    def get_landmarks_for_region(self, region: str) -> List[int]:
        """Get landmark indices for a specific facial region"""
        return self.region_mappings.get(region, {}).get('landmarks', [])
    
    def get_landmarks_for_condition(self, condition: str) -> Dict[str, List[int]]:
        """Get landmark patterns for a specific skin condition"""
        return self.skin_condition_landmarks.get(condition, {}).get('landmark_patterns', {})
    
    def get_condition_symptoms(self, condition: str) -> List[str]:
        """Get detailed symptoms for a specific skin condition"""
        return self.skin_condition_landmarks.get(condition, {}).get('symptoms', [])
    
    def get_landmark_info(self, landmark_index: int) -> Dict[str, Any]:
        """Get detailed information about a specific landmark"""
        return self.landmarks_data.get(landmark_index, {})
    
    def get_all_regions(self) -> List[str]:
        """Get list of all available facial regions"""
        return list(self.region_mappings.keys())
    
    def get_all_conditions(self) -> List[str]:
        """Get list of all available skin conditions"""
        return list(self.skin_condition_landmarks.keys())
    
    def create_landmark_prompt_data(self) -> str:
        """Create comprehensive landmark data for AI prompt"""
        prompt_data = "MEDIAPIPE FACIAL LANDMARK REFERENCE DATA:\n\n"
        
        # Add region mappings
        prompt_data += "FACIAL REGIONS AND LANDMARKS:\n"
        for region, data in self.region_mappings.items():
            prompt_data += f"\n{region}:\n"
            prompt_data += f"  Description: {data['description']}\n"
            prompt_data += f"  Landmark Indices: {data['landmarks'][:10]}{'...' if len(data['landmarks']) > 10 else ''}\n"
            prompt_data += f"  Common Issues: {', '.join(data['common_issues'])}\n"
        
        # Add skin condition mappings
        prompt_data += "\n\nSKIN CONDITIONS AND ASSOCIATED LANDMARKS:\n"
        for condition, data in self.skin_condition_landmarks.items():
            prompt_data += f"\n{condition}:\n"
            prompt_data += f"  Primary Regions: {', '.join(data['primary_regions'])}\n"
            prompt_data += f"  Symptoms to Look For:\n"
            for symptom in data['symptoms']:
                prompt_data += f"    - {symptom}\n"
            prompt_data += f"  Key Landmark Patterns:\n"
            for pattern_type, landmarks in data['landmark_patterns'].items():
                prompt_data += f"    {pattern_type}: {landmarks[:5]}{'...' if len(landmarks) > 5 else ''}\n"
        
        return prompt_data

# Global instance
landmark_mapper = MediaPipeLandmarkMapper()
