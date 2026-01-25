import google.generativeai as genai

# PASTE KEY HERE
GOOGLE_API_KEY = "AIzaSyBvbz-Od_18K3RKfxtNC1ro7cp8o_syaVw"

genai.configure(api_key=GOOGLE_API_KEY)

print("Checking available models...")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")
except Exception as e:
    print(f"Error: {e}")