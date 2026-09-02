import os
import base64
import json
import requests
import fitz # PyMuPDF

pdf_path = "/home/diyorbek/Downloads/practice 11.pdf"
doc = fitz.open(pdf_path)
page = doc.load_page(2) # usually page 3 or 4 has actual questions
pix = page.get_pixmap(matrix=fitz.Matrix(2.0, 2.0))
img_data = pix.tobytes("jpeg", 80)
b64_image = base64.b64encode(img_data).decode("utf-8")

api_key = os.environ.get("GEMINI_API_KEY")

prompt = """Analyze this SAT test page image. Identify the bounding boxes for every distinct multiple-choice or math question present on the page.
A question typically includes the passage/context (if any), the prompt, the graphic/chart (if any), and all answer choices.
Return a valid JSON array of objects. Each object should represent a single question area and must contain exactly these fields: 
- "questionNumber": the integer number printed next to the question (e.g., 3).
- "ymin", "xmin", "ymax", "xmax": exactly these 4 integer values between 0 and 1000 representing scaled coordinates relative to the image dimensions. YOU MUST PROVIDE THESE EXACT NUMERIC KEYS. Do not omit them or wrap them in arrays structure.
- "isValid": a boolean (true/false) that is true ONLY if the box successfully captures the FULL context, the prompt, and ALL 4 answer choices (if multiple choice). Mark it false if it is cut off or missing choices.
- "hasImage": a boolean. true if the question contains a graph, chart, figure, table, or any visual diagram that is essential to answering the question. false if it is text-only.
- "imageBBox": if "hasImage" is true, provide the bounding box of JUST the image/graph/chart as {"ymin": ..., "xmin": ..., "ymax": ..., "xmax": ...} using the same 0-1000 coordinate system relative to the FULL PAGE. If "hasImage" is false, set this to null.

CRITICAL: YOU MUST EXTRACT EVERY SINGLE QUESTION VISIBLE ON THIS PAGE! Do not skip any questions!
CRITICAL: The JSON output MUST be complete and syntactically correct. Do not truncate the JSON.
CRITICAL: Ensure all required fields ("questionNumber", "ymin", "xmin", "ymax", "xmax", "isValid", "hasImage", "imageBBox") are present for every object.

Do not include markdown, just the raw JSON array.
If no questions are found, return an empty array []."""

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key={api_key}"
payload = {
    "contents": [{
        "role": "user",
        "parts": [
            { "text": prompt },
            { "inlineData": { "mimeType": "image/jpeg", "data": b64_image } }
        ]
    }],
    "generationConfig": { "responseMimeType": "application/json" }
}

print("Sending request to Gemini...")
res = requests.post(url, headers={"Content-Type": "application/json"}, json=payload)
if res.status_code == 200:
    data = res.json()
    text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
    print(text)
else:
    print(f"Error {res.status_code}: {res.text}")

