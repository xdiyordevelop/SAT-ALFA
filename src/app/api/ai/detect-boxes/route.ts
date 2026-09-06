import { NextResponse } from 'next/server';
import { fetchWithGeminiFailover } from '@/lib/ai/gemini-pool';

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return NextResponse.json({ error: 'Missing imageBase64' }, { status: 400 });
    }

    const prompt = `Analyze this SAT test page image. 
1. Check if there is a module title or section header printed on this page (e.g., "Reading and Writing Module 1", "Reading and Writing Module 2", "Math Module 1", "Math Module 2").
2. Identify the bounding boxes for every distinct multiple-choice or math question present on the page.
A question starts with a bold question number (e.g. 1, 2, 3... up to 35) followed by passage/context, prompt, graphic/chart (if any), and answer choices (A, B, C, D or math grid-in).

IMPORTANT GUIDELINES:
- DO NOT mistake page numbers, margin section indicators (like "1" or "2" in the top/bottom page corners), or "CONTINUE" labels for questions!
- Ensure the bounding box FULLY encompasses any diagram, geometry figure, coordinate plane, data chart, or table associated with the question.
- Do NOT skip any questions visible on this page.

Return a JSON object with:
- "moduleHeader": string or empty string if no module header on this page.
- "boxes": an array of question areas with:
  - "questionNumber": integer question number printed next to the question (e.g. 1, 2, 3).
  - "ymin", "xmin", "ymax", "xmax": scaled integer coordinates (0 to 1000).
  - "isValid": boolean (set to true for all valid questions on this page).
  - "hasImage": boolean (true if the question contains a diagram, graph, chart, table, or geometry illustration).
  - "imageBBox": if hasImage is true, bounding box of JUST the diagram/chart inside the page (0-1000 scale).`;

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
          type: "OBJECT",
          properties: {
            moduleHeader: { type: "STRING" },
            boxes: {
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
          required: ["boxes"]
        }
      },
      safetySettings: [
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" }
      ]
    };

    const result = await fetchWithGeminiFailover('gemini-3.5-flash-lite', payload);
    const candidate = result?.candidates?.[0];
    const part = candidate?.content?.parts?.[0];
    if (!part?.text) {
      throw new Error(`Invalid response from Gemini (Reason: ${candidate?.finishReason || 'Unknown'})`);
    }

    let jsonText = part.text;
    const parsedData = JSON.parse(jsonText);
    const boxes = Array.isArray(parsedData) ? parsedData : (parsedData.boxes || []);
    const moduleHeader = parsedData.moduleHeader || null;
    return NextResponse.json({ success: true, boxes, moduleHeader });
  } catch (error: any) {
    console.error('[API] Detect Boxes Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
