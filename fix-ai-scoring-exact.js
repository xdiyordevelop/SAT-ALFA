const fs = require('fs');
let code = fs.readFileSync('src/server/actions/ai-scoring.ts', 'utf8');

const oldBlock = `    const data = await fetchGeminiWithRetry(apiKey, {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1500,
            topP: 0.95,
          },
        }, 3);

    if (!response.ok) {
      throw new Error(\`Gemini API error: \${response.statusText}\`)
    }

    const data = await response.json()
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text`;

const newBlock = `    const data = await fetchGeminiWithRetry(apiKey, {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1500,
            topP: 0.95,
          },
        }, 3);

    const responseText = extractTextFromGeminiResponse(data);`;

// Wait, the `const data = await response.json()` is already replaced or maybe it wasn't replaced properly. Let's look at the exact file using string methods.
