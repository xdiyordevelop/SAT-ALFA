const fs = require('fs');

async function run() {
  const apiKey = process.env.GEMINI_API_KEY.split(",")[0].trim();
  const payload = {
      contents: [{ role: "user", parts: [{ text: "Hello" }] }],
      generationConfig: { maxOutputTokens: 5 }
  };
  
  let success = 0;
  let failed = 0;
  
  for (let i = 0; i < 25; i++) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (res.ok) success++;
      else failed++;
  }
  
  console.log(`Success: ${success}, Failed: ${failed}`);
}
run();
