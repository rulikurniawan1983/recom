const fs = require('fs');
const code = fs.readFileSync('src/components/registration-detail-modal.tsx', 'utf8');
const lines = code.split('\n');

let parenDepth = 0;
let firstNeg = true;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Track per line change
  let d = 0;
  for (const ch of line) {
    if (ch === '(') d++;
    if (ch === ')') d--;
  }
  if (parenDepth + d < 0 && firstNeg) {
    console.log('FIRST NEGATIVE at line', (i+1) + ', depth would be:', parenDepth + d);
    console.log('  LINE:', line.trim().substring(0, 100));
    firstNeg = false;
  }
  parenDepth += d;
}

console.log('Final paren depth (surplus closing parens):', parenDepth);
