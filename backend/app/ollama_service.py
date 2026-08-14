import requests
import json

OLLAMA_API_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3"
TIMEOUT_SECONDS = 60  # Reasonable timeout for local LLM generation

def ask_llama(prompt: str) -> str:
    """
    Sends a prompt to the local Ollama instance running Llama 3 and returns the response.
    """
    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False
    }
    
    try:
        response = requests.post(OLLAMA_API_URL, json=payload, timeout=TIMEOUT_SECONDS)
        response.raise_for_status()
        data = response.json()
        return data.get("response", "")
    except requests.exceptions.RequestException as e:
        print(f"Error communicating with Ollama: {e}")
        return "I am currently unable to connect to my AI service. Please try again later."

def ask_llama_stream(prompt: str):
    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": True
    }
    try:
        with requests.post(OLLAMA_API_URL, json=payload, stream=True, timeout=TIMEOUT_SECONDS) as response:
            response.raise_for_status()
            for line in response.iter_lines():
                if line:
                    data = json.loads(line.decode('utf-8'))
                    if "response" in data:
                        yield data["response"]
    except requests.exceptions.RequestException as e:
        print(f"Error communicating with Ollama: {e}")
        yield "I am currently unable to connect to my AI service. Please try again later."
