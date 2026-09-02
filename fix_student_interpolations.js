const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Match `something {var} something` inside backticks
      // This regex looks for backticks, and then inside them looks for {word} without a $
      let modified = false;
      const parts = content.split('`');
      for (let i = 1; i < parts.length; i += 2) {
        let inner = parts[i];
        // Replace {variable} with ${variable} inside backticks
        // Exclude cases where it's already ${ or {{ or it contains spaces like { x }
        // Let's do a simple regex for {word} or {word.word} or {word(word)}
        const newInner = inner.replace(/(?<!\$)\{([a-zA-Z0-9_.\(\)\[\]]+)\}/g, '${$1}');
        if (newInner !== inner) {
          parts[i] = newInner;
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, parts.join('`'), 'utf8');
        console.log(`Fixed interpolations in ${fullPath}`);
      }
    }
  }
}

processDir('./src/app/student/results');
processDir('./src/app/student/mock-tests');
