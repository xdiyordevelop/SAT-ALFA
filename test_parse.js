const fs = require('fs');

async function run() {
  const apiKey = process.env.GEMINI_API_KEY.split(",")[0].trim();
  const dummyB64 = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
  
  const textPrompt = `You are a SAT content extractor. Extract the text of this question. Return a valid JSON object.`;
  
  const payload = {
      contents: [{ role: "user", parts: [{ text: textPrompt }, { inlineData: { mimeType: "image/jpeg", data: dummyB64 } }] }],
      generationConfig: { responseMimeType: "application/json" }
  };
  
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  });
  
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
run();
