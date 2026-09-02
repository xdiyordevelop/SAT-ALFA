const fs = require('fs');

async function run() {
  const apiKey = process.env.GEMINI_API_KEY.split(",")[0].trim();
  const ARTICLE_SYSTEM_PROMPT = `Return ONLY a raw valid JSON object/array matching the schema. Do NOT wrap the response in markdown code blocks like \`\`\`json ... \`\`\`, and do NOT include any introductory or concluding conversational text.

You are a Senior SAT Content Extraction AI. Your task is to convert a PDF document into a complete educational article for SAT students. Return ONLY a raw valid JSON object/array matching the schema. Do NOT wrap the response in markdown code blocks like \`\`\`json ... \`\`\`, and do NOT include any introductory or concluding conversational text.`;

  const ARTICLE_USER_PROMPT = `Analyze the DOCUMENT TEXT below and produce the following JSON object:

{
 "title": "The exact article title found in the document",
 "slug": "url-friendly-slug-derived-from-title",
 "category": "Exactly one of: SCIENCE | HISTORY | LITERATURE | STRATEGY | VOCABULARY",
 "summary": "Exactly 2 complete sentences summarizing the article's main idea.",
 "readTimeMin": <integer — estimated reading time in minutes>,
 "content": "<FULL Markdown body — see rules below>",
 "vocabulary": [
 {
 "word": "advanced SAT vocabulary word",
 "definition": "clear, student-friendly definition",
 "contextSentence": "The exact sentence from the article where this word appears"
 }
 ]
}

CONTENT RULES (CRITICAL — follow every rule):
1. Do NOT summarize, paraphrase, or shorten the article body. Convert the FULL original text from start to finish into clean Markdown.
2. Preserve ALL sections, headings, paragraphs, lists, and sub-sections exactly as they appear.
3. Wrap every inline math expression in $...$ and every display/block equation in $$...$$ (KaTeX format).
4. Insert figure image tags where images or diagrams are referenced: ![Figure caption](/uploads/articles/figure-N.png)
5. Use proper Markdown: ## for H2, ### for H3, **bold**, *italic*, - for bullet lists, 1. for numbered lists.
6. Do NOT add a top-level H1 heading (the title field covers that).

VOCABULARY RULES (CRITICAL):
- Extract between 6 and 10 advanced SAT-level vocabulary words that ACTUALLY appear in the article text.

---
DOCUMENT TEXT:
The Evolution of Stars.
Stars are massive, luminous spheres of plasma held together by gravity.
A typical star like our Sun lives for about 10 billion years.
They burn hydrogen to form helium.
`;

  const payload = {
      contents: [{ role: "user", parts: [{ text: ARTICLE_SYSTEM_PROMPT + "\n\n" + ARTICLE_USER_PROMPT }] }],
      generationConfig: { responseMimeType: "application/json" }
  };
  
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  });
  
  const data = await res.json();
  console.log(data?.candidates?.[0]?.content?.parts?.[0]?.text);
}
run();
