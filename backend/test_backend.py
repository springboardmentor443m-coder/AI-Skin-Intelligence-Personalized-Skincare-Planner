import os
import sys
import json
import io
from PIL import Image
from fastapi.testclient import TestClient

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import app

client = TestClient(app)

def test_all():
    print("--- 1. Testing Health Check Endpoint ---")
    res = client.get("/api/health")
    print("Health Check Response:", res.status_code, res.json())
    assert res.status_code == 200

    print("\n--- 2. Testing Auth Registration & Login ---")
    reg_data = {
        "email": "testuser@skinintel.com",
        "password": "SecurePassword123!",
        "full_name": "Dr. Alex Taylor",
        "role": "user"
    }
    res_reg = client.post("/api/auth/register", json=reg_data)
    if res_reg.status_code == 201:
        print("Registration Successful:", res_reg.json())
        token = res_reg.json()["access_token"]
    else:
        print("User exists, testing login...")
        login_res = client.post("/api/auth/login", json={"email": reg_data["email"], "password": reg_data["password"]})
        assert login_res.status_code == 200
        token = login_res.json()["access_token"]
        print("Login Successful, Token retrieved!")

    headers = {"Authorization": f"Bearer {token}"}

    print("\n--- 3. Testing Protected /me Endpoint ---")
    res_me = client.get("/api/auth/me", headers=headers)
    print("User Profile:", res_me.json())
    assert res_me.status_code == 200

    print("\n--- 4. Testing ML Skin Assessment Image Upload ---")
    img = Image.new('RGB', (400, 500), color=(240, 210, 195))
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_byte_arr.seek(0)

    files = {"file": ("test_face.jpg", img_byte_arr, "image/jpeg")}
    res_assess = client.post("/api/assess", files=files, headers=headers)
    print("Assessment Status Code:", res_assess.status_code)
    assess_json = res_assess.json()
    print("Assessment Result Summary:")
    print(f" - Estimated Age: {assess_json['estimated_age']}")
    print(f" - Skin Type: {assess_json['skin_type']}")
    print(f" - Overall Score: {assess_json['overall_score']}")
    print(f" - Original Image: {assess_json['original_image_url']}")
    print(f" - Annotated Overlay Image: {assess_json['annotated_image_url']}")
    print(f" - Metrics breakdown count: {len(assess_json['metrics'])}")
    assert res_assess.status_code == 201
    assert "annotated_image_url" in assess_json

    print("\n--- 5. Testing LLM Chatbot Integration ---")
    chat_payload = {
        "session_id": "test-session-101",
        "message": "What morning routine do you recommend for dark spots and fine lines?",
        "assessment_id": assess_json["id"]
    }
    res_chat = client.post("/api/chat", json=chat_payload, headers=headers)
    print("Chatbot Response Code:", res_chat.status_code)
    chat_json = res_chat.json()
    preview = chat_json["response"][:300].encode('ascii', 'ignore').decode('ascii')
    print("AI Advisor Output Preview:\n", preview, "...")
    assert res_chat.status_code == 200

    print("\n--- 6. Testing Chat History SQLite Storage ---")
    res_hist = client.get("/api/chat/history?session_id=test-session-101")
    print("Chat History Count:", len(res_hist.json()))
    assert len(res_hist.json()) >= 2

    print("\nALL BACKEND FastAPI & ML & Auth & LLM TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    test_all()
