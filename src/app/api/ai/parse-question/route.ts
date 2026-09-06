import { NextResponse } from 'next/server';
import { fetchWithGeminiFailover } from '@/lib/ai/gemini-pool';
import { geminiProvider } from '@/lib/ai/providers/gemini';

export async function POST(req: Request) {
 try {
 const { imageBase64, isMath } = await req.json();
 if (!imageBase64) {
 return NextResponse.json({ error: 'Missing imageBase64' }, { status: 400 });
 }

 const subject = isMath ? "Math" : "Reading & Writing"; // Simplistic domains list for prompt
 const domainList = isMath 
 ? "Algebra, Advanced Math, Problem-Solving and Data Analysis, Geometry and Trigonometry" 
 : "Information and Ideas, Craft and Structure, Expression of Ideas, Standard English Conventions"; 
 
 const textPrompt = `You are an expert SAT question parser. Analyze this image of an SAT question.
The image may contain a reading passage, a question prompt, and multiple-choice options, OR it may be a "Grid-In" / "Fill-In" math question without options.
It may also contain an essential visual diagram, geometric figure, coordinate graph, data chart, or table.

Extract the following information:
1. **format**: Return "mcq" if there are multiple choice options (A, B, C, D). Return "fill-in" if there are no options and it requires a manually typed math answer.
2. **passage**: The full text of the reading passage, if one exists. If not, this should be an empty string. Handle text formatting like bold and underline by wrapping them in <b></b> or <u></u> tags. For math, this is usually empty.
3. **prompt**: The text of the question itself, including any inline context. Make sure to wrap ALL equations, variables (like x, y), numbers, and mathematical expressions in KaTeX format using $...$ delimiters. If it's a block equation use $$...$$. Do not transcribe diagrams as text; if a question references a figure or chart, describe it in the prompt or keep the textual prompt.
4. **hasVisualStimulus**: Set to true if this question contains an essential visual diagram, geometry drawing, triangle/circle figure, coordinate grid/graph, function plot, data table, or bar chart. Set to false if it is text and formulas only.
5. **stimulusBBox**: If "hasVisualStimulus" is true, provide the bounding box of JUST the diagram, graph, chart, or figure within this question image (ymin, xmin, ymax, xmax scaled from 0 to 1000). If false, set all to 0.
6. **diagramDescription**: If "hasVisualStimulus" is true, a concise 1-sentence description of the visual figure (e.g., "Coordinate plane showing line L intersecting (0, 3) and (4, 0)"). Otherwise empty string.
7. **options**: If "mcq", a JSON object of the four options: {"A":"Text...","B":"Text...","C":"Text...","D":"Text..."}. Wrap math in $...$. If "fill-in", omit or leave empty.
8. **correctAnswer**: If "mcq", the correct option letter ("A", "B", "C", or "D"). If "fill-in", write the correct exact numeric answer(s).
9. **domain**: Categorize this question into one of the following domains: ${domainList}.
10. **skill**: Based on the domain, categorize this into the most specific skill.
11. **explanation**: Write a clear, concise step-by-step explanation for why the correct answer is right. Return valid JSON.`; 

 const payload = { 
 contents: [ 
 { 
 role: "user", 
 parts: [ 
 { text: textPrompt }, 
 { inlineData: { mimeType: "image/jpeg", data: imageBase64 } } 
 ] 
 } 
 ], 
       generationConfig: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            format: { type: "STRING" },
            passage: { type: "STRING" },
            prompt: { type: "STRING" },
            hasVisualStimulus: { type: "BOOLEAN" },
            stimulusBBox: {
              type: "OBJECT",
              properties: {
                ymin: { type: "INTEGER" },
                xmin: { type: "INTEGER" },
                ymax: { type: "INTEGER" },
                xmax: { type: "INTEGER" }
              }
            },
            diagramDescription: { type: "STRING" },
            options: {
              type: "OBJECT",
              properties: {
                A: { type: "STRING" },
                B: { type: "STRING" },
                C: { type: "STRING" },
                D: { type: "STRING" }
              }
            },
            correctAnswer: { type: "STRING" },
            domain: { type: "STRING" },
            skill: { type: "STRING" },
            explanation: { type: "STRING" }
          },
          required: ["format", "prompt", "correctAnswer", "domain", "skill", "explanation", "hasVisualStimulus"]
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
 console.error("Gemini rejected or returned empty:", JSON.stringify(result, null, 2)); 
 throw new Error(`Invalid response from Gemini (Reason: ${candidate?.finishReason || 'Unknown'})`); 
 }

 let jsonText = part.text; 
 const parsedData = JSON.parse(jsonText); 
 return NextResponse.json({ success: true, data: parsedData }); 
 } catch (error: any) { 
 console.error('[API] Parse Question Error:', error); 
 return NextResponse.json({ error: error.message }, { status: 500 }); 
 }
}