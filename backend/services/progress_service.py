import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

class ProgressService:
    @staticmethod
    def calculate_betterment(past_analysis: Dict[str, Any], current_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Compares two ML skin assessment results (Past vs Current) and calculates
        the Skin Betterment Score, percentage changes in concerns, and structured feedback.
        """
        
        # Extract concern probabilities
        past_concerns_data = past_analysis.get("skin_concerns", {})
        current_concerns_data = current_analysis.get("skin_concerns", {})
        
        past_probs = past_concerns_data.get("all_probabilities", {})
        current_probs = current_concerns_data.get("all_probabilities", {})
        
        past_primary_concern = past_concerns_data.get("prediction", "Normal")
        current_primary_concern = current_concerns_data.get("prediction", "Normal")
        
        # Calculate Normal skin probability delta
        past_normal_prob = past_probs.get("Normal", 0.0)
        current_normal_prob = current_probs.get("Normal", 0.0)
        normal_delta = current_normal_prob - past_normal_prob  # positive means healthier skin
        
        # Calculate changes for all concern categories
        all_classes = set(past_probs.keys()).union(set(current_probs.keys()))
        
        changes = []
        improvements = []
        concerns_worsened = []
        
        for cls in all_classes:
            if cls == "Normal":
                continue
                
            p_prob = past_probs.get(cls, 0.0)
            c_prob = current_probs.get(cls, 0.0)
            delta = c_prob - p_prob  # negative delta means reduction in concern (good!)
            
            change_info = {
                "concern": cls,
                "past_probability": round(p_prob * 100, 2),
                "current_probability": round(c_prob * 100, 2),
                "absolute_change_percent": round(delta * 100, 2)
            }
            changes.append(change_info)
            
            # Significant reduction (> 5% drop)
            if delta <= -0.05:
                reduction_pct = abs(round(delta * 100, 1))
                message_str = f"Your {cls} concern has reduced significantly by {reduction_pct}% (from {round(p_prob * 100, 1)}% down to {round(c_prob * 100, 1)}%)!"
                improvements.append({
                    "concern": cls,
                    "reduction_percentage": reduction_pct,
                    "message": message_str
                })
            # Increase in concern (> 5% increase)
            elif delta >= 0.05:
                increase_pct = round(delta * 100, 1)
                concerns_worsened.append({
                    "concern": cls,
                    "increase_percentage": increase_pct,
                    "message": f"{cls.capitalize()} increased by {increase_pct}%."
                })
                
        # Calculate Overall Skin Betterment Score (0% to 100%)
        # Formula: 50% weight on Normal increase + 50% weight on reduction of past primary concern
        past_top_concern_past_prob = past_probs.get(past_primary_concern, 0.0)
        past_top_concern_curr_prob = current_probs.get(past_primary_concern, 0.0)
        
        if past_primary_concern != "Normal" and past_top_concern_past_prob > 0:
            top_concern_reduction = max(0.0, past_top_concern_past_prob - past_top_concern_curr_prob) / past_top_concern_past_prob
        else:
            top_concern_reduction = 1.0 if current_primary_concern == "Normal" else 0.5
            
        normal_improvement_factor = max(0.0, min(1.0, (current_normal_prob - past_normal_prob + 1.0) / 2.0))
        
        betterment_score = round(((top_concern_reduction * 0.5) + (normal_improvement_factor * 0.5)) * 100, 1)
        
        # Determine Status Headline
        if betterment_score >= 70 or (past_primary_concern != "Normal" and current_primary_concern == "Normal"):
            status = "SIGNIFICANT_IMPROVEMENT"
            headline = f"Outstanding Progress! Your skin health score is {betterment_score}%."
        elif betterment_score >= 50:
            status = "MODERATE_IMPROVEMENT"
            headline = f"Steady Progress! Your skin health score is {betterment_score}%."
        else:
            status = "NEEDS_ATTENTION"
            headline = f"Your skin condition requires extra care. Health score: {betterment_score}%."

        # Craft human-readable summary
        summary_messages = []
        if improvements:
            for imp in improvements:
                summary_messages.append(imp["message"])
        elif current_primary_concern == "Normal":
            summary_messages.append("Your skin is maintaining a healthy, clear state!")
        else:
            summary_messages.append(f"Current primary concern is {current_primary_concern}.")

        return {
            "status": status,
            "overall_betterment_score": betterment_score,
            "headline": headline,
            "comparison_summary": {
                "past_primary_concern": past_primary_concern,
                "current_primary_concern": current_primary_concern,
                "normal_skin_health_change": f"{round(normal_delta * 100, 2):+}%"
            },
            "key_improvements": improvements,
            "concerns_worsened": concerns_worsened,
            "all_concern_deltas": changes,
            "personalized_advice": (
                "Your routine is working wonderfully! Keep up with your daily sunscreen and nighttime recovery routine."
                if betterment_score >= 50 else
                "Consider adjusting your active treatments and focusing on barrier repair."
            )
        }

progress_service = ProgressService()
