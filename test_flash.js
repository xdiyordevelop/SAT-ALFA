const fs = require('fs');

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  // dummy b64 image
  const dummyB64 = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
  
  const textPrompt = `Analyze this SAT test page image. Identify the bounding boxes for every distinct multiple-choice or math question present on the page.`;
  
  const payload = {
      contents: [
          {
              role: "user",
              parts: [
                  { text: textPrompt },
                  { inlineData: { mimeType: "image/jpeg", data: dummyB64 } }
              ]
          }
      ],
      generationConfig: { responseMimeType: "application/json" }
  };
  
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
  });
  
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
run();
