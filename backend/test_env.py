import os
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(__file__)
for env_path in [os.path.join(BASE_DIR, ".env"), os.path.join(BASE_DIR, "..", ".env")]:
    if os.path.exists(env_path):
        load_dotenv(env_path, override=True)


def test_groq_api_key_env_var_exists():
    api_key = os.getenv("GROQ_API_KEY")
    assert api_key is not None, "GROQ_API_KEY environment variable is not set."
    assert len(api_key) > 0, "GROQ_API_KEY is empty."


if __name__ == "__main__":
    test_groq_api_key_env_var_exists()
    print("GROQ_API_KEY environment variable exists.")