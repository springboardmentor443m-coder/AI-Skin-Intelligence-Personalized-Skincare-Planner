"""
Professional UI Components for SkinAI Analyzer
Streamlit components with proper formatting and styling
"""

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from typing import Dict, List, Any, Optional
import logging
import re

from config.settings import Config, UIConfig, AnalysisConfig

class UIComponents:
    """Professional UI components for skincare analysis display"""
    
    def __init__(self):
        self.ui_config = UIConfig()
        self.analysis_config = AnalysisConfig()
        
        logging.info("UI Components initialized")
    
    def render_header(self):
        """Render application header with branding"""
        st.markdown(f"""
        <div class="header-container">
            <h1>{Config.APP_TITLE}</h1>
            <h3>World's Most Advanced AI-Powered Skincare Analysis System</h3>
            <div class="mediapipe-badge">
                🎯 MediaPipe Enabled | 🔬 478 Landmarks | 🎨 Surgical Accuracy
            </div>
        </div>
        """, unsafe_allow_html=True)
    
    def render_metrics(self, analysis_results: Dict[str, Any]):
        """Render analysis metrics in a professional layout"""
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            health_score = self._extract_health_score(analysis_results.get('analysis', ''))
            st.markdown(f'''
            <div class="metric-container">
                <h3>Health Score</h3>
                <h2 style="color: {self._get_score_color(health_score)}">{health_score}/100</h2>
            </div>
            ''', unsafe_allow_html=True)
        
        with col2:
            total_coords = analysis_results.get('total_coordinates', 0)
            st.markdown(f'''
            <div class="metric-container">
                <h3>Issues Found</h3>
                <h2 style="color: {self._get_issue_color(total_coords)}">{total_coords}</h2>
            </div>
            ''', unsafe_allow_html=True)
        
        with col3:
            precision = "High" if analysis_results.get('landmark_data') else "Medium"
            st.markdown(f'''
            <div class="metric-container">
                <h3>Precision</h3>
                <h2 style="color: {self.ui_config.SUCCESS_COLOR}">{precision}</h2>
            </div>
            ''', unsafe_allow_html=True)
        
        with col4:
            model_name = analysis_results.get('model_used', 'Unknown').split('/')[-1]
            st.markdown(f'''
            <div class="metric-container">
                <h3>Model Used</h3>
                <h2 style="color: {self.ui_config.PRIMARY_COLOR}">{model_name}</h2>
            </div>
            ''', unsafe_allow_html=True)
    
    def render_analysis_sections(self, analysis_text: str):
        """Render analysis text in properly formatted sections"""
        if not analysis_text or len(analysis_text.strip()) < 10:
            st.warning("⚠️ Analysis text is empty or too short")
            return
            
        sections = self._parse_analysis_sections(analysis_text)
        
        # Debug: Show what sections were found
        if not sections:
            st.warning("⚠️ No sections found in analysis. Attempting to format raw text:")
            # Try to format the raw text better
            formatted_raw = self._format_raw_analysis(analysis_text)
            st.markdown(formatted_raw, unsafe_allow_html=True)
            return
        
        st.success(f"✅ Found {len(sections)} analysis sections")
        
        for i, (section_name, section_content) in enumerate(sections.items()):
            icon = self.analysis_config.SECTION_ICONS.get(section_name, "📋")
            
            with st.expander(f"{icon} {section_name}", expanded=(i == 0)):
                # Clean and format section content
                formatted_content = self._format_section_content(section_content)
                st.markdown(f'<div class="analysis-card">{formatted_content}</div>', 
                           unsafe_allow_html=True)
    
    def render_coordinate_legend(self, coordinates: List[Dict[str, Any]]):
        """Render coordinate legend with issue details"""
        if not coordinates:
            st.info("No issues detected in the analysis.")
            return
        
        st.markdown("### 🎯 Problem Locations")
        
        # Create legend DataFrame
        legend_data = []
        for i, coord in enumerate(coordinates, 1):
            # Handle both old format (x, y) and new format (landmark_index)
            if 'landmark_index' in coord:
                location = f"Landmark {coord['landmark_index']}"
                issue_type = coord.get('condition', 'UNKNOWN').replace('_', ' ').title()
                confidence = f"{coord.get('confidence', 0.5):.1f}"
            else:
                location = f"({coord.get('x', 0)}, {coord.get('y', 0)})"
                issue_type = coord.get('issue', 'GENERAL').replace('_', ' ').title()
                confidence = coord.get('confidence', 'high').title()
            
            legend_data.append({
                'ID': i,
                'Issue Type': issue_type,
                'Region': coord.get('region', 'UNKNOWN').replace('_', ' ').title(),
                'Location': location,
                'Confidence': confidence
            })
        
        legend_df = pd.DataFrame(legend_data)
        st.dataframe(legend_df, width='stretch')
    
    def render_mediapipe_details(self, landmark_data: Optional[Dict[str, Any]]):
        """Render MediaPipe technical details"""
        if not landmark_data:
            return
        
        with st.expander("🔬 MediaPipe Technical Details"):
            st.markdown("**Facial Landmark Detection Results:**")
            
            col1, col2 = st.columns(2)
            
            with col1:
                st.metric("Total Landmarks", f"{landmark_data.get('total_landmarks', 0)}/478")
                st.metric("Face Confidence", f"{landmark_data.get('confidence', 0):.2f}")
                st.metric("Face Orientation", landmark_data.get('face_orientation', 'Unknown'))
            
            with col2:
                img_dims = landmark_data.get('image_dimensions', (0, 0))
                st.metric("Image Dimensions", f"{img_dims[0]}x{img_dims[1]}")
                st.metric("Detected Regions", len(landmark_data.get('region_centers', {})))
                quality = landmark_data.get('quality_metrics', {}).get('overall_quality', 0)
                st.metric("Overall Quality", f"{quality:.2f}")
            
            # Region centers
            if landmark_data.get('region_centers'):
                st.markdown("**Precise Region Centers:**")
                region_data = []
                for region, center in landmark_data['region_centers'].items():
                    region_data.append({
                        'Region': region.replace('_', ' ').title(),
                        'X Coordinate': center[0],
                        'Y Coordinate': center[1]
                    })
                
                region_df = pd.DataFrame(region_data)
                st.dataframe(region_df, width='stretch')
    
    def render_progress_tracker(self, progress: int, message: str):
        """Render progress tracking"""
        progress_bar = st.progress(progress / 100)
        status_text = st.empty()
        status_text.text(f"⚡ {message}")
        return progress_bar, status_text
    
    def render_user_profile_form(self) -> Dict[str, Any]:
        """Render comprehensive user profile form"""
        st.sidebar.markdown("## 👤 Personal Information")
        
        # Basic Demographics
        age_range = st.sidebar.selectbox(
            "Age Range", 
            ["18-22", "23-27", "28-32", "33-37", "38-42", "43-47", "48-52", "53+"],
            index=1  # Default to 23-27
        )
        
        gender = st.sidebar.selectbox(
            "Gender", 
            ["Female", "Male", "Non-binary", "Prefer not to say"]
        )
        
        ethnicity = st.sidebar.multiselect(
            "Ethnicity", 
            ["Indian", "South Asian", "East Asian", "Southeast Asian", "Caucasian", 
             "African", "Hispanic", "Middle Eastern", "Mixed"], 
            default=Config.DEFAULT_ETHNICITY
        )
        
        skin_type = st.sidebar.multiselect(
            "Skin Type", 
            ["Oily", "Dry", "Combination", "Sensitive", "Normal", "Mature"], 
            default=Config.DEFAULT_SKIN_TYPE
        )
        
        # Current Skin Concerns
        st.sidebar.markdown("### 🎯 Current Skin Concerns")
        primary_concerns = st.sidebar.multiselect(
            "Primary Concerns",
            ["Acne", "Dark Spots", "Melasma", "Wrinkles", "Fine Lines", "Large Pores", 
             "Dark Circles", "Redness", "Texture Issues", "Dullness", "Uneven Tone", 
             "Scars", "Blackheads", "Whiteheads", "None"],
            default=["None"]
        )
        
        concern_duration = st.sidebar.selectbox(
            "How long have you had these concerns?",
            ["Less than 3 months", "3-6 months", "6-12 months", "1-2 years", "More than 2 years"]
        )
        
        # Lifestyle Factors
        st.sidebar.markdown("### 🌟 Lifestyle Factors")
        sleep_quality = st.sidebar.slider("Sleep Quality (1-10)", 1, 10, 7)
        stress_level = st.sidebar.slider("Stress Level (1-10)", 1, 10, 5)
        water_intake = st.sidebar.slider("Daily Water Intake (glasses)", 1, 15, 8)
        exercise_frequency = st.sidebar.selectbox(
            "Exercise Frequency",
            ["Never", "1-2 times/week", "3-4 times/week", "5-6 times/week", "Daily"]
        )
        
        # Environment
        st.sidebar.markdown("### 🌍 Environment")
        climate = st.sidebar.selectbox(
            "Climate",
            ["Tropical", "Temperate", "Cold", "Dry", "Humid", "Polluted"]
        )
        
        sun_exposure = st.sidebar.selectbox(
            "Daily Sun Exposure",
            ["Minimal (mostly indoors)", "Moderate (1-2 hours)", "High (3+ hours)", "Very High (5+ hours)"]
        )
        
        # Current Routine
        st.sidebar.markdown("### 🧴 Current Routine")
        current_products = st.sidebar.text_area(
            "Current Skincare Products (optional)",
            placeholder="List your current products..."
        )
        
        budget = st.sidebar.selectbox(
            "Monthly Skincare Budget",
            ["Under ₹500", "₹500-1000", "₹1000-2000", "₹2000-5000", "Above ₹5000"]
        )
        
        return {
            'age_range': age_range,
            'gender': gender,
            'ethnicity': ethnicity,
            'skin_type': skin_type,
            'primary_concerns': primary_concerns,
            'concern_duration': concern_duration,
            'sleep_quality': sleep_quality,
            'stress_level': stress_level,
            'water_intake': water_intake,
            'exercise_frequency': exercise_frequency,
            'climate': climate,
            'sun_exposure': sun_exposure,
            'current_products': current_products,
            'budget': budget
        }
    
    def render_analysis_quality_metrics(self, analysis_results: Dict[str, Any]):
        """Render analysis quality metrics"""
        quality_metrics = analysis_results.get('analysis_quality', {})
        
        if not quality_metrics:
            return
        
        with st.expander("📊 Analysis Quality Metrics"):
            col1, col2, col3 = st.columns(3)
            
            with col1:
                completeness = quality_metrics.get('completeness', 0)
                st.metric("Completeness", f"{completeness:.1%}")
            
            with col2:
                structure = quality_metrics.get('structure', 0)
                st.metric("Structure Quality", f"{structure:.1%}")
            
            with col3:
                detail_level = quality_metrics.get('detail_level', 0)
                st.metric("Detail Level", f"{detail_level:.1%}")
            
            # Overall quality gauge
            overall_quality = quality_metrics.get('overall_quality', 0)
            
            fig = go.Figure(go.Indicator(
                mode = "gauge+number+delta",
                value = overall_quality * 100,
                domain = {'x': [0, 1], 'y': [0, 1]},
                title = {'text': "Overall Analysis Quality"},
                delta = {'reference': 80},
                gauge = {
                    'axis': {'range': [None, 100]},
                    'bar': {'color': "darkblue"},
                    'steps': [
                        {'range': [0, 50], 'color': "lightgray"},
                        {'range': [50, 80], 'color': "yellow"},
                        {'range': [80, 100], 'color': "green"}
                    ],
                    'threshold': {
                        'line': {'color': "red", 'width': 4},
                        'thickness': 0.75,
                        'value': 90
                    }
                }
            ))
            
            fig.update_layout(height=300)
            st.plotly_chart(fig, width='stretch')
    
    def _extract_health_score(self, analysis_text: str) -> int:
        """Extract health score from analysis text"""
        import re
        match = re.search(r'(\d+)/100', analysis_text)
        return int(match.group(1)) if match else 75
    
    def _get_score_color(self, score: int) -> str:
        """Get color based on health score"""
        if score >= 80:
            return self.ui_config.SUCCESS_COLOR
        elif score >= 60:
            return self.ui_config.WARNING_COLOR
        else:
            return self.ui_config.ERROR_COLOR
    
    def _get_issue_color(self, count: int) -> str:
        """Get color based on issue count"""
        if count == 0:
            return self.ui_config.SUCCESS_COLOR
        elif count <= 3:
            return self.ui_config.WARNING_COLOR
        else:
            return self.ui_config.ERROR_COLOR
    
    def _parse_analysis_sections(self, analysis_text: str) -> Dict[str, str]:
        """Parse analysis text into sections"""
        sections = {}
        
        # Use focused pattern matching - prioritize numbered sections
        # First try numbered sections with ### or ##
        numbered_pattern = r'(###|##)\s*(\d+\.\s*[^#\n]+)'
        numbered_matches = list(re.finditer(numbered_pattern, analysis_text))
        
        if numbered_matches:
            # Use numbered sections
            unique_starts = [(match.start(), match.group(2).strip()) for match in numbered_matches]
        else:
            # Fallback to any header pattern
            fallback_patterns = [
                r'###\s*([^#\n]+)',          # ### EXECUTIVE SUMMARY
                r'##\s*([^#\n]+)',           # ## EXECUTIVE SUMMARY
                r'\*\*([A-Z][^*]+)\*\*'      # **EXECUTIVE SUMMARY**
            ]
            
            unique_starts = []
            for pattern in fallback_patterns:
                matches = re.finditer(pattern, analysis_text)
                for match in matches:
                    title = match.group(1).strip().strip(':')
                    # Only add if it looks like a section header (contains key words)
                    if any(keyword in title.upper() for keyword in ['SUMMARY', 'PROBLEM', 'PRODUCT', 'ROUTINE', 'TIMELINE', 'LIFESTYLE', 'SAFETY']):
                        unique_starts.append((match.start(), title))
                if unique_starts:  # Stop after first pattern that finds sections
                    break
        
        # Extract section content
        for i, (start, title) in enumerate(unique_starts):
            end = unique_starts[i + 1][0] if i + 1 < len(unique_starts) else len(analysis_text)
            content = analysis_text[start:end].strip()
            
            # Clean up title
            clean_title = re.sub(r'^\d+\.\s*', '', title).strip(':').strip()
            sections[clean_title] = content
        
        return sections
    
    def _format_section_content(self, content: str) -> str:
        """Format section content for display"""
        # Convert various bullet formats to consistent format
        content = re.sub(r'\*\s*', '• ', content)
        content = re.sub(r'-\s*', '• ', content)
        content = re.sub(r'\n\s*\n', '\n\n', content)
        
        # Convert bold text
        content = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', content)
        
        # Convert line breaks
        content = content.replace('\n', '<br>')
        
        return content
    
    def _format_raw_analysis(self, analysis_text: str) -> str:
        """Force unstructured text into clean, structured format"""
        
        # Extract key information from the wall of text
        health_score = re.search(r'Health Score[:\s]*(\d+)/100', analysis_text, re.IGNORECASE)
        health_score = health_score.group(1) if health_score else "65"
        
        # Extract concerns/conditions
        concerns = re.findall(r'\[(\d+),\s*([A-Z_]+),\s*(\d+),\s*([\d.]+)\]', analysis_text)
        top_concerns = concerns[:3] if concerns else []
        
        # Extract and enhance product mentions with detailed information
        products = []
        
        # Enhanced product database with detailed information
        product_database = {
            'Simple': {
                'full_name': 'Simple Kind to Skin Refreshing Facial Wash',
                'benefits': 'Gentle cleansing without stripping natural oils',
                'key_ingredients': 'Pro-Vitamin B5, Vitamin E',
                'where_to_buy': 'Nykaa, Amazon, Flipkart, Local pharmacies',
                'application': 'Massage onto wet face, rinse thoroughly'
            },
            'Minimalist.*Niacinamide': {
                'full_name': 'Minimalist 10% Niacinamide Face Serum',
                'benefits': 'Reduces oil production, minimizes pores, controls acne',
                'key_ingredients': '10% Niacinamide, 1% Zinc',
                'where_to_buy': 'Nykaa, Amazon, Brand website',
                'application': 'Apply 2-3 drops on clean face, morning & evening'
            },
            'Re\'equil.*SPF': {
                'full_name': 'Re\'equil Ultra Matte Dry Touch Sunscreen SPF 50',
                'benefits': 'Broad spectrum UV protection, matte finish, oil-free',
                'key_ingredients': 'Zinc Oxide, Titanium Dioxide',
                'where_to_buy': 'Nykaa, Amazon, 1mg, Pharmacy',
                'application': 'Apply liberally 15 mins before sun exposure, reapply every 2-3 hours'
            },
            'Cetaphil': {
                'full_name': 'Cetaphil Daily Advance Ultra Hydrating Lotion',
                'benefits': 'Deep hydration, strengthens skin barrier, non-comedogenic',
                'key_ingredients': 'Ceramides, Hyaluronic Acid, Dimethicone',
                'where_to_buy': 'Nykaa, Amazon, Medical stores, Pharmacy',
                'application': 'Apply generously on face and neck, morning & evening'
            },
            'The Ordinary': {
                'full_name': 'The Ordinary Alpha Arbutin 2% + HA',
                'benefits': 'Reduces hyperpigmentation, brightens skin tone, hydrates',
                'key_ingredients': '2% Alpha Arbutin, Hyaluronic Acid',
                'where_to_buy': 'Nykaa, Sephora, Cult Beauty (online)',
                'application': 'Apply few drops to clean skin, follow with moisturizer'
            }
        }
        
        # Enhanced pattern matching with detailed extraction
        for brand_pattern, details in product_database.items():
            pattern = f'{brand_pattern}.*?₹(\d+[-\d]*)'
            match = re.search(pattern, analysis_text, re.IGNORECASE)
            if match:
                price = match.group(1)
                product_info = f"""• **{details['full_name']}**
  💰 **Price**: ₹{price}
  ✨ **Benefits**: {details['benefits']}
  🧪 **Key Ingredients**: {details['key_ingredients']}
  🛒 **Where to Buy**: {details['where_to_buy']}
  📝 **How to Use**: {details['application']}
"""
                products.append(product_info)
        
        # If no specific products found, parse the wall of text format
        if not products:
            # Parse the current wall of text format with emojis
            product_pattern = r'•\s*([^💰]+?)💰[^₹]*₹(\d+).*?✨[^:]*:\s*([^🧪]*?)🧪[^:]*:\s*([^🛒]*?)🛒[^:]*:\s*([^📝]*?)📝[^:]*:\s*([^•]+?)(?=•|$)'
            matches = re.findall(product_pattern, analysis_text, re.DOTALL)
            
            for match in matches:
                product_name, price, benefits, ingredients, where_to_buy, how_to_use = match
                clean_name = product_name.strip()
                clean_benefits = benefits.strip()
                clean_ingredients = ingredients.strip()
                clean_where = where_to_buy.strip()
                clean_usage = how_to_use.strip()
                
                product_info = f"""• **{clean_name}**
  💰 **Price**: ₹{price}
  ✨ **Benefits**: {clean_benefits}
  🧪 **Key Ingredients**: {clean_ingredients}
  🛒 **Where to Buy**: {clean_where}
  📝 **How to Use**: {clean_usage}
"""
                products.append(product_info)
            
            # Fallback: simple product extraction if complex parsing fails
            if not products:
                # Split by bullet points and extract product info
                product_lines = analysis_text.split('•')
                for line in product_lines[1:6]:  # Skip first empty split, take max 5 products
                    if '💰' in line and '₹' in line:
                        # Find the product name (text before 💰)
                        parts = line.split('💰')
                        if len(parts) >= 2:
                            clean_name = parts[0].strip()
                            
                            # Extract price
                            price_match = re.search(r'₹(\d+)', line)
                            price = price_match.group(1) if price_match else "N/A"
                            
                            # Extract benefits (text after ✨ Benefits:)
                            benefits = "As recommended for your skin type"
                            if '✨' in line:
                                benefits_parts = line.split('✨')
                                if len(benefits_parts) > 1:
                                    benefits_text = benefits_parts[1]
                                    if ':' in benefits_text:
                                        benefits_content = benefits_text.split(':')[1]
                                        # Get text until next emoji or end
                                        benefits_clean = benefits_content.split('🧪')[0].split('🛒')[0].split('📝')[0].strip()
                                        if benefits_clean:
                                            benefits = benefits_clean
                            
                            # Extract where to buy
                            where = "Available online and in stores"
                            if '🛒' in line:
                                where_parts = line.split('🛒')
                                if len(where_parts) > 1:
                                    where_text = where_parts[1]
                                    if ':' in where_text:
                                        where_content = where_text.split(':')[1]
                                        where_clean = where_content.split('📝')[0].split('💰')[0].strip()
                                        if where_clean:
                                            where = where_clean
                            
                            product_info = f"""• **{clean_name}**
  💰 **Price**: ₹{price}
  ✨ **Benefits**: {benefits}
  🛒 **Where to Buy**: {where}
"""
                            products.append(product_info)
        
        # Only create output if we have real data
        if not top_concerns and not products:
            # Return the original text with basic cleanup if no structured data found
            formatted = analysis_text.replace('•', '').replace('#', '').strip()
            return formatted
        
        # Create structured output with real data only
        formatted = f"""## 📊 EXECUTIVE SUMMARY

**Health Score**: {health_score}/100
"""
        
        if top_concerns:
            formatted += f"""
**Top Priority Concerns**:
{chr(10).join([f"• **{concern[1].replace('_', ' ').title()}**: Severity {concern[2]}/5" for concern in top_concerns])}
"""
        
        # Extract skin type and ethnicity from text if available
        skin_type_match = re.search(r'Skin Type[:\s]*([^•\n]+)', analysis_text, re.IGNORECASE)
        ethnicity_match = re.search(r'Ethnicity[:\s]*([^•\n]+)', analysis_text, re.IGNORECASE)
        
        if skin_type_match:
            formatted += f"\n**Skin Type**: {skin_type_match.group(1).strip()}"
        if ethnicity_match:
            formatted += f"\n**Ethnicity**: {ethnicity_match.group(1).strip()}"
        
        formatted += "\n**Immediate Action**: Sun protection + targeted treatments\n"
        
        if top_concerns:
            formatted += f"""
## 🔍 DETAILED PROBLEM IDENTIFICATION

{chr(10).join([f"• **{concern[1].replace('_', ' ').title()}** `[{concern[0]}, {concern[1]}, {concern[2]}, {concern[3]}]`: Visible on face requiring treatment" for concern in top_concerns])}
"""
        
        if products:
            formatted += f"""
## 🧴 COMPREHENSIVE PRODUCT RECOMMENDATIONS

**💎 CURATED BEAUTY ESSENTIALS FOR YOUR SKIN TYPE**

{chr(10).join(products)}

**🔬 EXPERT NOTES:**
• All products are dermatologist-recommended and suitable for Indian skin
• Patch test each product 24-48 hours before full application
• Introduce one new product at a time to monitor skin response
• Results typically visible within 2-4 weeks of consistent use

**💡 PRO TIPS:**
• Buy from authorized retailers to ensure authenticity
• Check expiry dates and store products in cool, dry places
• Follow the recommended application order for maximum effectiveness
"""
        
        # Extract routine information if available
        morning_routine = re.search(r'MORNING[:\s]*([^#]*?)(?=EVENING|$)', analysis_text, re.IGNORECASE | re.DOTALL)
        evening_routine = re.search(r'EVENING[:\s]*([^#]*?)(?=\d+\.|$)', analysis_text, re.IGNORECASE | re.DOTALL)
        
        if morning_routine or evening_routine:
            formatted += "\n## 🗓️ DAILY ROUTINE\n"
            if morning_routine:
                routine_text = morning_routine.group(1).strip()
                formatted += f"\n**MORNING**:\n{routine_text}\n"
            if evening_routine:
                routine_text = evening_routine.group(1).strip()
                formatted += f"\n**EVENING**:\n{routine_text}\n"
        
        return formatted.strip()
