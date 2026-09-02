const fs = require('fs');

async function run() {
  const b64 = fs.readFileSync("/home/diyorbek/Downloads/world-of-warships-3840x2160-27099.jpg", {encoding: 'base64'});
  const payload = { imageBase64: b64 };
  
  const res = await fetch("http://localhost:3000/api/ai/detect-boxes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  
  if (!res.ok) {
    const err = await res.text();
    console.log("Error:", res.status, err);
  } else {
    const data = await res.json();
    console.log("Success:", JSON.stringify(data, null, 2));
  }
}
run();
