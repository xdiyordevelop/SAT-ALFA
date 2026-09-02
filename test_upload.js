const fs = require('fs');

async function run() {
  const formData = new FormData();
  // Provide a dummy base64 image 1x1 pixel
  const dummyBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
  formData.append('page_1', dummyBase64);
  
  const res = await fetch('http://localhost:3000/api/admin/articles/parse-pdf', {
    method: 'POST',
    body: formData,
    headers: {
      // Need a valid session cookie for admin
    }
  });
  
  const data = await res.json();
  console.log(data);
}
run();
