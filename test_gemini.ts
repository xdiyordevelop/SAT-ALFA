import { generateStructured } from './src/lib/ai/core';

async function run() {
  const ARTICLE_SYSTEM_PROMPT = `Return ONLY a raw valid JSON object matching the schema. Do NOT wrap the response in markdown code blocks like \`\`\`json ... \`\`\`, and do NOT include any introductory or concluding conversational text.

You are a Senior SAT Content Extraction AI. Your task is to convert a PDF document into a complete educational article for SAT students. Return ONLY a raw valid JSON object matching the schema. Do NOT wrap the response in markdown code blocks like \`\`\`json ... \`\`\`, and do NOT include any introductory or concluding conversational text.`;

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
4. Insert figure image tags where images, charts, or diagrams are seen in the pages. OUTPUT EXACTLY THIS FORMAT: [IMAGE_BOX: page_index, ymin, xmin, ymax, xmax]. 
   Example: [IMAGE_BOX: 1, 100, 200, 500, 800]. The page_index is 1-indexed. The coordinates must be 0-1000 scaled relative to that page's dimensions.
5. Use proper Markdown: ## for H2, ### for H3, **bold**, *italic*, - for bullet lists, 1. for numbered lists.
6. Do NOT add a top-level H1 heading (the title field covers that).

VOCABULARY RULES (CRITICAL):
- Extract between 6 and 10 advanced SAT-level vocabulary words that ACTUALLY appear in the article text.
- Do NOT invent words or pull from outside the document.
- Each entry MUST include the exact sentence from the article as "contextSentence".
- Prefer multi-syllabic academic or domain-specific words.

Return ONLY the JSON object. No prose before or after.`;

  const dummyBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

  const { parsed, raw } = await generateStructured({
    systemPrompt: ARTICLE_SYSTEM_PROMPT,
    userPrompt: ARTICLE_USER_PROMPT,
    imagesBase64: [{ mimeType: 'image/png', data: dummyBase64 }],
    temperature: 0.2,
    maxTokens: 8192
  });

  console.log("PARSED:", typeof parsed, parsed);
  console.log("RAW:", raw.text);
}
run();
