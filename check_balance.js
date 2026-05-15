const fs = require('fs');
const code = fs.readFileSync('src/components/registration-detail-modal.tsx', 'utf8');
const lines = code.split('\n');

// Track brace/paren balance per line
let braceDepth = 0;
let parenDepth = 0;
let errors = [];

lines.forEach((line, i) => {
  const trimmed = line.trim();
  // Skip empty lines and pure comment lines
  const codeOnly = trimmed.replace(/\/\/.*$/, '').replace(/\/\*[\s\S]*?\*\//, '');
  if (!codeOnly || codeOnly === '') return;

  // Count { and } only in code portions (not in comments or strings)
  let openB = 0, closeB = 0;
  let openP = 0, closeP = 0;
  for (const ch of codeOnly) {
    if (ch === '{') openB++;
    if (ch === '}') closeB++;
    if (ch === '(') openP++;
    if (ch === ')') closeP++;
  }
  braceDepth += openB - closeB;
  parenDepth += openP - closeP;

  if (braceDepth < 0) {
    console.log('BRACE NEGATIVE at line', i+1, 'depth:', braceDepth, '=', trimmed.substring(0,90));
    errors.push(i+1);
  }
  if (parenDepth < 0) {
    console.log('PAREN NEGATIVE at line', i+1, 'depth:', parenDepth, '=', trimmed.substring(0,90));
    errors.push(i+1);
  }
});

console.log('Final brace depth:', braceDepth);
console.log('Final paren depth:', parenDepth);
console.log('Errors at lines:', errors.length ? errors.join(', ') : 'none');

// Now find JSX tag imbalance for key divs
let divDepth = 0;
let keyDepthErrors = [];
lines.forEach((line, i) => {
  const trimmed = line;
  // Opening div: <div (but not </div)
  const openDivs = (trimmed.match(/<div(?!\s*\/>)/g) || []).length;
  // Closing div: </div>
  const closeDivs = (trimmed.match(/<\/div>/g) || []).length;
  divDepth += openDivs - closeDivs;
  if (divDepth < 0) {
    keyDepthErrors.push(i+1);
  }
});
console.log('Final div depth:', divDepth);
console.log('Div depth errors:', keyDepthErrors.length ? keyDepthErrors.join(', ') : 'none');
