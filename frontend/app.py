import os
import json
import requests
import streamlit as st

# Page Configuration - Adaptable Native Theme
st.set_page_config(
    page_title="Twacha.ai | Intelligent Skincare Platform",
    page_icon="✨",
    layout="wide",
    initial_sidebar_state="expanded"
)

BACKEND_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:8000")

# Hide Streamlit Default Chrome Elements & Theme-Aware Styling
st.markdown("""
<style>
    /* Hide Streamlit Default Chrome Elements */
    #MainMenu {visibility: hidden;}
    .stDeployButton {display: none;}
    footer {visibility: hidden;}
    header {visibility: hidden;}

    /* Main Container Spacing */
    .block-container {
        padding-top: 1.5rem !important;
        padding-bottom: 3rem !important;
        max-width: 1200px !important;
    }

    /* Hero Banner Header */
    .hero-banner {
        border-radius: 16px;
        padding: 1.75rem;
        margin-bottom: 1.75rem;
        border: 1px solid rgba(128, 128, 128, 0.2);
        background: linear-gradient(135deg, rgba(45, 106, 79, 0.12) 0%, rgba(254, 252, 191, 0.25) 100%);
    }
    .hero-title {
        font-size: 2.2rem;
        font-weight: 800;
        margin: 0;
        letter-spacing: -0.02em;
    }
    .hero-subtitle {
        font-size: 1.05rem;
        margin-top: 0.4rem;
        margin-bottom: 0;
        opacity: 0.85;
    }

    /* Diagnostics Clinical Card */
    .clinical-diag-card {
        border-radius: 12px;
        padding: 1rem;
        border: 1px solid rgba(128, 128, 128, 0.18);
        margin-bottom: 0.75rem;
        background-color: rgba(128, 128, 128, 0.03);
    }

    /* E-Commerce Product Cards */
    .product-box {
        border-radius: 14px;
        padding: 1.25rem;
        border: 1px solid rgba(128, 128, 128, 0.2);
        margin-bottom: 1.25rem;
        box-shadow: 0 4px 14px rgba(0,0,0,0.03);
    }
    .dupe-box {
        border-radius: 10px;
        padding: 1rem;
        border: 1px solid rgba(128, 128, 128, 0.15);
        margin-bottom: 0.75rem;
        background-color: rgba(128, 128, 128, 0.04);
    }

    /* Routine Containers */
    .routine-box-am {
        border-left: 4px solid #DD6B20;
        border-radius: 10px;
        padding: 1.25rem;
        margin-bottom: 1rem;
        border-top: 1px solid rgba(128, 128, 128, 0.15);
        border-right: 1px solid rgba(128, 128, 128, 0.15);
        border-bottom: 1px solid rgba(128, 128, 128, 0.15);
    }
    .routine-box-pm {
        border-left: 4px solid #2D6A4F;
        border-radius: 10px;
        padding: 1.25rem;
        margin-bottom: 1rem;
        border-top: 1px solid rgba(128, 128, 128, 0.15);
        border-right: 1px solid rgba(128, 128, 128, 0.15);
        border-bottom: 1px solid rgba(128, 128, 128, 0.15);
    }

    /* Badges */
    .badge-pill {
        padding: 4px 12px;
        border-radius: 20px;
        font-weight: 600;
        font-size: 0.82rem;
        display: inline-block;
    }
    .badge-savings {
        background-color: #C6F6D5;
        color: #22543D;
        font-weight: 700;
        font-size: 0.8rem;
        padding: 4px 10px;
        border-radius: 20px;
    }
</style>
""", unsafe_allow_html=True)

# Session State Setup
if "user_id" not in st.session_state:
    st.session_state.user_id = None
if "username" not in st.session_state:
    st.session_state.username = None
if "chat_messages" not in st.session_state:
    st.session_state.chat_messages = []
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []
if "profile" not in st.session_state:
    st.session_state.profile = {
        "age": 25,
        "gender": "Select Gender",
        "country": "",
        "budget": 50.0,
        "water_intake": 2.0,
        "sleep_hours": 7.0,
    }


# API Client Helpers
def api_register(username, password, profile):
    try:
        payload = {"username": username, "password": password, **profile}
        res = requests.post(f"{BACKEND_URL}/api/auth/register", json=payload, timeout=10)
        return res.json(), res.status_code == 200
    except Exception as e:
        return {"detail": f"Could not connect to backend: {str(e)}"}, False


def api_login(username, password):
    try:
        payload = {"username": username, "password": password}
        res = requests.post(f"{BACKEND_URL}/api/auth/login", json=payload, timeout=10)
        return res.json(), res.status_code == 200
    except Exception as e:
        return {"detail": f"Could not connect to backend: {str(e)}"}, False


def api_update_profile(user_id, profile):
    try:
        payload = {"user_id": user_id, **profile}
        res = requests.put(f"{BACKEND_URL}/api/user/profile", json=payload, timeout=10)
        return res.json(), res.status_code == 200
    except Exception as e:
        return {"detail": str(e)}, False


def api_upload_scan(user_id, file_bytes, filename, scan_type="baseline"):
    try:
        files = {"file": (filename, file_bytes, "image/jpeg")}
        data = {"user_id": user_id}
        endpoint = "baseline" if scan_type == "baseline" else "followup"
        res = requests.post(
            f"{BACKEND_URL}/api/scan/{endpoint}",
            data=data,
            files=files,
            timeout=120,
        )
        return res.json(), res.status_code == 200
    except Exception as e:
        return {"detail": str(e)}, False


def api_chat_dermatologist(user_id, message, messages):
    try:
        payload = {
            "user_id": user_id,
            "message": message,
            "messages": messages,
            "history": messages
        }
        res = requests.post(f"{BACKEND_URL}/api/chat/dermatologist", json=payload, timeout=120)
        return res.json(), res.status_code == 200
    except Exception as e:
        return {"reply": f"Connection issue: {str(e)}"}, False


def api_get_history(user_id):
    try:
        res = requests.get(f"{BACKEND_URL}/api/scans/{user_id}", timeout=10)
        return res.json(), res.status_code == 200
    except Exception as e:
        return {"scans": []}, False


def parse_routine_json(raw_routine) -> dict:
    """Parses JSON routine payload into Day 1..7 AM/PM mappings."""
    if isinstance(raw_routine, dict):
        return raw_routine

    try:
        if isinstance(raw_routine, str):
            clean_str = raw_routine.strip()
            if clean_str.startswith("```"):
                clean_str = clean_str.split("\n", 1)[1]
            if clean_str.endswith("```"):
                clean_str = clean_str.rsplit("```", 1)[0]
            parsed = json.loads(clean_str.strip())
            if isinstance(parsed, dict):
                return parsed
    except Exception:
        pass

    fallback_days = {}
    for d in range(1, 8):
        fallback_days[f"Day {d}"] = {
            "Morning": [
                "**Gentle AM Purification:** Wash face with a gentle hydrating cleanser.",
                "**Targeted Active Treatment:** Apply targeted serum for your focus area.",
                "**Broad-Spectrum Shield:** Apply broad-spectrum SPF 50 sunscreen."
            ],
            "Evening": [
                "**Double Cleansing Protocol:** Double cleanse to remove daily impurities.",
                "**Overnight Regenerative Care:** Apply night active treatment.",
                "**Moisture Barrier Lock:** Lock in hydration with repair cream."
            ]
        }
    return fallback_days


def render_routine_bullets(routine_item):
    """Renders routine steps as Markdown bullet points."""
    if isinstance(routine_item, list):
        for bullet in routine_item:
            st.markdown(f"- {bullet}")
    elif isinstance(routine_item, str):
        lines = [line.strip() for line in routine_item.split("\n") if line.strip()]
        for line in lines:
            if line.startswith("-") or line.startswith("*"):
                st.markdown(line)
            else:
                st.markdown(f"- {line}")
    else:
        st.markdown("- Apply recommended product as directed.")


# --- SIDEBAR & USER PROFILE INTAKE ---
with st.sidebar:
    st.markdown("<h2 style='color:#2D6A4F; margin-bottom:0;'>✨ Twacha.ai</h2>", unsafe_allow_html=True)
    st.markdown("<p style='font-size:0.85rem; opacity:0.8;'>Intelligent Skincare Diagnostics</p>", unsafe_allow_html=True)
    st.markdown("---")

    if not st.session_state.user_id:
        st.subheader("🔑 Account Access")
        auth_mode = st.radio("Choose Option", ["Login", "Register"])
        auth_user = st.text_input("Username", key="auth_user")
        auth_pw = st.text_input("Password", type="password", key="auth_pw")

        if auth_mode == "Register":
            st.markdown("#### 📋 Profile Intake")
            p_age = st.number_input("Age", min_value=12, max_value=100, value=25)
            p_gender = st.selectbox("Gender", ["Select Gender", "Female", "Male", "Non-binary", "Prefer not to say"])
            p_country = st.text_input("Country", value="", placeholder="Enter your country")
            p_budget = st.number_input("Skincare Budget ($)", min_value=5.0, max_value=1000.0, value=50.0, step=5.0)
            p_water = st.slider("Daily Water Intake (L)", 0.5, 5.0, 2.0, step=0.1)
            p_sleep = st.slider("Average Sleep (Hours)", 3.0, 12.0, 7.0, step=0.5)

            if st.button("Create Account"):
                if not auth_user or not auth_pw:
                    st.error("Please enter a username and password.")
                elif not p_country.strip():
                    st.error("Please enter your country.")
                else:
                    profile_data = {
                        "age": int(p_age),
                        "gender": p_gender,
                        "country": p_country.strip(),
                        "budget": float(p_budget),
                        "water_intake": float(p_water),
                        "sleep_hours": float(p_sleep),
                    }
                    res, ok = api_register(auth_user, auth_pw, profile_data)
                    if ok:
                        st.session_state.user_id = res["user_id"]
                        st.session_state.username = res["username"]
                        st.session_state.profile = res["profile"]
                        st.session_state.chat_messages = []
                        st.session_state.chat_history = []
                        st.success("Account created successfully!")
                        st.rerun()
                    else:
                        st.error(res.get("detail", "Registration failed."))

        else:
            if st.button("Sign In"):
                if not auth_user or not auth_pw:
                    st.error("Please enter username and password.")
                else:
                    res, ok = api_login(auth_user, auth_pw)
                    if ok:
                        st.session_state.user_id = res["user_id"]
                        st.session_state.username = res["username"]
                        st.session_state.profile = res["profile"]
                        st.session_state.chat_messages = []
                        st.session_state.chat_history = []
                        st.success("Welcome back!")
                        st.rerun()
                    else:
                        st.error(res.get("detail", "Login failed."))

    else:
        st.markdown(f"### 👋 Hello, **{st.session_state.username}**")
        st.markdown("<span class='badge-pill' style='background-color:#C6F6D5; color:#22543D;'>Active Member</span>", unsafe_allow_html=True)
        st.markdown("<br>", unsafe_allow_html=True)

        with st.expander("⚙️ Edit Profile Parameters", expanded=False):
            prof = st.session_state.profile
            u_age = st.number_input("Age", 12, 100, int(prof.get("age", 25)))
            u_gender = st.selectbox(
                "Gender",
                ["Female", "Male", "Non-binary", "Prefer not to say"],
                index=0 if prof.get("gender") not in ["Female", "Male", "Non-binary"] else ["Female", "Male", "Non-binary"].index(prof.get("gender"))
            )
            u_country = st.text_input("Country", prof.get("country", ""))
            u_budget = st.number_input("Budget ($)", 5.0, 1000.0, float(prof.get("budget", 50.0)), step=5.0)
            u_water = st.slider("Water Intake (L)", 0.5, 5.0, float(prof.get("water_intake", 2.0)), step=0.1)
            u_sleep = st.slider("Sleep (Hours)", 3.0, 12.0, float(prof.get("sleep_hours", 7.0)), step=0.5)

            if st.button("Save Profile Updates"):
                new_p = {
                    "age": int(u_age),
                    "gender": u_gender,
                    "country": u_country.strip(),
                    "budget": float(u_budget),
                    "water_intake": float(u_water),
                    "sleep_hours": float(u_sleep),
                }
                res, ok = api_update_profile(st.session_state.user_id, new_p)
                if ok:
                    st.session_state.profile = res["profile"]
                    st.success("Profile updated successfully! Click 'Re-Analyze Skin' or 'Re-Compare Routine' below to calibrate your plan.")
                    st.rerun()

        if st.button("Log Out"):
            st.session_state.user_id = None
            st.session_state.username = None
            st.session_state.chat_messages = []
            st.session_state.chat_history = []
            st.rerun()


# --- MAIN CONTENT AREA ---
st.markdown("""
<div class="hero-banner">
    <h1 class="hero-title">✨ Twacha.ai | Intelligent Skincare</h1>
    <p class="hero-subtitle">Smart Visual Diagnostics • Custom Budget Matching • Adaptive 7-Day Care Plans</p>
</div>
""", unsafe_allow_html=True)

if not st.session_state.user_id:
    st.info("👋 Please sign in or create an account in the sidebar to begin your personalized skincare scan.")
    
    c1, c2, c3 = st.columns(3)
    with c1:
        st.markdown("""
        <div style="border-radius:14px; padding:1.25rem; border:1px solid rgba(128,128,128,0.2);">
            <h3>📷 1. Instant Scan</h3>
            <p>Upload a face portrait to analyze your skin type and key focus areas.</p>
        </div>
        """, unsafe_allow_html=True)
    with c2:
        st.markdown("""
        <div style="border-radius:14px; padding:1.25rem; border:1px solid rgba(128,128,128,0.2);">
            <h3>🛍️ 2. Smart Match</h3>
            <p>Get curated products tailored to your exact budget limit with budget alternatives.</p>
        </div>
        """, unsafe_allow_html=True)
    with c3:
        st.markdown("""
        <div style="border-radius:14px; padding:1.25rem; border:1px solid rgba(128,128,128,0.2);">
            <h3>📅 3. 7-Day Plan</h3>
            <p>Follow a dynamic AM/PM daily routine updated specifically for your skin.</p>
        </div>
        """, unsafe_allow_html=True)
    st.stop()


# Main Application Navigation Tabs
tab_baseline, tab_followup, tab_history, tab_chat = st.tabs([
    "🔍 Skin Health Scan (Visit 1)",
    "📈 Progress Tracker & Clinical Comparison",
    "📜 Saved Scan Records",
    "💬 Dermatologist AI Assistant"
])


# ==========================================
# TAB 1: BASELINE SCAN (VISIT 1)
# ==========================================
with tab_baseline:
    st.markdown("### 📷 Skin Health Scan & Diagnostic Intake")
    st.markdown("Upload a face portrait for analysis. Our vision engine will assess your skin type and primary focus area.")

    col_u1, col_u2 = st.columns(2)
    with col_u1:
        img_file = st.file_uploader("Upload face photo", type=["jpg", "jpeg", "png"], key="b_file")
    with col_u2:
        cam_file = st.camera_input("Or capture with webcam", key="b_cam")

    active_photo = img_file or cam_file

    if active_photo is not None:
        photo_bytes = active_photo.getvalue()
        st.session_state.last_photo_bytes = photo_bytes
        st.session_state.last_photo_name = active_photo.name if hasattr(active_photo, "name") else "portrait.jpg"
        
        col_prev1, col_prev2 = st.columns(2)
        with col_prev1:
            st.image(photo_bytes, caption="Uploaded Portrait", use_container_width=True)

        if st.button("🚀 Analyze Skin & Generate 7-Day Plan", key="btn_analyze_main"):
            with st.spinner("Analyzing skin metrics, finding product matches, and generating your 7-day routine..."):
                res, ok = api_upload_scan(
                    st.session_state.user_id,
                    photo_bytes,
                    st.session_state.last_photo_name,
                    scan_type="baseline"
                )

                if ok:
                    st.session_state.baseline_res = res
                    st.success("Skin assessment complete!")
                else:
                    st.error(f"Scan analysis issue: {res.get('detail', 'Please try uploading again.')}")

    if "baseline_res" in st.session_state:
        res = st.session_state.baseline_res
        st.markdown("---")
        st.markdown("### 📊 STEP 1: Skin Diagnostics & 7 Concern Probabilities")

        # Top Summary Badges
        mc1, mc2, mc3, mc4 = st.columns(4)
        with mc1:
            st.markdown(f"""
            <div style="border-radius:14px; padding:1.1rem; border:1px solid rgba(128,128,128,0.2); text-align:center;">
                <p style="opacity:0.7; margin-bottom:4px; font-size:0.85rem;">SKIN TYPE</p>
                <h3 style="margin:0;">{res.get('skin_type', 'Normal')}</h3>
                <span class="badge-pill" style="background-color:#EBF8FF; color:#2B6CB0; margin-top:8px;">Identified</span>
            </div>
            """, unsafe_allow_html=True)

        with mc2:
            primary_c = res.get('primary_concern', 'Clear Skin').title()
            st.markdown(f"""
            <div style="border-radius:14px; padding:1.1rem; border:1px solid rgba(128,128,128,0.2); text-align:center;">
                <p style="opacity:0.7; margin-bottom:4px; font-size:0.85rem;">PRIMARY FOCUS AREA</p>
                <h3 style="margin:0;">{primary_c}</h3>
                <span class="badge-pill" style="background-color:#FEFCBF; color:#B7791F; margin-top:8px;">Top Focus</span>
            </div>
            """, unsafe_allow_html=True)

        with mc3:
            clear_val = res.get('scores', {}).get('clear skin', 0.0)
            status_text = "Optimal Clear" if clear_val >= 85.0 else "Active Care Required"
            bg_c = "#C6F6D5" if clear_val >= 85.0 else "#FEFCBF"
            tx_c = "#22543D" if clear_val >= 85.0 else "#B7791F"
            st.markdown(f"""
            <div style="border-radius:14px; padding:1.1rem; border:1px solid rgba(128,128,128,0.2); text-align:center;">
                <p style="opacity:0.7; margin-bottom:4px; font-size:0.85rem;">CLEAR SKIN SCORE</p>
                <h3 style="margin:0;">{clear_val}%</h3>
                <span class="badge-pill" style="background-color:{bg_c}; color:{tx_c}; margin-top:8px;">{status_text}</span>
            </div>
            """, unsafe_allow_html=True)

        with mc4:
            b_val = st.session_state.profile.get('budget', 50.0)
            st.markdown(f"""
            <div style="border-radius:14px; padding:1.1rem; border:1px solid rgba(128,128,128,0.2); text-align:center;">
                <p style="opacity:0.7; margin-bottom:4px; font-size:0.85rem;">BUDGET LIMIT</p>
                <h3 style="margin:0; color:#2D6A4F;">${b_val:.2f}</h3>
                <span class="badge-pill" style="background-color:#E8F5E9; color:#2D6A4F; margin-top:8px;">Max Filter</span>
            </div>
            """, unsafe_allow_html=True)

        # Minimalist Clinical Diagnostics 2-Column Grid (NO EMOJIS)
        st.markdown("#### Full 7 Concern Probabilities Breakdown")
        scores = res.get("scores", {})
        scores_list = list(scores.items())
        sc_col1, sc_col2 = st.columns(2)

        for idx, (concern_name, score_pct) in enumerate(scores_list):
            col_target = sc_col1 if idx % 2 == 0 else sc_col2
            display_title = concern_name.title()
            
            with col_target:
                st.markdown(f"""
                <div class="clinical-diag-card">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                        <span style="font-weight:600; font-size:1.0rem;">{display_title}</span>
                        <span style="font-weight:700; font-size:1.05rem;">{score_pct}%</span>
                    </div>
                </div>
                """, unsafe_allow_html=True)
                st.progress(min(1.0, score_pct / 100.0))

        st.markdown("---")

        # STEP 2: E-COMMERCE PRODUCT RECOMMENDATIONS FROM CSV ONLY
        if res.get("is_maintenance"):
            st.markdown("""
            <div style="padding:1.5rem; border-radius:16px; border:1px solid #C6F6D5; background-color:rgba(45, 106, 79, 0.08); margin-bottom:1.5rem;">
                <h3 style="color:#2D6A4F; margin:0 0 0.5rem 0;">🎉 Excellent Clear Skin Condition!</h3>
                <p style="margin:0;">
                    Your skin is currently in radiant balance (Clear Skin score >= 85%). 
                    No heavy treatment products are required. A gentle preventative maintenance schedule has been generated for you below.
                </p>
            </div>
            """, unsafe_allow_html=True)

        else:
            st.markdown("### 🛍️ STEP 2: Custom Product Recommendations & Budget Dupes")
            st.markdown("Curated products extracted exclusively from our dataset matching your skin type and budget limit, with budget-friendly alternatives.")

            recs = res.get("recommendations", [])
            for idx, item in enumerate(recs, 1):
                p = item.get("product", {})
                dupes = item.get("cheaper_dupes", [])
                p_price = float(p.get('price', 0.0))

                with st.container():
                    st.markdown(f"""
                    <div class="product-box">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
                            <div>
                                <h3 style="margin:0;">#{idx}. <strong>Brand:</strong> {p.get('brand_name')}</h3>
                                <h4 style="margin:0.2rem 0; font-weight:600;"><strong>Product:</strong> {p.get('product_name')}</h4>
                                <div style="margin-top:0.3rem;">
                                    <span class="badge-pill" style="background-color:#EBF8FF; color:#2B6CB0;"><strong>Type:</strong> {p.get('product_type')}</span>
                                    &nbsp; | &nbsp; <strong>Rating:</strong> ⭐ {p.get('rating_norm')} / 5.0
                                </div>
                            </div>
                            <div style="text-align:right;">
                                <span style="font-size:1.6rem; font-weight:800; color:#2D6A4F;">${p_price:.2f}</span>
                            </div>
                        </div>
                        <div style="border-top:1px solid rgba(128,128,128,0.15); padding-top:0.75rem;">
                            <strong>Full Ingredients List:</strong>
                            <div style="font-size:0.88rem; opacity:0.9; margin-top:0.25rem; line-height:1.45;">
                                {p.get('ingredients')}
                            </div>
                        </div>
                    </div>
                    """, unsafe_allow_html=True)

                    if dupes:
                        with st.expander(f"✨ View 3 Budget-Friendly Alternatives (Dupes) for #{idx}", expanded=False):
                            for d in dupes:
                                d_price = float(d.get('price', 0.0))
                                savings = max(0.0, p_price - d_price)
                                
                                st.markdown(f"""
                                <div class="dupe-box">
                                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
                                        <div>
                                            <strong style="font-size:1.05rem;">Brand: {d.get('brand_name')}</strong>
                                            <div style="font-weight:600;">Product: {d.get('product_name')}</div>
                                            <div style="margin-top:0.2rem; font-size:0.85rem;">
                                                <span class="badge-pill" style="background-color:#E2E8F0; color:#2D3748;">Type: {d.get('product_type')}</span>
                                                &nbsp; | &nbsp; <strong>Rating:</strong> ⭐ {d.get('rating_norm')} / 5.0
                                            </div>
                                        </div>
                                        <div style="text-align:right;">
                                            <span style="font-weight:800; font-size:1.2rem; color:#2D6A4F;">${d_price:.2f}</span>
                                            <br><span class="badge-savings">Save ${savings:.2f}</span>
                                        </div>
                                    </div>
                                    <div style="font-size:0.85rem; opacity:0.9; border-top:1px solid rgba(128,128,128,0.1); padding-top:0.4rem;">
                                        <strong>Full Ingredients:</strong> {d.get('ingredients')}
                                    </div>
                                </div>
                                """, unsafe_allow_html=True)

        st.markdown("---")

        # STEP 3: HYPER-PERSONALIZED DESCRIPTIVE 7-DAY PLAN WITH RE-ANALYZE BUTTON
        st.markdown("### 📅 STEP 3: Deeply Descriptive 7-Day AM/PM Skincare Plan")
        st.info("💡 Note: If you update your profile parameters in the sidebar, click the button below to re-calibrate your 7-day routine with your new parameters.")

        if "last_photo_bytes" in st.session_state and st.session_state.last_photo_bytes:
            if st.button("🚀 Re-Analyze Skin with Updated Profile Parameters", key="btn_reanalyze_profile"):
                with st.spinner("Re-analyzing skin diagnostics with your updated profile parameters..."):
                    res_new, ok_new = api_upload_scan(
                        st.session_state.user_id,
                        st.session_state.last_photo_bytes,
                        st.session_state.get("last_photo_name", "portrait.jpg"),
                        scan_type="baseline"
                    )
                    if ok_new:
                        st.session_state.baseline_res = res_new
                        st.success("7-Day Skincare Routine successfully re-calibrated!")
                        st.rerun()
                    else:
                        st.error(f"Re-analysis issue: {res_new.get('detail', 'Please try uploading again.')}")

        st.markdown(
            f"Synthesized for **Age {st.session_state.profile.get('age', 25)}**, "
            f"**{res.get('skin_type', 'Normal')} skin**, **{st.session_state.profile.get('water_intake', 2.0)}L current water habit**, "
            f"and **{st.session_state.profile.get('sleep_hours', 7.0)} hours current sleep habit**."
        )

        routine_payload = res.get("routine", {})
        parsed_days = parse_routine_json(routine_payload)

        day_tabs = st.tabs(["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"])
        for i, tab in enumerate(day_tabs, 1):
            day_key = f"Day {i}"
            day_data = parsed_days.get(day_key, {
                "Morning": ["Step 1: Cleanse", "Step 2: Active Treatment", "Step 3: SPF Protection"],
                "Evening": ["Step 1: Cleanse", "Step 2: Barrier Repair", "Step 3: Rest Protocol"]
            })
            
            with tab:
                col_am, col_pm = st.columns(2)
                with col_am:
                    st.markdown("""
                    <div class="routine-box-am">
                        <h4 style="margin:0 0 0.5rem 0; color:#DD6B20;">☀️ Morning Routine</h4>
                    </div>
                    """, unsafe_allow_html=True)
                    render_routine_bullets(day_data.get("Morning", []))

                with col_pm:
                    st.markdown("""
                    <div class="routine-box-pm">
                        <h4 style="margin:0 0 0.5rem 0; color:#2D6A4F;">🌙 Evening Routine</h4>
                    </div>
                    """, unsafe_allow_html=True)
                    render_routine_bullets(day_data.get("Evening", []))


# ==========================================
# TAB 2: PROGRESS TRACKER & CLINICAL COMPARISON
# ==========================================
with tab_followup:
    st.markdown("### 📈 Progress Tracker & Clinical Comparison")
    st.markdown("Upload a follow-up portrait to evaluate clinical improvements and adapt your skincare routine.")

    f_file = st.file_uploader("Upload follow-up portrait", type=["jpg", "jpeg", "png"], key="f_file")
    
    if f_file is not None:
        f_bytes = f_file.getvalue()
        st.session_state.last_followup_bytes = f_bytes
        st.session_state.last_followup_name = f_file.name
        
        if st.button("🔄 Analyze Progress & Update Routine", key="btn_analyze_followup"):
            with st.spinner("Comparing portraits and calculating clinical net changes..."):
                res, ok = api_upload_scan(
                    st.session_state.user_id,
                    f_bytes,
                    f_file.name,
                    scan_type="followup"
                )

                if ok:
                    st.session_state.followup_res = res
                    st.success("Progress comparison complete!")
                else:
                    st.error(f"Error: {res.get('detail', 'Ensure a baseline scan exists first.')}")

    if "followup_res" in st.session_state:
        res = st.session_state.followup_res

        st.markdown("---")
        st.markdown("### 🔍 Portrait Comparison")

        col_img_b, col_img_f = st.columns(2)
        with col_img_b:
            st.markdown("""
            <div style="text-align:center; padding:8px; border-radius:12px; border:1px solid rgba(128,128,128,0.2);">
                <span class="badge-pill" style="background-color:#EBF8FF; color:#2B6CB0;">Baseline: Day 1</span>
            </div>
            """, unsafe_allow_html=True)
            b_url = f"{BACKEND_URL}{res.get('baseline_image_url', '')}"
            st.image(b_url, use_container_width=True)

        with col_img_f:
            st.markdown("""
            <div style="text-align:center; padding:8px; border-radius:12px; border:1px solid rgba(128,128,128,0.2);">
                <span class="badge-pill" style="background-color:#C6F6D5; color:#22543D;">Current Progress</span>
            </div>
            """, unsafe_allow_html=True)
            f_url = f"{BACKEND_URL}{res.get('followup_image_url', res.get('followup_cropped_url', ''))}"
            st.image(f_url, use_container_width=True)

        st.markdown("---")

        # CLINICAL PROGRESS METRICS MATRIX (TABLE)
        st.markdown("### 📊 Clinical Progress Metrics")

        deltas = res.get("deltas", {})
        baseline_scores = res.get("baseline_scores", {})
        followup_scores = res.get("followup_scores", {})

        matrix_md = "| Concern | Baseline % | Follow-up % | Delta (Δ) | Status |\n"
        matrix_md += "| :--- | :---: | :---: | :---: | :---: |\n"

        for concern, delta_val in deltas.items():
            b_val = baseline_scores.get(concern, 0.0)
            f_val = followup_scores.get(concern, 0.0)
            
            if concern == "clear skin":
                if delta_val > 0:
                    status_str = "✅ Improved"
                elif delta_val == 0:
                    status_str = "🌱 Stable/Maintained"
                else:
                    status_str = "⚠️ Needs Attention"
                change_str = f"+{delta_val}%" if delta_val > 0 else f"{delta_val}%"
            else:
                if delta_val <= -2.0:
                    status_str = "✅ Improved"
                elif delta_val > 2.0:
                    status_str = "⚠️ Needs Attention"
                else:
                    status_str = "🌱 Stable/Maintained"
                change_str = f"{delta_val}%" if delta_val <= 0 else f"+{delta_val}%"

            matrix_md += f"| **{concern.title()}** | {b_val}% | {f_val}% | {change_str} | {status_str} |\n"

        st.markdown(matrix_md)

        st.markdown("---")

        # ADAPTIVE HEALING VS MAINTENANCE ROUTINE WITH RE-COMPARE BUTTON
        st.markdown("### 📅 Adaptive 7-Day Care Routine")
        st.info("💡 Note: If you update your profile parameters in the sidebar, click the button below to re-compare your progress and generate a newly calibrated adaptive routine.")

        if "last_followup_bytes" in st.session_state and st.session_state.last_followup_bytes:
            if st.button("🚀 Re-Analyze Progress & Re-Compare Routine with Updated Profile", key="btn_reanalyze_followup_profile"):
                with st.spinner("Re-comparing progress and generating newly calibrated adaptive routine..."):
                    res_f, ok_f = api_upload_scan(
                        st.session_state.user_id,
                        st.session_state.last_followup_bytes,
                        st.session_state.get("last_followup_name", "followup.jpg"),
                        scan_type="followup"
                    )
                    if ok_f:
                        st.session_state.followup_res = res_f
                        st.success("Progress & Adaptive Routine successfully re-calibrated!")
                        st.rerun()
                    else:
                        st.error(f"Re-analysis error: {res_f.get('detail', 'Please try uploading again.')}")

        if res.get("is_cured"):
            st.markdown("""
            <div style="padding:1.25rem; border-radius:14px; border:1px solid #C6F6D5; background-color:rgba(45, 106, 79, 0.08); margin-bottom:1.5rem;">
                <h4 style="color:#2D6A4F; margin:0 0 0.25rem 0;">🎉 Maintenance Routine (Cured / Clear Skin >= 85%)</h4>
                <p style="margin:0;">Ongoing skin concerns resolved! Showing gentle preventative maintenance schedule with NO new products.</p>
            </div>
            """, unsafe_allow_html=True)
        else:
            st.markdown("""
            <div style="padding:1.25rem; border-radius:14px; border:1px solid #FEFCBF; background-color:rgba(183, 121, 31, 0.08); margin-bottom:1.5rem;">
                <h4 style="color:#B7791F; margin:0 0 0.25rem 0;">🌱 Adaptive Healing Routine (Ongoing Focus)</h4>
                <p style="margin:0;">We have updated your product recommendations for your remaining primary concern and calibrated your next 7-day plan.</p>
            </div>
            """, unsafe_allow_html=True)

        routine_payload = res.get("routine", {})
        parsed_days = parse_routine_json(routine_payload)

        f_day_tabs = st.tabs(["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"])
        for i, tab in enumerate(f_day_tabs, 1):
            day_key = f"Day {i}"
            day_data = parsed_days.get(day_key, {
                "Morning": ["Step 1: Cleanse", "Step 2: Active Care", "Step 3: SPF 50"],
                "Evening": ["Step 1: Cleanse", "Step 2: Active Care", "Step 3: Moisture Cream"]
            })
            with tab:
                col_am, col_pm = st.columns(2)
                with col_am:
                    st.markdown("""
                    <div class="routine-box-am">
                        <h4 style="margin:0 0 0.5rem 0; color:#DD6B20;">☀️ Morning Routine</h4>
                    </div>
                    """, unsafe_allow_html=True)
                    render_routine_bullets(day_data.get("Morning", []))
                with col_pm:
                    st.markdown("""
                    <div class="routine-box-pm">
                        <h4 style="margin:0 0 0.5rem 0; color:#2D6A4F;">🌙 Evening Routine</h4>
                    </div>
                    """, unsafe_allow_html=True)
                    render_routine_bullets(day_data.get("Evening", []))


# ==========================================
# TAB 3: SCAN HISTORY & RECORDS
# ==========================================
with tab_history:
    st.markdown("### 📜 Saved Scan Records")
    if st.button("🔄 Refresh Records"):
        st.session_state.pop("history_data", None)

    history_data, ok = api_get_history(st.session_state.user_id)
    if ok and history_data.get("scans"):
        scans = history_data["scans"]
        st.write(f"Total Scans Saved: **{len(scans)}**")

        for s in scans:
            with st.expander(f"Scan #{s['id']} - {s['scan_type'].title()} ({s['timestamp'][:10]})", expanded=False):
                h1, h2 = st.columns([1, 2])
                with h1:
                    img_url = f"{BACKEND_URL}{s['image_path']}"
                    st.image(img_url, caption=f"Scan #{s['id']}", width=180)
                with h2:
                    st.write(f"**Skin Type:** {s['skin_type']}")
                    st.write(f"**Primary Focus:** {s['primary_concern'].title()}")
                    st.write("**Diagnostics:**")
                    st.json(s['scores'])
    else:
        st.info("No scan history found yet. Complete a skin health scan to save your first record.")


# ==========================================
# TAB 4: DERMATOLOGIST AI CHATBOT
# ==========================================
with tab_chat:
    # Header & Memory Clear Action Row
    col_head, col_clr = st.columns([3.5, 1.2])
    with col_head:
        st.markdown("### 💬 Dr. Twacha | Real-Time Dermatologist AI Assistant")
        st.markdown("Ask any question regarding your skin concerns, ingredients, product application, or lifestyle habits.")
    with col_clr:
        if st.button("🗑️ Clear Chat Memory"):
            st.session_state.chat_messages = []
            st.session_state.chat_history = []
            st.success("Session memory cleared!")
            st.rerun()

    # Active Patient Profile Summary Bar
    prof = st.session_state.profile
    base_res = st.session_state.get("baseline_res", {})
    st_type = base_res.get("skin_type", "Normal")
    p_concern = base_res.get("primary_concern", "General Care").title()
    b_limit = float(prof.get("budget", 50.0))

    st.markdown(f"""
    <div style="border-radius:14px; padding:0.85rem 1.1rem; border:1px solid rgba(45, 106, 79, 0.2); background-color:rgba(45, 106, 79, 0.05); margin-bottom:1.25rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap;">
        <div>
            <strong style="color:#2D6A4F; font-size:1.0rem;">Active Patient Profile:</strong>
            &nbsp; Age {prof.get('age', 25)} • {st_type} Skin • Focus: <strong>{p_concern}</strong>
        </div>
        <div>
            <span class="badge-pill" style="background-color:#E8F5E9; color:#2D6A4F;">Budget: ${b_limit:.2f}</span>
            &nbsp;
            <span class="badge-pill" style="background-color:#EBF8FF; color:#2B6CB0;">Water: {prof.get('water_intake', 2.0)}L</span>
            &nbsp;
            <span class="badge-pill" style="background-color:#FEFCBF; color:#B7791F;">Sleep: {prof.get('sleep_hours', 7.0)}h</span>
        </div>
    </div>
    """, unsafe_allow_html=True)

    # Render Conversation Messages Chronologically
    active_msgs = st.session_state.get("chat_messages", st.session_state.get("chat_history", []))
    if not active_msgs:
        st.markdown("""
        <div style="text-align:center; padding:2.5rem 1rem; opacity:0.75; border-radius:14px; border:1px dashed rgba(128,128,128,0.2); margin-bottom:1.5rem;">
            <h4>👋 Welcome! I am Dr. Twacha, your Board-Certified AI Dermatologist.</h4>
            <p>Feel free to ask me questions like:</p>
            <ul style="list-style-position: inside; text-align: left; display: inline-block; margin-top:0.5rem;">
                <li><em>"Why were these specific products recommended for my skin?"</em></li>
                <li><em>"How does my water intake of 3.6L support dark spot recovery?"</em></li>
                <li><em>"Can I use Vitamin C serum alongside Niacinamide in my evening routine?"</em></li>
            </ul>
        </div>
        """, unsafe_allow_html=True)
    else:
        for message in active_msgs:
            with st.chat_message(message["role"]):
                st.markdown(message["content"])

    # Anchored Chat Input Field at the Bottom
    if user_prompt := st.chat_input("Ask Dr. Twacha any skincare question..."):
        # 1. Append User Message
        st.session_state.chat_messages.append({"role": "user", "content": user_prompt})
        st.session_state.chat_history = st.session_state.chat_messages

        # 2. Call Backend AI Dermatologist Endpoint
        with st.spinner("Dr. Twacha is analyzing your clinical context and formulating advice..."):
            res, ok = api_chat_dermatologist(
                st.session_state.user_id,
                user_prompt,
                st.session_state.chat_messages
            )
            reply = res.get("reply", "I am currently assessing your skin metrics. Please try asking again.")

        # 3. Append Assistant Reply
        st.session_state.chat_messages.append({"role": "assistant", "content": reply})
        st.session_state.chat_history = st.session_state.chat_messages

        # 4. Rerun to display new message turn in order above input box
        st.rerun()
