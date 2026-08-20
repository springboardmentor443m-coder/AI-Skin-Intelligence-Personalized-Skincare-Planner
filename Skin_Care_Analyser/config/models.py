"""
AI Model configurations for SkinAI Analyzer
"""

from typing import Dict, Any

class ModelConfig:
    """AI Model configuration and management"""
    
    # Available models with their specifications
    MODELS = {
        'deepseek/deepseek-r1-0528:free': {
            'name': 'DeepSeek R1',
            'provider': 'DeepSeek',
            'max_tokens': 6000,
            'temperature': 0.1,
            'timeout': 90,
            'supports_vision': True,
            'supports_json': True,
            'cost_per_1k_tokens': 0.0,  # Free tier
            'description': 'Advanced reasoning model with vision capabilities'
        },
        'google/gemini-2.5-flash': {
            'name': 'Gemini 2.5 Flash',
            'provider': 'Google',
            'max_tokens': 8000,
            'temperature': 0.2,
            'timeout': 90,
            'supports_vision': True,
            'supports_json': True,
            'cost_per_1k_tokens': 0.075,
            'description': 'Fast multimodal model with excellent vision analysis'
        },
        'anthropic/claude-3.5-sonnet': {
            'name': 'Claude 3.5 Sonnet',
            'provider': 'Anthropic',
            'max_tokens': 8000,
            'temperature': 0.2,
            'timeout': 90,
            'supports_vision': True,
            'supports_json': True,
            'cost_per_1k_tokens': 3.0,
            'description': 'High-quality reasoning with superior vision capabilities'
        }
    }
    
    @classmethod
    def get_model_config(cls, model_name: str) -> Dict[str, Any]:
        """Get configuration for a specific model"""
        return cls.MODELS.get(model_name, cls.MODELS['deepseek/deepseek-r1-0528:free'])
    
    @classmethod
    def get_available_models(cls) -> list:
        """Get list of available model names"""
        return list(cls.MODELS.keys())
    
    @classmethod
    def get_model_info(cls, model_name: str) -> Dict[str, Any]:
        """Get detailed information about a model"""
        config = cls.get_model_config(model_name)
        return {
            'name': config['name'],
            'provider': config['provider'],
            'description': config['description'],
            'supports_vision': config['supports_vision'],
            'max_tokens': config['max_tokens'],
            'cost_per_1k_tokens': config['cost_per_1k_tokens']
        }
    
    @classmethod
    def validate_model(cls, model_name: str) -> bool:
        """Validate if model is available"""
        return model_name in cls.MODELS
    
    @classmethod
    def get_optimal_model_for_task(cls, task_type: str = 'analysis') -> str:
        """Get the best model for a specific task"""
        if task_type == 'analysis':
            # For detailed analysis, prefer models with high reasoning capabilities
            return 'deepseek/deepseek-r1-0528:free'
        elif task_type == 'vision':
            # For vision tasks, prefer models with excellent vision capabilities
            return 'google/gemini-2.5-flash'
        else:
            # Default fallback
            return 'deepseek/deepseek-r1-0528:free'
