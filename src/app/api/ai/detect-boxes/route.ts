import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return NextResponse.json({ error: 'Missing imageBase64' }, { status: 400 });
    }

    const keys = (process.env.GEMINI_API_KEY || "").split(",").map(k => k.trim());
    const apiKey = keys[Math.floor(Math.random() * keys.length)];
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

    const prompt = `Analyze this SAT test page image. Identify the bounding boxes for every distinct multiple-choice or math question present on the page.
A question typically includes the passage/context (if any), the prompt, the graphic/chart (if any), and all answer choices.
Return an array of objects. Each object should represent a single question area and must contain exactly these fields:
- "questionNumber": the integer number printed next to the question (e.g., 3).
- "ymin", "xmin", "ymax", "xmax": exactly these 4 integer values between 0 and 1000 representing scaled coordinates relative to the image dimensions.
- "isValid": a boolean (true/false) that is true ONLY if the box successfully captures the FULL context, the prompt, and ALL 4 answer choices (if multiple choice). Mark it false if it is cut off or missing choices.
- "hasImage": a boolean. true if the question contains a graph, chart, figure, table, or any visual diagram that is essential to answering the question. false if it is text-only.
- "imageBBox": if "hasImage" is true, provide the bounding box of JUST the image/graph/chart using the same 0-1000 coordinate system. If "hasImage" is false, set it to a dummy object or omit it.
CRITICAL: YOU MUST EXTRACT EVERY SINGLE QUESTION VISIBLE ON THIS PAGE! Do not skip any questions!
If no questions are found, return an empty array [].`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              questionNumber: { type: "INTEGER" },
              ymin: { type: "INTEGER" },
              xmin: { type: "INTEGER" },
              ymax: { type: "INTEGER" },
              xmax: { type: "INTEGER" },
              isValid: { type: "BOOLEAN" },
              hasImage: { type: "BOOLEAN" },
              imageBBox: {
                type: "OBJECT",
                properties: {
                  ymin: { type: "INTEGER" },
                  xmin: { type: "INTEGER" },
                  ymax: { type: "INTEGER" },
                  xmax: { type: "INTEGER" }
                }
              }
            },
            required: ["questionNumber", "ymin", "xmin", "ymax", "xmax", "isValid", "hasImage"]
          }
        }
      },
      safetySettings: [
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" }
      ]
    };

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || 'Failed to detect boxes');
    }

    const result = await res.json();
    const candidate = result?.candidates?.[0];
    const part = candidate?.content?.parts?.[0];
    if (!part?.text) {
      throw new Error(`Invalid response from Gemini (Reason: ${candidate?.finishReason || 'Unknown'})`);
    }

    let jsonText = part.text;
    const parsedData = JSON.parse(jsonText);
    return NextResponse.json({ success: true, boxes: parsedData });
  } catch (error: any) {
    console.error('[API] Detect Boxes Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
