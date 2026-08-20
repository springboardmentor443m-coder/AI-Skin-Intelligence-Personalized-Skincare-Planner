"""
Text Formatters for SkinAI Analyzer
Handles formatting and parsing of analysis text
"""

import re
import logging
from typing import Dict, List, Any, Optional

class TextFormatter:
    """Advanced text formatting for analysis results"""
    
    def __init__(self):
        logging.info("Text Formatter initialized")
    
    def format_analysis_text(self, analysis_text: str) -> str:
        """Format analysis text for better readability with bold headers and normal text"""
        try:
            # Clean up formatting issues
            formatted_text = analysis_text.strip()
            
            # Convert section headers to bold format
            formatted_text = re.sub(r'##\s*([^#\n]+)', r'**\1**', formatted_text)
            formatted_text = re.sub(r'###\s*([^#\n]+)', r'**\1**', formatted_text)
            
            # Convert various bullet formats to consistent format
            formatted_text = re.sub(r'\*\s*', '• ', formatted_text)
            formatted_text = re.sub(r'-\s*', '• ', formatted_text)
            
            # Clean up line breaks
            formatted_text = re.sub(r'\n\s*\n', '\n\n', formatted_text)
            
            # Fix spacing around bullet points
            formatted_text = re.sub(r'\n\s*•', '\n•', formatted_text)
            
            # Ensure proper spacing after bold headers
            formatted_text = re.sub(r'(\*\*[^*]+\*\*)\n([^\n])', r'\1\n\n\2', formatted_text)
            
            # Format specific sections with better structure
            formatted_text = self._format_executive_summary(formatted_text)
            formatted_text = self._format_problem_identification(formatted_text)
            formatted_text = self._format_product_recommendations(formatted_text)
            
            return formatted_text
            
        except Exception as e:
            logging.error(f"Text formatting error: {str(e)}")
            return analysis_text
    
    def _format_executive_summary(self, text: str) -> str:
        """Format executive summary section with bold headers"""
        # Find executive summary section
        summary_pattern = r'(\*\*EXECUTIVE SUMMARY\*\*.*?)(?=\*\*[^*]+\*\*|\Z)'
        match = re.search(summary_pattern, text, re.DOTALL | re.IGNORECASE)
        
        if match:
            summary_section = match.group(1)
            
            # Format key metrics with bold headers
            summary_section = re.sub(r'Overall Skin Health Score:\s*([^\n]+)', 
                                   r'**Overall Skin Health Score:** \1', summary_section)
            summary_section = re.sub(r'Primary Concerns:\s*([^\n]+)', 
                                   r'**Primary Concerns:** \1', summary_section)
            summary_section = re.sub(r'Skin Type Assessment:\s*([^\n]+)', 
                                   r'**Skin Type Assessment:** \1', summary_section)
            summary_section = re.sub(r'Age-Appropriate Concerns:\s*([^\n]+)', 
                                   r'**Age-Appropriate Concerns:** \1', summary_section)
            
            # Replace the original section
            text = text.replace(match.group(1), summary_section)
        
        return text
    
    def _format_problem_identification(self, text: str) -> str:
        """Format problem identification section"""
        # Find problem identification section
        problem_pattern = r'(\*\*DETAILED PROBLEM IDENTIFICATION\*\*.*?)(?=\*\*[^*]+\*\*|\Z)'
        match = re.search(problem_pattern, text, re.DOTALL | re.IGNORECASE)
        
        if match:
            problem_section = match.group(1)
            
            # Format condition names with bold headers
            problem_section = re.sub(r'Condition Name:\s*([^\n]+)', 
                                   r'**Condition Name:** \1', problem_section)
            problem_section = re.sub(r'Landmark Coordinates:\s*([^\n]+)', 
                                   r'**Landmark Coordinates:** \1', problem_section)
            problem_section = re.sub(r'Visual Description:\s*([^\n]+)', 
                                   r'**Visual Description:** \1', problem_section)
            problem_section = re.sub(r'Severity Assessment:\s*([^\n]+)', 
                                   r'**Severity Assessment:** \1', problem_section)
            problem_section = re.sub(r'Confidence Level:\s*([^\n]+)', 
                                   r'**Confidence Level:** \1', problem_section)
            
            # Replace the original section
            text = text.replace(match.group(1), problem_section)
        
        return text
    
    def _format_product_recommendations(self, text: str) -> str:
        """Format product recommendations section"""
        # Find product recommendations section
        product_pattern = r'(\*\*COMPREHENSIVE PRODUCT RECOMMENDATIONS\*\*.*?)(?=\*\*[^*]+\*\*|\Z)'
        match = re.search(product_pattern, text, re.DOTALL | re.IGNORECASE)
        
        if match:
            product_section = match.group(1)
            
            # Format sub-sections with bold headers
            product_section = re.sub(r'Immediate Care \(Week 1-2\):', 
                                   r'**Immediate Care (Week 1-2):**', product_section)
            product_section = re.sub(r'Progressive Treatment \(Week 3-8\):', 
                                   r'**Progressive Treatment (Week 3-8):**', product_section)
            product_section = re.sub(r'Long-term Maintenance \(Month 2-6\):', 
                                   r'**Long-term Maintenance (Month 2-6):**', product_section)
            
            # Format product categories
            product_section = re.sub(r'Cleanser:', r'**Cleanser:**', product_section)
            product_section = re.sub(r'Treatment Products:', r'**Treatment Products:**', product_section)
            product_section = re.sub(r'Moisturizer:', r'**Moisturizer:**', product_section)
            product_section = re.sub(r'Sunscreen:', r'**Sunscreen:**', product_section)
            
            # Replace the original section
            text = text.replace(match.group(1), product_section)
        
        return text
    
    def extract_sections(self, analysis_text: str) -> Dict[str, str]:
        """Extract sections from analysis text"""
        sections = {}
        
        try:
            # Pattern for section headers
            section_pattern = r'##\s*(\d+\.\s*[^#\n]+)'
            section_matches = list(re.finditer(section_pattern, analysis_text))
            
            for i, match in enumerate(section_matches):
                start = match.start()
                title = match.group(1).strip()
                
                # Find end of section
                if i + 1 < len(section_matches):
                    end = section_matches[i + 1].start()
                else:
                    end = len(analysis_text)
                
                # Extract content
                content = analysis_text[start:end].strip()
                
                # Clean up title
                clean_title = re.sub(r'^\d+\.\s*', '', title)
                sections[clean_title] = content
            
            return sections
            
        except Exception as e:
            logging.error(f"Section extraction error: {str(e)}")
            return {}
    
    def extract_bullet_points(self, text: str) -> List[str]:
        """Extract bullet points from text"""
        try:
            # Find all bullet points
            bullet_pattern = r'•\s*([^\n]+)'
            bullets = re.findall(bullet_pattern, text)
            
            # Clean up bullet points
            cleaned_bullets = []
            for bullet in bullets:
                cleaned = bullet.strip()
                if cleaned:
                    cleaned_bullets.append(cleaned)
            
            return cleaned_bullets
            
        except Exception as e:
            logging.error(f"Bullet point extraction error: {str(e)}")
            return []
    
    def extract_key_metrics(self, analysis_text: str) -> Dict[str, Any]:
        """Extract key metrics from analysis text"""
        metrics = {}
        
        try:
            # Health score
            health_match = re.search(r'(\d+)/100', analysis_text)
            if health_match:
                metrics['health_score'] = int(health_match.group(1))
            
            # Skin type
            skin_type_match = re.search(r'Primary Skin Type[:\s]*([^\n]+)', analysis_text, re.IGNORECASE)
            if skin_type_match:
                metrics['skin_type'] = skin_type_match.group(1).strip()
            
            # Priority concerns
            concerns = []
            concern_pattern = r'•\s*([^•\n]+(?:acne|pigmentation|wrinkles|dark circles|pores|redness|texture)[^•\n]*)'
            concern_matches = re.findall(concern_pattern, analysis_text, re.IGNORECASE)
            metrics['priority_concerns'] = concern_matches[:3]
            
            # Improvement potential
            improvement_match = re.search(r'Improvement Potential[:\s]*([^\n]+)', analysis_text, re.IGNORECASE)
            if improvement_match:
                metrics['improvement_potential'] = improvement_match.group(1).strip()
            
            return metrics
            
        except Exception as e:
            logging.error(f"Key metrics extraction error: {str(e)}")
            return {}
    
    def format_product_recommendations(self, analysis_text: str) -> Dict[str, List[str]]:
        """Extract and format product recommendations"""
        recommendations = {
            'immediate': [],
            'core_routine': [],
            'specialized': []
        }
        
        try:
            # Extract immediate priorities
            immediate_section = self._extract_section_content(analysis_text, 'IMMEDIATE PRIORITIES')
            if immediate_section:
                recommendations['immediate'] = self.extract_bullet_points(immediate_section)
            
            # Extract core routine
            core_section = self._extract_section_content(analysis_text, 'CORE ROUTINE')
            if core_section:
                recommendations['core_routine'] = self.extract_bullet_points(core_section)
            
            # Extract specialized treatments
            specialized_section = self._extract_section_content(analysis_text, 'SPECIALIZED TREATMENTS')
            if specialized_section:
                recommendations['specialized'] = self.extract_bullet_points(specialized_section)
            
            return recommendations
            
        except Exception as e:
            logging.error(f"Product recommendations extraction error: {str(e)}")
            return recommendations
    
    def _extract_section_content(self, text: str, section_name: str) -> str:
        """Extract content from a specific section"""
        try:
            # Pattern to find section
            pattern = rf'({section_name}[^#]*?)(?=##|\Z)'
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            
            if match:
                return match.group(1).strip()
            
            return ""
            
        except Exception as e:
            logging.error(f"Section content extraction error: {str(e)}")
            return ""
    
    def format_timeline(self, analysis_text: str) -> Dict[str, str]:
        """Extract and format improvement timeline"""
        timeline = {}
        
        try:
            # Extract timeline sections
            timeline_section = self._extract_section_content(analysis_text, 'REALISTIC IMPROVEMENT TIMELINE')
            
            if timeline_section:
                # Extract week/month sections
                week_pattern = r'(Week \d+-\d+[^#]*?)(?=Week|\n\n|\Z)'
                month_pattern = r'(Month \d+[^#]*?)(?=Month|\n\n|\Z)'
                
                week_matches = re.findall(week_pattern, timeline_section, re.IGNORECASE | re.DOTALL)
                month_matches = re.findall(month_pattern, timeline_section, re.IGNORECASE | re.DOTALL)
                
                for match in week_matches:
                    timeline[match.split(':')[0].strip()] = match.split(':', 1)[1].strip()
                
                for match in month_matches:
                    timeline[match.split(':')[0].strip()] = match.split(':', 1)[1].strip()
            
            return timeline
            
        except Exception as e:
            logging.error(f"Timeline extraction error: {str(e)}")
            return {}
    
    def validate_analysis_structure(self, analysis_text: str) -> Dict[str, bool]:
        """Validate analysis structure and completeness"""
        validation = {
            'has_executive_summary': False,
            'has_problem_identification': False,
            'has_product_recommendations': False,
            'has_timeline': False,
            'has_lifestyle_integration': False,
            'has_safety_protocols': False,
            'has_coordinates': False,
            'proper_formatting': False
        }
        
        try:
            # Check for required sections
            required_sections = [
                'Executive Summary',
                'Problem Identification',
                'Product Recommendations',
                'Improvement Timeline',
                'Lifestyle Integration',
                'Safety Protocols'
            ]
            
            for section in required_sections:
                if section.lower() in analysis_text.lower():
                    validation[f'has_{section.lower().replace(" ", "_")}'] = True
            
            # Check for coordinates
            coordinate_pattern = r'\[([A-Z_]+),\s*([A-Z_]+),\s*(\d+),\s*(\d+)\]'
            if re.search(coordinate_pattern, analysis_text):
                validation['has_coordinates'] = True
            
            # Check for proper formatting
            bullet_count = len(re.findall(r'•', analysis_text))
            if bullet_count >= 10:  # Expect at least 10 bullet points
                validation['proper_formatting'] = True
            
            return validation
            
        except Exception as e:
            logging.error(f"Analysis structure validation error: {str(e)}")
            return validation
    
    def get_analysis_quality_score(self, analysis_text: str) -> float:
        """Calculate overall analysis quality score"""
        try:
            validation = self.validate_analysis_structure(analysis_text)
            
            # Calculate score based on validation results
            section_score = sum(validation.values()) / len(validation)
            
            # Additional quality factors
            word_count = len(analysis_text.split())
            word_score = min(1.0, word_count / 1000)  # Expect at least 1000 words
            
            bullet_count = len(re.findall(r'•', analysis_text))
            bullet_score = min(1.0, bullet_count / 15)  # Expect at least 15 bullet points
            
            coordinate_count = len(re.findall(r'\[([A-Z_]+),\s*([A-Z_]+),\s*(\d+),\s*(\d+)\]', analysis_text))
            coordinate_score = min(1.0, coordinate_count / 4)  # Expect at least 4 coordinates
            
            # Calculate overall score
            overall_score = (
                section_score * 0.4 +
                word_score * 0.2 +
                bullet_score * 0.2 +
                coordinate_score * 0.2
            )
            
            return min(1.0, overall_score)
            
        except Exception as e:
            logging.error(f"Quality score calculation error: {str(e)}")
            return 0.0
