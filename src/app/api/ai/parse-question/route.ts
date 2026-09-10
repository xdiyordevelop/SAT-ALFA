import { NextResponse } from 'next/server';
import { fetchWithGeminiFailover } from '@/lib/ai/gemini-pool';
import { geminiProvider } from '@/lib/ai/providers/gemini';

export async function POST(req: Request) {
 try {
 const { imageBase64, isMath } = await req.json();
 if (!imageBase64) {
 return NextResponse.json({ error: 'Missing imageBase64' }, { status: 400 });
 }

  const subject = isMath ? "Math" : "Reading & Writing";
  const domainList = isMath 
    ? "Algebra, Advanced Math, Problem-Solving and Data Analysis, Geometry and Trigonometry" 
    : "Information and Ideas, Craft and Structure, Expression of Ideas, Standard English Conventions"; 
  
  const textPrompt = `You are an expert SAT question parser. Analyze this image of an SAT question.
${isMath ? "This is a MATH question. It can be Multiple-Choice (A, B, C, D) OR a Student-Produced Response (Grid-in / Fill-in) with NO choices where the student enters a number or fraction." : "This is a READING & WRITING question. It is Multiple-Choice (A, B, C, D) and has a reading passage / stimulus text."}

MANDATORY EXTRACTION RULES:
1. **format**: Return strictly "mcq" or "fill-in".
   - Return "mcq" IF AND ONLY IF the question image has multiple-choice choices (A, B, C, D).
   - Return "fill-in" IF there are NO options (A, B, C, D) and it requires a manually entered numeric answer (Math Grid-In).
2. **passage**:
   - For Reading & Writing questions, you MUST extract the full reading passage, poem, narrative excerpt, or bulleted researcher notes into "passage". Wrap underlined words with <u>...</u>.
   - DO NOT put the reading passage into "prompt"!
   - For Math questions without a passage, leave as empty string.
3. **prompt**:
   - The question sentence itself (e.g. "Which choice best describes the main idea?", "What is the value of $x$?", "Which choice completes the text...?").
   - Wrap ALL mathematical equations, variables (like $x$, $y$), numbers, and formulas in KaTeX format using $...$ delimiters.
   - NEVER put option choices (A, B, C, D) inside "prompt"!
4. **hasVisualStimulus**:
   - Set to true if the question contains ANY geometric diagram (triangle, circle, angles, polygon), coordinate plane / xy-plane, function graph, scatterplot, bar chart, or data table.
   - Set to false ONLY if it is plain text and inline formulas.
5. **stimulusBBox**:
   - If "hasVisualStimulus" is true, provide the exact bounding box of JUST the diagram, graph, chart, or table within this question image (ymin, xmin, ymax, xmax scaled from 0 to 1000). If false, set all to 0.
6. **diagramDescription**:
   - If "hasVisualStimulus" is true, a concise 1-sentence description of the visual figure (e.g. "Coordinate plane showing line L intersecting (0, 3) and (4, 0)"). Otherwise empty string.
7. **options**:
   - If "mcq", an object with the four options: {"A":"Text...","B":"Text...","C":"Text...","D":"Text..."}. Wrap math in $...$.
   - If "fill-in", set to null or omit. DO NOT invent options for grid-in questions!
8. **correctAnswer**:
   - If "mcq", the correct option letter ("A", "B", "C", or "D").
   - If "fill-in", the correct numeric answer or fraction (e.g. "4", "3/4", "0.75", "-5").
9. **domain**: Categorize this question into one of: ${domainList}.
10. **skill**: Based on the domain, categorize into the most specific skill.
11. **explanation**: Write a clear, step-by-step explanation for why the correct answer is right. Return valid JSON.`; 

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
          format: { type: "STRING", enum: ["mcq", "fill-in"] },
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