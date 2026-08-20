"""
SkinAI Analyzer - World's Most Advanced AI-Powered Skincare Analysis System
Complete rebuild with modular architecture and surgical precision
"""

import streamlit as st
import logging
from typing import Dict, Any, Optional
import os

# Import our custom modules
from config.settings import Config, UIConfig
from core.mediapipe_analyzer import MediaPipeFaceAnalyzer
from core.image_processor import ImageProcessor
from core.ai_engine import AIEngine
from visualization.annotator import VisualAnnotator
from visualization.ui_components import UIComponents
from utils.coordinate_parser import CoordinateParser
from utils.formatters import TextFormatter

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SkinAIAnalyzer:
    """Main SkinAI Analyzer application class"""
    
    def __init__(self):
        self.config = Config()
        self.ui_config = UIConfig()
        
        # Initialize components
        self.mediapipe_analyzer = MediaPipeFaceAnalyzer()
        self.image_processor = ImageProcessor()
        self.ai_engine = AIEngine()
        self.visual_annotator = VisualAnnotator()
        self.ui_components = UIComponents()
        self.coordinate_parser = CoordinateParser()
        self.text_formatter = TextFormatter()
        
        logger.info("SkinAI Analyzer initialized successfully")
    
    def run(self):
        """Run the main application"""
        # Page configuration
        st.set_page_config(
            page_title=Config.APP_TITLE,
            page_icon=Config.APP_ICON,
            layout=Config.PAGE_LAYOUT,
            initial_sidebar_state="expanded"
        )
        
        # Load custom CSS
        self._load_custom_css()
        
        # Render header
        self.ui_components.render_header()
        
        # Render user profile form
        user_context = self.ui_components.render_user_profile_form()
        
        # Main content
        st.markdown("## 📸 Upload Your Photo")
        st.markdown("**Please upload a clear, well-lit facial photo for ultra-detailed analysis**")
        
        uploaded_file = st.file_uploader(
            "Choose a facial photo",
            type=['jpg', 'jpeg', 'png', 'webp'],
            help="For best results: Use natural lighting, face the camera directly, remove glasses if possible"
        )
        
        if uploaded_file is not None:
            # Process uploaded image
            self._process_uploaded_image(uploaded_file, user_context)
    
    def _load_custom_css(self):
        """Load custom CSS for professional styling"""
        st.markdown(f"""
        <style>
        .main {{
            padding-top: 1rem;
            background-color: {self.ui_config.BG_PRIMARY};
            color: {self.ui_config.TEXT_PRIMARY} !important;
        }}
        .stApp {{
            background: linear-gradient(135deg, {self.ui_config.BG_GRADIENT_START} 0%, {self.ui_config.BG_GRADIENT_END} 100%);
            color: {self.ui_config.TEXT_PRIMARY} !important;
        }}
        .header-container {{
            background: linear-gradient(90deg, {self.ui_config.PRIMARY_COLOR} 0%, {self.ui_config.SECONDARY_COLOR} 100%);
            padding: {self.ui_config.PADDING_LARGE};
            border-radius: {self.ui_config.BORDER_RADIUS};
            color: {self.ui_config.TEXT_WHITE} !important;
            text-align: center;
            margin-bottom: {self.ui_config.MARGIN_LARGE};
            box-shadow: {self.ui_config.HEADER_SHADOW};
        }}
        .mediapipe-badge {{
            background: linear-gradient(45deg, {self.ui_config.WARNING_COLOR}, {self.ui_config.SUCCESS_COLOR});
            color: {self.ui_config.TEXT_WHITE} !important;
            padding: {self.ui_config.PADDING_SMALL} {self.ui_config.PADDING_MEDIUM};
            border-radius: 20px;
            font-weight: bold;
            display: inline-block;
            margin: {self.ui_config.MARGIN_SMALL};
        }}
        .analysis-card {{
            background: {self.ui_config.BG_PRIMARY} !important;
            padding: 1.5rem;
            border-radius: {self.ui_config.BORDER_RADIUS};
            box-shadow: {self.ui_config.SHADOW};
            margin-bottom: {self.ui_config.MARGIN_MEDIUM};
            color: {self.ui_config.TEXT_PRIMARY} !important;
            border: 1px solid #e0e0e0;
        }}
        
        /* FIXED: All Streamlit components visibility */
        .stSelectbox > div > div > div {{
            background-color: {self.ui_config.BG_PRIMARY} !important;
            color: {self.ui_config.TEXT_PRIMARY} !important;
            border: 2px solid #ccc !important;
        }}
        .stMultiSelect > div > div > div {{
            background-color: {self.ui_config.BG_PRIMARY} !important;
            color: {self.ui_config.TEXT_PRIMARY} !important;
            border: 2px solid #ccc !important;
        }}
        .stSlider > div > div > div > div {{
            background-color: {self.ui_config.BG_PRIMARY} !important;
            color: {self.ui_config.TEXT_PRIMARY} !important;
        }}
        .stTextInput > div > div > input {{
            background-color: {self.ui_config.BG_PRIMARY} !important;
            color: {self.ui_config.TEXT_PRIMARY} !important;
            border: 2px solid #ccc !important;
        }}
        .stTextArea > div > div > textarea {{
            background-color: {self.ui_config.BG_PRIMARY} !important;
            color: {self.ui_config.TEXT_PRIMARY} !important;
            border: 2px solid #ccc !important;
        }}
        
        /* FIXED: Sidebar visibility */
        .css-1d391kg {{
            background-color: {self.ui_config.BG_PRIMARY} !important;
            color: {self.ui_config.TEXT_PRIMARY} !important;
        }}
        .sidebar-section {{
            background: {self.ui_config.BG_PRIMARY} !important;
            padding: {self.ui_config.PADDING_MEDIUM};
            border-radius: 10px;
            margin-bottom: {self.ui_config.MARGIN_MEDIUM};
            color: {self.ui_config.TEXT_PRIMARY} !important;
            border: 1px solid #e0e0e0;
        }}
        
        /* FIXED: Expander visibility */
        .streamlit-expanderHeader {{
            background-color: {self.ui_config.BG_PRIMARY} !important;
            color: {self.ui_config.TEXT_PRIMARY} !important;
            border: 1px solid #e0e0e0 !important;
        }}
        .streamlit-expanderContent {{
            background-color: {self.ui_config.BG_PRIMARY} !important;
            color: {self.ui_config.TEXT_PRIMARY} !important;
            border: 1px solid #e0e0e0 !important;
        }}
        
        /* FIXED: DataFrame visibility */
        .stDataFrame {{
            background-color: {self.ui_config.BG_PRIMARY} !important;
            color: {self.ui_config.TEXT_PRIMARY} !important;
        }}
        .stDataFrame table {{
            background-color: {self.ui_config.BG_PRIMARY} !important;
            color: {self.ui_config.TEXT_PRIMARY} !important;
        }}
        .stDataFrame th {{
            background-color: {self.ui_config.BG_SECONDARY} !important;
            color: {self.ui_config.TEXT_PRIMARY} !important;
            border: 1px solid #dee2e6 !important;
        }}
        .stDataFrame td {{
            background-color: {self.ui_config.BG_PRIMARY} !important;
            color: {self.ui_config.TEXT_PRIMARY} !important;
            border: 1px solid #dee2e6 !important;
        }}
        
        /* FIXED: Metric visibility */
        .metric-container {{
            background-color: {self.ui_config.BG_PRIMARY} !important;
            color: {self.ui_config.TEXT_PRIMARY} !important;
            border: 1px solid #e0e0e0;
            padding: {self.ui_config.PADDING_MEDIUM};
            border-radius: 8px;
        }}
        </style>
        """, unsafe_allow_html=True)
    
    def _process_uploaded_image(self, uploaded_file, user_context: Dict[str, Any]):
        """Process uploaded image and run analysis"""
        try:
            from PIL import Image
            
            # Load image
            image = Image.open(uploaded_file)
            
            # Display original image
            col1, col2 = st.columns(2)
            with col1:
                st.markdown("### Original Image")
                st.image(image, width=400)
            
            # Analysis button
            if st.button("🔬 Start Ultra-Detailed Analysis", type="primary", use_container_width=True):
                # Check API key
                if not self.ai_engine.validate_api_key():
                    st.error("❌ API key not found! Please set OPENROUTER_API_KEY in your .env file")
                    st.info("Create a .env file with: OPENROUTER_API_KEY=your_api_key_here")
                    return
                
                # Run analysis
                self._run_analysis(image, user_context)
    
        except Exception as e:
            st.error(f"❌ Image processing error: {str(e)}")
            logger.error(f"Image processing error: {str(e)}")
    
    def _run_analysis(self, image, user_context: Dict[str, Any]):
        """Run complete analysis pipeline"""
        try:
            # Progress tracking
            progress_bar, status_text = self.ui_components.render_progress_tracker(0, "Starting analysis...")
            
            def progress_callback(percentage: int, message: str):
                progress_bar.progress(percentage / 100)
                status_text.text(f"⚡ {message}")
            
            # Step 1: Image validation and preprocessing
            progress_callback(10, "Validating and preprocessing image...")
            validation_result = self.image_processor.validate_image(image)
            processed_image = self.image_processor.optimize_for_analysis(image)
            
            if not validation_result['valid']:
                st.error("❌ Image validation failed!")
                for error in validation_result['errors']:
                    st.error(f"• {error}")
                return
            
            # Show validation warnings if any
            if validation_result['warnings']:
                for warning in validation_result['warnings']:
                    st.warning(f"⚠️ {warning}")
            
            # Step 2: MediaPipe landmark detection
            progress_callback(20, "Detecting facial landmarks with MediaPipe...")
            landmark_data = self.mediapipe_analyzer.detect_face_landmarks(processed_image)
            
            if landmark_data:
                st.success(f"✅ Face detected with {landmark_data['total_landmarks']}/478 landmarks")
            else:
                st.warning("⚠️ No face detected. Analysis will use fallback methods.")
            
            # Step 3: AI Analysis
            progress_callback(30, "Running AI analysis...")
            analysis_results = self.ai_engine.analyze_image(
                processed_image, landmark_data, self._format_user_context(user_context), progress_callback
            )
            
            # Step 4: Display results
            progress_callback(90, "Formatting results...")
            self._display_analysis_results(analysis_results, processed_image)
            
            # Clear progress
            progress_bar.empty()
            status_text.empty()
            
            st.success("🎉 Analysis complete!")
            
        except Exception as e:
            st.error(f"❌ Analysis failed: {str(e)}")
            logger.error(f"Analysis error: {str(e)}")
    
    def _display_analysis_results(self, analysis_results: Dict[str, Any], original_image):
        """Display analysis results in professional format"""
        try:
            # Display metrics
            self.ui_components.render_metrics(analysis_results)
            
            # Display annotated image
            if analysis_results['coordinates']:
                annotated_image = self.visual_annotator.create_annotated_image(
                    original_image, analysis_results['coordinates'], analysis_results.get('landmark_data')
                )
                
                col1, col2 = st.columns(2)
                with col1:
                    st.markdown("### Original Image")
                    st.image(original_image, width=400)
                
                with col2:
                    st.markdown("### Enhanced Analysis")
                    st.image(annotated_image, width=400)
                
                # Display coordinate legend
                self.ui_components.render_coordinate_legend(analysis_results['coordinates'])
            
            # Display analysis sections
            st.markdown("### 📋 Detailed Analysis Report")
            formatted_analysis = self.text_formatter.format_analysis_text(analysis_results['analysis'])
            self.ui_components.render_analysis_sections(formatted_analysis)
            
            # Display MediaPipe details
            self.ui_components.render_mediapipe_details(analysis_results.get('landmark_data'))
            
            # Display analysis quality metrics
            self.ui_components.render_analysis_quality_metrics(analysis_results)
            
        except Exception as e:
            st.error(f"❌ Results display error: {str(e)}")
            logger.error(f"Results display error: {str(e)}")
    
    def _format_user_context(self, user_context: Dict[str, Any]) -> str:
        """Format user context for AI analysis"""
        context_parts = [
            "PERSONAL PROFILE:",
            f"- Age: {user_context.get('age_range', 'Not specified')}",
            f"- Gender: {user_context.get('gender', 'Not specified')}",
            f"- Ethnicity: {', '.join(user_context.get('ethnicity', ['Not specified']))}",
            f"- Skin Type: {', '.join(user_context.get('skin_type', ['Not specified']))}",
            "",
            "CURRENT CONCERNS:",
            f"- Primary Issues: {', '.join(user_context.get('primary_concerns', ['None']))}",
            f"- Duration: {user_context.get('concern_duration', 'Not specified')}",
            "",
            "LIFESTYLE:",
            f"- Sleep Quality: {user_context.get('sleep_quality', 'Not specified')}/10",
            f"- Stress Level: {user_context.get('stress_level', 'Not specified')}/10",
            f"- Water Intake: {user_context.get('water_intake', 'Not specified')} glasses/day",
            f"- Exercise: {user_context.get('exercise_frequency', 'Not specified')}",
            f"- Climate: {user_context.get('climate', 'Not specified')}",
            f"- Sun Exposure: {user_context.get('sun_exposure', 'Not specified')}",
            "",
            "CURRENT ROUTINE:",
            f"- Current Products: {user_context.get('current_products', 'None specified')}",
            f"- Budget: {user_context.get('budget', 'Not specified')}"
        ]
        
        return "\n".join(context_parts)

def main():
    """Main application entry point"""
    try:
        # Initialize and run the application
        app = SkinAIAnalyzer()
        app.run()
        
    except Exception as e:
        st.error(f"❌ Application error: {str(e)}")
        logger.error(f"Application error: {str(e)}")

if __name__ == "__main__":
    main()
