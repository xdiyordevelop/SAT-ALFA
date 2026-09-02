const fs = require('fs');

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  const prompt = `Analyze this SAT test page image. Identify the bounding boxes for every distinct multiple-choice or math question present on the page.
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
If no questions are found, return an empty array [].`;

  // Provide a dummy 1x1 black JPEG image just to see the structure of the JSON it hallucinates
  const dummyB64 = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
  
  const payload = {
      contents: [{
          role: "user",
          parts: [
              { text: prompt },
              { inlineData: { mimeType: "image/jpeg", data: dummyB64 } }
          ]
      }],
      generationConfig: { responseMimeType: "application/json" }
  };
  
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
  });
  
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
run();
