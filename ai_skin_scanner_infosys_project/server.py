import os
import base64
import datetime
import numpy as np
import tensorflow as tf
from tensorflow import keras
from flask import Flask, request, jsonify
from flask_cors import CORS
from io import BytesIO
from PIL import Image
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend requests

# MongoDB Client Setup
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
try:
    mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
    db = mongo_client["ai_skin_scanner"]
    users_col = db["users"]
    # Check connection
    mongo_client.server_info()
    print("Successfully connected to MongoDB.")
except Exception as e:
    print(f"WARNING: Could not connect to MongoDB: {e}")
    db = None
    users_col = None

# Load the trained model
MODEL_PATH = "skin_type_model.keras"
model = None

if os.path.exists(MODEL_PATH):
    try:
        model = keras.models.load_model(MODEL_PATH)
        print("Successfully loaded trained skin type model.")
    except Exception as e:
        print(f"Error loading model: {e}")
else:
    print("WARNING: skin_type_model.keras not found. Please train the model first.")

class_names = ['Combination', 'Dry', 'Normal', 'Oily', 'Sensitive']

@app.route('/api/scan', methods=['POST'])
def scan_image():
    global model
    if model is None:
        if os.path.exists(MODEL_PATH):
            model = keras.models.load_model(MODEL_PATH)
        else:
            return jsonify({"error": "Classifier model not trained or loaded. Please check server logs."}), 500

    try:
        data = request.json
        if not data or 'image' not in data:
            return jsonify({"error": "No image data provided"}), 400

        # Decode base64 image data
        image_data = data['image']
        if ',' in image_data:
            image_data = image_data.split(',')[1]

        image_bytes = base64.b64decode(image_data)
        img = Image.open(BytesIO(image_bytes)).convert('RGB')
        
        # Resize to match model input shape (128, 128)
        img_resized = img.resize((128, 128))
        img_array = np.array(img_resized, dtype=np.float32) / 255.0
        img_batch = np.expand_dims(img_array, axis=0)

        # Run Prediction
        y_pred_probs = model.predict(img_batch)
        probs = y_pred_probs[0]

        # Class probabilities mapping
        # class_names: ['Combination', 'Dry', 'Normal', 'Oily', 'Sensitive']
        comb_p = float(probs[0])
        dry_p = float(probs[1])
        norm_p = float(probs[2])
        oily_p = float(probs[3])
        sens_p = float(probs[4])

        # Find the dominant skin type class
        pred_idx = int(np.argmax(probs))
        pred_class = class_names[pred_idx]
        confidence = float(probs[pred_idx])

        # Deriving detailed dermal metrics based on image pixels and model probabilities
        np_img = np.array(img, dtype=np.float32)
        r_channel = np_img[:, :, 0]
        g_channel = np_img[:, :, 1]
        b_channel = np_img[:, :, 2]
        
        # 1. Redness (Red channel dominance ratio)
        redness_ratio = np.mean(r_channel / (g_channel + b_channel + 1.0))
        redness = int(max(10, min(95, (redness_ratio - 0.48) * 350 + 20 + sens_p * 35)))
        
        # 2. Oily (specular highlights in grayscale image)
        gray_img = np.mean(np_img, axis=2)
        shine_ratio = np.sum(gray_img > 215) / gray_img.size
        oily = int(max(10, min(95, shine_ratio * 1200 + 35 + oily_p * 45)))
        
        # 3. Dryness (texture roughness and inverse of oiliness)
        contrast_std = np.std(gray_img)
        dryness = int(max(10, min(95, 100 - oily + dry_p * 40 - norm_p * 15)))
        
        # 4. Acne & Congestion (standard deviation of red/green differences representing red lesions)
        red_green_diff = np.abs(r_channel - g_channel)
        acne_variance = np.std(red_green_diff)
        acne = int(max(10, min(95, acne_variance * 2.8 + sens_p * 35 + oily_p * 15)))
        
        # 5. Hyperpigmentation & Dark Spots (variance of the luminance channel representing color spots)
        pigmentation = int(max(10, min(95, contrast_std * 1.3 + (1.0 - norm_p) * 25)))
        
        # 6. Fine Lines & Wrinkles (horizontal and vertical high frequency contrast/edges)
        edge_x = np.abs(gray_img[:, :-1] - gray_img[:, 1:])
        edge_y = np.abs(gray_img[:-1, :] - gray_img[1:, :])
        edge_val = np.mean(edge_x[:-1, :]) + np.mean(edge_y[:-1, :])
        fine_lines = int(max(5, min(90, edge_val * 4.8 + dry_p * 20)))
        
        # Derived parameters
        dark_spots = pigmentation
        whiteheads = int(max(10, min(95, oily * 0.85 + contrast_std * 0.4)))
        
        acne_detected = acne > 25
        dark_spots_detected = dark_spots > 25
        whiteheads_detected = whiteheads > 35
 
        # Calculate overall health score
        score = max(40, min(99, int(100 - (acne * 0.15 + redness * 0.15 + oily * 0.1 + dryness * 0.1 + pigmentation * 0.05))))
 
        response = {
            "prediction": pred_class,
            "confidence": confidence,
            "probabilities": {
                "Combination": comb_p,
                "Dry": dry_p,
                "Normal": norm_p,
                "Oily": oily_p,
                "Sensitive": sens_p
            },
            "metrics": {
                "acne": acne,
                "dryness": dryness,
                "oily": oily,
                "pigmentation": pigmentation,
                "redness": redness,
                "fineLines": fine_lines,
                "score": score,
                "skinType": pred_class,
                "darkSpots": dark_spots,
                "whiteheads": whiteheads,
                "acneDetected": acne_detected,
                "darkSpotsDetected": dark_spots_detected,
                "whiteheadsDetected": whiteheads_detected,
                "questionnaire": data.get("questionnaire", {})
            }
        }
        print(f"Prediction successful: {pred_class} ({confidence * 100:.2f}%)")
        
        # Save scan history to MongoDB if email is provided
        email = data.get("email")
        if email and db is not None:
            try:
                scans_col = db["scans"]
                scans_col.insert_one({
                    "email": email.strip().lower(),
                    "timestamp": datetime.datetime.now(datetime.timezone.utc),
                    "image": data['image'],
                    "prediction": pred_class,
                    "metrics": response["metrics"]
                })
                print(f"Saved scan history for user {email} in MongoDB")
            except Exception as mongo_err:
                print(f"Error saving scan history to MongoDB: {mongo_err}")
                
        return jsonify(response)

    except Exception as e:
        print(f"Error executing scan: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.json
        if not data or 'name' not in data or 'email' not in data or 'password' not in data:
            return jsonify({"error": "Missing required fields (name, email, password)"}), 400
        
        name = data['name'].strip()
        email = data['email'].strip().lower()
        password = data['password']
        
        if not name or not email or not password:
            return jsonify({"error": "Fields cannot be empty"}), 400
            
        if users_col is None:
            return jsonify({"error": "Database connection is unavailable"}), 500
            
        # Check if user already exists
        if users_col.find_one({"email": email}):
            return jsonify({"error": "Email address already registered"}), 400
            
        # Hash password and insert user
        hashed_password = generate_password_hash(password)
        user_doc = {
            "name": name,
            "email": email,
            "password": hashed_password,
            "created_at": datetime.datetime.utcnow()
        }
        
        users_col.insert_one(user_doc)
        return jsonify({
            "success": True,
            "message": "User registered successfully",
            "user": {
                "name": name,
                "email": email
            }
        }), 201
        
    except Exception as e:
        print(f"Error in register: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.json
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({"error": "Missing required fields (email, password)"}), 400
            
        email = data['email'].strip().lower()
        password = data['password']
        
        if users_col is None:
            return jsonify({"error": "Database connection is unavailable"}), 500
            
        user = users_col.find_one({"email": email})
        if not user:
            return jsonify({"error": "Email address not registered"}), 400
            
        if not check_password_hash(user["password"], password):
            return jsonify({"error": "Incorrect password. Please try again."}), 400
            
        return jsonify({
            "success": True,
            "message": "Login successful",
            "user": {
                "name": user["name"],
                "email": user["email"]
            }
        }), 200
        
    except Exception as e:
        print(f"Error in login: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    return jsonify({"success": True, "message": "Logged out successfully"}), 200

def call_gemini(prompt, api_key=None, response_format="text"):
    if not api_key:
        api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None, "No Google Gemini API Key provided. Please paste a valid key."
    url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={api_key}"
    payload = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }]
    }
    if response_format == "json":
        payload["generationConfig"] = {
            "responseMimeType": "application/json"
        }
    try:
        import json
        import urllib.request as urllib_request
        data = json.dumps(payload).encode('utf-8')
        req = urllib_request.Request(
            url,
            data=data,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        with urllib_request.urlopen(req, timeout=12) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            print("Gemini API Raw Response:", json.dumps(res_data))
            if 'candidates' in res_data and len(res_data['candidates']) > 0:
                candidate = res_data['candidates'][0]
                if 'content' in candidate and 'parts' in candidate['content']:
                    text = candidate['content']['parts'][0]['text']
                    return text, None
                elif 'finishReason' in candidate:
                    return None, f"Blocked by Gemini Safety Filter (Finish Reason: {candidate['finishReason']})"
            return None, "Malformed response envelope received from Gemini API."
    except Exception as e:
        import urllib.error
        err_msg = str(e)
        if isinstance(e, urllib.error.HTTPError):
            try:
                err_body = e.read().decode('utf-8')
                print("HTTP Error response body:", err_body)
                err_json = json.loads(err_body)
                if 'error' in err_json and 'message' in err_json['error']:
                    err_msg = err_json['error']['message']
            except Exception:
                pass
        print(f"Error in call_gemini: {err_msg}")
        return None, err_msg

def call_ollama(prompt, system_prompt=None, response_format="text"):
    import json
    import urllib.request as urllib_request
    
    # 1. Fetch available models from local Ollama tags endpoint
    try:
        req = urllib_request.Request("http://localhost:11434/api/tags", method="GET")
        with urllib_request.urlopen(req, timeout=3) as response:
            tags_data = json.loads(response.read().decode('utf-8'))
            models = tags_data.get("models", [])
            if not models:
                return None, "Ollama is running but no models are installed. Run 'ollama pull llama3' first."
            model_name = models[0]["name"]
    except Exception as e:
        print(f"Ollama local service check failed: {e}")
        return None, "Local Ollama service is not running. Start Ollama and try again."
        
    # 2. Build the chat payload
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})
    
    payload = {
        "model": model_name,
        "messages": messages,
        "stream": False
    }
    if response_format == "json":
        payload["format"] = "json"
        
    # 3. Call local Ollama chat completions
    try:
        url = "http://localhost:11434/api/chat"
        data = json.dumps(payload).encode('utf-8')
        req = urllib_request.Request(
            url,
            data=data,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        with urllib_request.urlopen(req, timeout=30) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            text = res_data["message"]["content"]
            return text, None
    except Exception as e:
        print(f"Error calling local Ollama model '{model_name}': {e}")
        return None, f"Local Ollama call failed: {str(e)}"

@app.route('/api/consultant/recommendations', methods=['POST'])
def consultant_recommendations():
    import json
    try:
        data = request.json or {}
        api_key = data.get("apiKey") or request.headers.get("X-Gemini-API-Key")
        metrics = data.get("metrics", {})
        profile = data.get("profile", {})
        
        skin_type = metrics.get("skinType", "Normal")
        acne = metrics.get("acne", 20)
        pigmentation = metrics.get("pigmentation", 20)
        whiteheads = metrics.get("whiteheads", 20)
        redness = metrics.get("redness", 20)
        score = metrics.get("score", 80)
        
        acne_detected = metrics.get("acneDetected")
        if acne_detected is None:
            acne_detected = acne > 25
            
        dark_spots_detected = metrics.get("darkSpotsDetected")
        if dark_spots_detected is None:
            dark_spots_detected = pigmentation > 25
            
        whiteheads_detected = metrics.get("whiteheadsDetected")
        if whiteheads_detected is None:
            whiteheads_detected = whiteheads > 30
            
        acne_status = "Seen" if acne_detected else "Optimal"
        dark_spots_status = "Seen" if dark_spots_detected else "Optimal"
        whiteheads_status = "Seen" if whiteheads_detected else "Optimal"

        questionnaire = metrics.get("questionnaire", {})
        sun_exposure = questionnaire.get("sunExposure", "Medium")
        sensitivity_level = questionnaire.get("sensitivityLevel", "None")
        skincare_goal = questionnaire.get("skincareGoal", "Brightening")
        skincare_experience = questionnaire.get("skincareExperience", "Beginner")
        
        prompt = f"""
        You are an expert clinical dermatological skincare consultant.
        Generate a personalized skincare recommendation based on this skin biometric analysis and patient profile:
        - Skin Type: {skin_type}
        - Acne Severity: {acne}% ({acne_status})
        - Dark Spots Severity: {pigmentation}% ({dark_spots_status})
        - Whiteheads/Blackheads Severity: {whiteheads}% ({whiteheads_status})
        - Sensitivity Redness Level: {redness}%
        - Overall Skin Health Score: {score}/100

        Patient Profile:
        - Daily Sun Exposure: {sun_exposure}
        - Skin Sensitivity Level: {sensitivity_level}
        - Primary Skincare Goal: {skincare_goal}
        - Experience with Actives: {skincare_experience}
        
        Format your response as a valid JSON object matching the following structure exactly. Do not include any text before or after the JSON. Do not wrap the JSON in markdown code blocks like ```json ... ```. Just return raw JSON.
        
        CRITICAL: In the "routine_7_day" morning and evening lists, do NOT reference raw ingredient names directly (e.g., do not write "Apply salicylic acid" or "Apply vitamin c"). Instead, write instructions referencing the specific recommended product names or categories (e.g., "Cleanse with the recommended Salicylic Pore Clearing Gel", "Apply 3 drops of recommended Lumina C+ Serum", or "Hydrate with the Barrier Bio-Complex Cream").
        
        Structure:
        {{
          "summary": "A 2-3 sentence clinical summary of their skin condition and recommendations.",
          "products": [
            {{
              "category": "Cleanser",
              "name": "Recommended product name",
              "brand": "Recommended active ingredients or brand",
              "reason": "Why this product is recommended based on their concerns."
            }},
            {{
              "category": "Serum",
              "name": "Recommended serum name",
              "brand": "Recommended active ingredients or brand",
              "reason": "Why this serum is recommended."
            }},
            {{
              "category": "Moisturizer",
              "name": "Recommended moisturizer name",
              "brand": "Recommended active ingredients or brand",
              "reason": "Why this moisturizer is recommended."
            }},
            {{
              "category": "Sunscreen",
              "name": "Recommended sunscreen name",
              "brand": "Recommended active ingredients or brand",
              "reason": "Why this sunscreen is recommended."
            }}
          ],
          "routine_7_day": {{
            "Monday": {{ "morning": ["Step 1", "Step 2", "Step 3"], "evening": ["Step 1", "Step 2", "Step 3"] }},
            "Tuesday": {{ "morning": ["Step 1", "Step 2", "Step 3"], "evening": ["Step 1", "Step 2", "Step 3"] }},
            "Wednesday": {{ "morning": ["Step 1", "Step 2", "Step 3"], "evening": ["Step 1", "Step 2", "Step 3"] }},
            "Thursday": {{ "morning": ["Step 1", "Step 2", "Step 3"], "evening": ["Step 1", "Step 2", "Step 3"] }},
            "Friday": {{ "morning": ["Step 1", "Step 2", "Step 3"], "evening": ["Step 1", "Step 2", "Step 3"] }},
            "Saturday": {{ "morning": ["Step 1", "Step 2", "Step 3"], "evening": ["Step 1", "Step 2", "Step 3"] }},
            "Sunday": {{ "morning": ["Step 1", "Step 2", "Step 3"], "evening": ["Step 1", "Step 2", "Step 3"] }}
          }}
        }}
        """
        
        api_key_configured = api_key or os.getenv("GEMINI_API_KEY")
        response_text = None
        err_msg = None
        if api_key_configured:
            print("Using Google Gemini API for recommendations.")
            response_text, err_msg = call_gemini(prompt, api_key=api_key, response_format="json")
        else:
            print("No Gemini API key provided. Checking local Ollama service...")
            response_text, err_msg = call_ollama(
                prompt=prompt,
                system_prompt="You are a clinical dermatological skincare consultant. Return raw JSON matching the schema.",
                response_format="json"
            )
        
        if response_text:
            try:
                # Robust extraction of the JSON block
                start_idx = response_text.find("{")
                end_idx = response_text.rfind("}")
                if start_idx != -1 and end_idx != -1:
                    clean_text = response_text[start_idx:end_idx+1]
                    result = json.loads(clean_text)
                    return jsonify(result)
                else:
                    print("Could not locate JSON brackets in Gemini response.")
            except Exception as e:
                print(f"Error parsing Gemini JSON response: {e}. Output was: {response_text}")
                
        # Graceful rule-based fallback if LLM is offline or no GEMINI_API_KEY
        print("Falling back to local rule-based recommendations engine.")
        
        cleanser = {"category": "Cleanser", "name": "pH balancing Hydrating Gel", "brand": "Centella & Glycerin", "reason": f"Gently cleanses {skin_type} skin without stripping the protective lipid barrier."}
        serum = {"category": "Serum", "name": "Aetheris Lumina Vitamin C Serum", "brand": "10% L-Ascorbic Acid & Ferulic", "reason": "Targeted antioxidant defense to brighten dark spots and promote collagen."}
        moisturizer = {"category": "Moisturizer", "name": "Barrier Bio-Complex Cream", "brand": "3% Ceramides & Panthenol", "reason": "Locks moisture in and repairs redness and irritation."}
        sunscreen = {"category": "Sunscreen", "name": "Broad-Spectrum Shield SPF 50", "brand": "Zinc Oxide (Mineral)", "reason": "Protects against UV damage which worsens dark spots and post-inflammatory acne redness."}
        
        if skin_type.lower() == "oily" or metrics.get("oily", 0) > 60:
            cleanser = {"category": "Cleanser", "name": "Salicylic Acid Clarifying wash", "brand": "2% BHA & Zinc PCA", "reason": "Deep cleanses pores, removes excess sebum, and targets whiteheads/acne."}
            serum = {"category": "Serum", "name": "Pore Clearing Niacinamide Gel", "brand": "10% Niacinamide & Zinc", "reason": "Regulates sebum production, minimizes pore appearance, and targets dark spots."}
            moisturizer = {"category": "Moisturizer", "name": "Hydro-Infusion Oil-free Gel", "brand": "Hyaluronic Acid & Squalane", "reason": "Ultralight hydration without clogging congested pores."}
            
        elif skin_type.lower() == "dry" or metrics.get("dryness", 0) > 60:
            moisturizer = {"category": "Moisturizer", "name": "Deep Nourishing Ceramide Balm", "brand": "Ceramides & Shea Butter", "reason": "Intense hydration to restore dry, flaky patches and support lipid barrier."}
            serum = {"category": "Serum", "name": "Hyaluronic Acid Moisture booster", "brand": "2% Multi-weight HA & Panthenol", "reason": "Draws moisture deep into dry epidermal layers."}
            
        if metrics.get("acneDetected", False):
            serum = {"category": "Serum", "name": "Clear Skin Acne Spot Treatment", "brand": "Azelaic Acid & Tea Tree", "reason": "Reduces acne inflammation and prevents dark spots from post-inflammatory hyperpigmentation."}

        products = [cleanser, serum, moisturizer, sunscreen]
        
        m_routine = [f"Cleanse with {cleanser['name']}.", f"Apply 3 drops of {serum['name']}.", f"Moisturize with {moisturizer['name']}.", f"Apply {sunscreen['name']}."]
        n_routine = [f"Double cleanse with hydrating wash.", f"Apply {serum['name']} (focusing on concerns).", f"Nourish skin with {moisturizer['name']}."]
        
        routine_7_day = {
            "Monday": {"morning": m_routine, "evening": n_routine},
            "Tuesday": {"morning": m_routine, "evening": n_routine + ["Apply Hydrating Sheet Mask."]},
            "Wednesday": {"morning": m_routine, "evening": n_routine},
            "Thursday": {"morning": m_routine, "evening": n_routine + ["Exfoliate with 2% BHA (salicylic acid) gently."]},
            "Friday": {"morning": m_routine, "evening": n_routine},
            "Saturday": {"morning": m_routine, "evening": n_routine},
            "Sunday": {"morning": m_routine, "evening": n_routine + ["Focus on barrier recovery - apply Ceramide cream."]}
        }
        
        summary = f"Your skin analysis indicates {skin_type} skin with a health score of {score}/100. "
        if metrics.get("acneDetected", False):
            summary += "We detected active acne/congestion. We suggest incorporating BHA or Azelaic acid. "
        if metrics.get("darkSpotsDetected", False):
            summary += "Dark spots are present; incorporate Vitamin C or Niacinamide to brighten hyperpigmentation. "
        if metrics.get("whiteheadsDetected", False):
            summary += "Whiteheads are present due to elevated sebum; focus on clarifying pore-cleansers. "
        summary += "Here is your 7-day Week Skincare Plan and product list."
        
        return jsonify({
            "summary": summary,
            "products": products,
            "routine_7_day": routine_7_day
        })
        
    except Exception as e:
        print(f"Error in consultant_recommendations: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/consultant/chat', methods=['POST'])
def consultant_chat():
    import json
    try:
        data = request.json or {}
        message = data.get("message", "").strip()
        history = data.get("history", [])
        metrics = data.get("metrics", {})
        api_key = data.get("apiKey") or request.headers.get("X-Gemini-API-Key")
        profile = data.get("profile", {})
        client_name = profile.get("name", "Client")
        client_email = profile.get("email", "praveenpamisetty@gmail.com")
        
        if not message:
            return jsonify({"error": "Message cannot be empty"}), 400
            
        skin_type = metrics.get("skinType", "Normal")
        acne = metrics.get("acne", 20)
        pigmentation = metrics.get("pigmentation", 20)
        whiteheads = metrics.get("whiteheads", 20)
        redness = metrics.get("redness", 20)
        score = metrics.get("score", 80)
        
        acne_detected = metrics.get("acneDetected")
        if acne_detected is None:
            acne_detected = acne > 25
            
        dark_spots_detected = metrics.get("darkSpotsDetected")
        if dark_spots_detected is None:
            dark_spots_detected = pigmentation > 25
            
        whiteheads_detected = metrics.get("whiteheadsDetected")
        if whiteheads_detected is None:
            whiteheads_detected = whiteheads > 30
            
        acne_status = "Seen" if acne_detected else "Optimal"
        dark_spots_status = "Seen" if dark_spots_detected else "Optimal"
        whiteheads_status = "Seen" if whiteheads_detected else "Optimal"

        questionnaire = metrics.get("questionnaire", {})
        sun_exposure = questionnaire.get("sunExposure", "Medium")
        sensitivity_level = questionnaire.get("sensitivityLevel", "None")
        skincare_goal = questionnaire.get("skincareGoal", "Brightening")
        skincare_experience = questionnaire.get("skincareExperience", "Beginner")
        
        formatted_history = ""
        for turn in history[-6:]:
            role = "Client" if turn.get("sender") == "user" else "Consultant"
            formatted_history += f"{role}: {turn.get('text')}\n"
            
        prompt = f"""
        You are Aetheris AI Skincare Consultant, an expert clinical dermatological assistant.
        You are chatting with a client whose personal details are:
        - Client Name: {client_name}
        - Client Email: {client_email}
        
        Client skin analysis and questionnaire profile shows:
        - Skin Type: {skin_type}
        - Acne Severity: {acne}% ({acne_status})
        - Dark Spots Severity: {pigmentation}% ({dark_spots_status})
        - Whiteheads/Blackheads Severity: {whiteheads}% ({whiteheads_status})
        - Sensitivity Redness Level: {redness}%
        - Overall Skin Health Score: {score}/100
        
        Patient Profile:
        - Daily Sun Exposure: {sun_exposure}
        - Skin Sensitivity Level: {sensitivity_level}
        - Primary Skincare Goal: {skincare_goal}
        - Experience with Actives: {skincare_experience}

        Keep your persona helpful, precise, clinical, and empathetic. Answer the client's questions about active ingredients, routines, or skin conditions. Reference their scan results and profile when relevant (e.g. 'Since you have sensitive skin and mild dark spots...').
        
        Here is the chat history:
        {formatted_history}
        
        Client: {message}
        
        Consultant:
        """
        
        api_key_configured = api_key or os.getenv("GEMINI_API_KEY")
        response_text = None
        err_msg = None
        if api_key_configured:
            print("Using Google Gemini API for consultant chat.")
            response_text, err_msg = call_gemini(prompt, api_key=api_key)
        else:
            print("No Gemini API key provided. Checking local Ollama service...")
            response_text, err_msg = call_ollama(
                prompt=prompt,
                system_prompt="You are Aetheris AI Skincare Consultant, an expert clinical assistant."
            )
            
        if response_text:
            return jsonify({
                "reply": response_text.strip()
            })
            
        # If API key was provided but failed, let the user know directly
        if api_key:
            print(f"Gemini API key call failed: {err_msg}")
            return jsonify({
                "reply": f"I tried to contact Google Gemini AI with your provided API key, but the API returned a request error: '{err_msg}'. Please double check your key config, billing status, or network connection."
            })
            
        # Smart local rules-based fallback for normal user asked text when no API key is set
        print("Running smart local conversational fallback chatbot.")
        msg_lower = message.lower()
        
        # Greetings & Personal details
        if "name" in msg_lower:
            reply = f"Your name is {client_name}, and your registered account email is {client_email}."
        elif "email" in msg_lower:
            reply = f"Your account is registered under the email address: {client_email}."
        elif any(w in msg_lower for w in ["hi", "hello", "hey", "greetings", "good morning", "good evening"]):
            reply = f"Hello {client_name}! I am your Aetheris Skincare Consultant. I have loaded your {skin_type} skin profile (Health Score: {score}/100). How can I assist you with your routine, active ingredients, or skin concerns today?"
            
        # Active ingredients explanation
        elif "retinol" in msg_lower:
            reply = "Retinol (Vitamin A) accelerates skin cell turnover, helps clear pores, boosts collagen production, and fades dark spots. Always apply Retinol at night on dry skin, start 2-3 times per week, and use SPF 50 daily as it increases sun sensitivity."
        elif "salicylic" in msg_lower or "bha" in msg_lower:
            reply = "Salicylic Acid (BHA) is oil-soluble, allowing it to penetrate deep inside pores to dissolve oil, dead skin, and dirt. It is the premier clinical ingredient for whiteheads, blackheads, and acne congestion."
        elif "niacinamide" in msg_lower:
            reply = "Niacinamide (Vitamin B3) strengthens the skin barrier, balances sebum (oil) production, fades pigmentation, and calms redness. It is extremely gentle and pairs well with almost all other active ingredients."
        elif "vitamin c" in msg_lower or "ascorbic" in msg_lower:
            reply = "Vitamin C is a powerful antioxidant that protects skin from environmental damage, neutralizes free radicals, and brightens dark spots. It is best applied in the morning under your SPF."
        elif "hyaluronic" in msg_lower:
            reply = "Hyaluronic Acid is a moisture binder that pulls hydration into the skin. Apply it on damp skin, followed by a moisturizer to lock in the hydration."
            
        # Specific skin concerns matching
        elif "acne" in msg_lower or "pimple" in msg_lower or "breakout" in msg_lower:
            reply = f"Your scan shows an acne severity score of {acne}% ({acne_status}). I recommend using a Salicylic Acid cleanser in the morning, followed by Niacinamide to calm redness. For breakouts, consider spot-treating with Benzoyl Peroxide or Azelaic Acid."
        elif "spot" in msg_lower or "pigment" in msg_lower or "dark" in msg_lower:
            reply = f"For the dark spots/pigmentation of {pigmentation}% shown in your report, active ingredients like Vitamin C, Niacinamide, Alpha Arbutin, or Retinol are excellent choices. Always apply SPF 50 during the day to protect your progress."
        elif "whitehead" in msg_lower or "blackhead" in msg_lower or "clog" in msg_lower:
            reply = f"Whiteheads and blackheads ({whiteheads}%) are caused by oil and dead cells trapped in pores. Double cleansing at night (oil-based cleanser first, followed by a gel cleanser) and BHA exfoliation will help clear them."
        elif "redness" in msg_lower or "sensit" in msg_lower or "irritat" in msg_lower:
            reply = f"Your redness level is {redness}%, indicating sensitive skin. Focus on rebuilding your barrier with Centella Asiatica, Ceramides, Squalane, and Hyaluronic Acid, and avoid physical scrubs or strong glycolic acids."
            
        # Routine questions
        elif "routine" in msg_lower or "plan" in msg_lower or "schedule" in msg_lower:
            reply = f"I've generated a customized 7-day routine tailored for your {skin_type} skin to address active concerns. Navigate to the 'Routine Planner' screen from the sidebar to view and check off your steps!"
            
        # General response
        else:
            reply = f"Based on your {skin_type} skin profile (Health Score: {score}/100, Acne: {acne}%, Dark Spots: {pigmentation}%, Redness: {redness}%), I can recommend ingredients, routine adjustments, or discuss specific concerns. What would you like to focus on?"
            
        return jsonify({
            "reply": reply
        })
        
    except Exception as e:
        print(f"Error in consultant_chat: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/scan/history', methods=['GET'])
def get_scan_history():
    email = request.args.get("email")
    if not email:
        return jsonify({"error": "Missing email parameter"}), 400
        
    if db is None:
        return jsonify({"error": "Database connection is unavailable"}), 500
        
    try:
        scans_col = db["scans"]
        # Find scans and sort by timestamp descending
        scans = list(scans_col.find({"email": email.strip().lower()}).sort("timestamp", -1))
        
        serialized_scans = []
        for scan in scans:
            ts = scan.get("timestamp")
            ts_str = ts.isoformat() if ts else ""
            
            serialized_scans.append({
                "id": str(scan["_id"]),
                "email": scan["email"],
                "timestamp": ts_str,
                "image": scan.get("image", ""),
                "prediction": scan.get("prediction", "Normal"),
                "metrics": scan.get("metrics", {})
            })
            
        return jsonify(serialized_scans), 200
    except Exception as e:
        print(f"Error in get_scan_history: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Run on port 5000
    app.run(host='0.0.0.0', port=5000)
