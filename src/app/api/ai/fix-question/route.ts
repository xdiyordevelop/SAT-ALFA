import { NextResponse } from'next/server'; export async function POST(req: Request) { try { const { instruction, currentData } = await req.json(); if (!instruction || !currentData) { return NextResponse.json({ error:'Missing required fields' }, { status: 400 }); }
const systemInstruction =`You are an expert SAT question editor. You will be provided with the current JSON state of an SAT question.
Your task is to apply the following ADMIN INSTRUCTION to the question content.
ADMIN INSTRUCTION:"${instruction}" RULES FOR MATH FORMATTING:
- ALL math formulas, variables (like x, y), numbers, and equations MUST be wrapped in inline LaTeX delimiters: $...$
- Block equations should be wrapped in $$...$$
- Do NOT use plain text for variables or equations.
- Do NOT output nested HTML span tags or ql-formula tags. JUST output the LaTeX delimiters ($ or $$) within the text. RETURN:
Return ONLY a valid JSON object representing the updated question state. Do not include any markdown wrappers string like \`\`\`json or surrounding text.
The JSON must have this exact structure (all strings containing HTML):
{"passage":"updated html...","prompt":"updated html...","options": {"A":"updated html...","B":"updated html...","C":"updated html...","D":"updated html..." },"explanation":"updated html...","correctAnswer":"updated if necessary"
}`; const keys = (process.env.GEMINI_API_KEY ||"").split(",").map(k => k.trim()); const apiKey = keys[Math.floor(Math.random() * keys.length)]; if (!apiKey) throw new Error("GEMINI_API_KEY is not configured."); const apiUrl =`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`; const payload = { contents: [ { role:"user", parts: [ { text: systemInstruction }, { text:"CURRENT QUESTION DATA:\n" + JSON.stringify(currentData, null, 2) } ] } ], generationConfig: { responseMimeType:"application/json" } }; const res = await fetch(apiUrl, { method:'POST', headers: {'Content-Type':'application/json' }, body: JSON.stringify(payload) }); if (!res.ok) { const errData = await res.json().catch(() => ({})); throw new Error(errData.error?.message ||'Failed to fix question with Gemini'); }
const result = await res.json(); const candidate = result?.candidates?.[0]; const part = candidate?.content?.parts?.[0]; if (!part?.text) throw new Error("Invalid response from Gemini"); let jsonText = part.text; const match = jsonText.match(/\{[\s\S]*\}/); if (match) jsonText = match[0]; const parsedData = JSON.parse(jsonText); return NextResponse.json({ success: true, data: parsedData }); } catch (error: any) { console.error('[API] Fix Question Error:', error); return NextResponse.json({ error: error.message }, { status: 500 }); }
}
