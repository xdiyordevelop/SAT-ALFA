import { NextResponse } from 'next/server';
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
Extract the following information:
1. **format**: Return "mcq" if there are multiple choice options (A, B, C, D). Return "fill-in" if there are no options and it requires a manually typed math answer.
2. **passage**: The full text of the reading passage, if one exists. If not, this should be an empty string. Handle text formatting like bold and underline by wrapping them in <b></b> or <u></u> tags. For math, this is usually empty.
3. **prompt**: The text of the question itself, including any inline text from the passage. Make sure to wrap ALL equations, variables (like x, y), numbers, and mathematical expressions in KaTeX format using $...$ delimiters. Do NOT skip the $...$ formatting for math. If it's a block equation use $$...$$.
4. **options**: If "mcq", a JSON object of the four options: {"A":"Text...","B":"Text...","C":"Text...","D":"Text..."}. Handle KaTeX formatting. If "fill-in", omit this field or return empty.
5. **correctAnswer**: If "mcq", the correct option letter ("A", "B", "C", or "D"). Infer this from visual cues (checkmark/circle). If "fill-in", write the correct exact numeric answer(s).
6. **domain**: Categorize this question into one of the following domains: ${domainList}.
7. **skill**: Based on the domain, categorize this into the most specific skill.
8. **explanation**: Write a clear, concise explanation for why the correct answer is right and the others are wrong. Return *only* a single, valid JSON object with these fields.`; 

 // The Gemini Provider needs to support multimodal or we pass it as parts. 
 // wait, geminiProvider interface? Let's check `src/lib/ai/providers/gemini.ts` to see if it supports images. 
 // Assuming geminiProvider.generateContent supports image integration
 // if we use the underlying SDK, but let's just use the raw Google Gen AI fetch here if we don't know the exact wrapper signature, or I can check it first. 
 // For now,
 // let's use the Gemini API directly to ensure image support if the provider doesn't easily expose it. 
 const keys = (process.env.GEMINI_API_KEY || "").split(",").map(k => k.trim()); 
 const apiKey = keys[Math.floor(Math.random() * keys.length)]; 
 if (!apiKey) throw new Error("GEMINI_API_KEY is not configured."); 
 
 const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`; 
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
          required: ["format", "prompt", "correctAnswer", "domain", "skill", "explanation"]
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
 throw new Error(errData.error?.message || 'Failed to parse image with Gemini'); 
 }

 const result = await res.json(); 
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