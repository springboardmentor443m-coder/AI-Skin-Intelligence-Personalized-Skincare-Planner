# ==============================================================================
# backend/schemas/recommendation_request.py
# ==============================================================================

from enum import Enum


# ==============================================================================
# ENUMS
# ==============================================================================

class Gender(str, Enum):
    MALE = "Male"
    FEMALE = "Female"
    OTHER = "Other"


class SkinType(str, Enum):
    OILY = "Oily"
    DRY = "Dry"
    COMBINATION = "Combination"
    NORMAL = "Normal"
    SENSITIVE = "Sensitive"


class Budget(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"