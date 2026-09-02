const fs = require('fs');
async function run() {
  const keys = process.env.GEMINI_API_KEY.split(",").map(k => k.trim());
  
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    console.log("Testing key " + (i+1) + "...");
    const payload = {
        contents: [{ role: "user", parts: [{ text: "Hello" }] }],
        generationConfig: { maxOutputTokens: 10 }
    };
    
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(`Key ${i+1} FAILED:`, data.error?.message);
      } else {
        console.log(`Key ${i+1} OK`);
      }
    } catch(e) {
      console.log(`Key ${i+1} ERROR:`, e.message);
    }
  }
}
run();
