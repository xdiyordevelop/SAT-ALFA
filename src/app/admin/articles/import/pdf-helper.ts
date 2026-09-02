export async function loadPdfJs(): Promise<any> {
  if (typeof window === 'undefined') return null;
  if ((window as any).pdfjsLib) return (window as any).pdfjsLib;

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="pdf.min.js"]');
    if (existing) {
      const checkInterval = setInterval(() => {
        if ((window as any).pdfjsLib) {
          clearInterval(checkInterval);
          resolve((window as any).pdfjsLib);
        }
      }, 50);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      if (pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(pdfjsLib);
      } else {
        reject(new Error('pdf.js failed'));
      }
    };
    document.head.appendChild(script);
  });
}

export async function renderPdfToCanvases(file: File): Promise<{ pageNum: number, canvas: HTMLCanvasElement, base64: string }[]> {
  const pdfjsLib = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  const results = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const scale = 2.0; // High resolution for better AI reading and cropping
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) continue;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;
    
    // Get base64 without the prefix to send to Gemini
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const base64 = dataUrl.split(',')[1];
    
    results.push({ pageNum, canvas, base64 });
  }

  return results;
}

export async function cropAndUploadCanvas(canvas: HTMLCanvasElement, ibbox: {ymin: number, xmin: number, ymax: number, xmax: number}): Promise<string | null> {
  const x0 = Math.floor((ibbox.xmin / 1000) * canvas.width);
  const y0 = Math.floor((ibbox.ymin / 1000) * canvas.height);
  const x1 = Math.ceil((ibbox.xmax / 1000) * canvas.width);
  const y1 = Math.ceil((ibbox.ymax / 1000) * canvas.height);
  const w = x1 - x0;
  const h = y1 - y0;
  
  if (w <= 0 || h <= 0) return null;
  
  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = w;
  cropCanvas.height = h;
  const cropCtx = cropCanvas.getContext('2d');
  if (!cropCtx) return null;
  
  cropCtx.drawImage(canvas, x0, y0, w, h, 0, 0, w, h);
  
  const blob = await new Promise<Blob | null>(resolve => cropCanvas.toBlob(resolve, 'image/jpeg', 0.9));
  if (!blob) return null;
  
  const file = new File([blob], `article_image_${Date.now()}.jpg`, { type: 'image/jpeg' });
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'image');
  
  try {
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (res.ok && data.url) {
      return data.url;
    }
  } catch (err) {
    console.error("Image upload failed", err);
  }
  return null;
}
