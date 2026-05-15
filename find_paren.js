// Find specific paren imbalance
const fs = require('fs');
const code = fs.readFileSync('src/components/registration-detail-modal.tsx', 'utf8');
const lines = code.split('\n');

// Iterate and find where paren depth goes below 0
let depth = 0;
let parenLines = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Show paren counts per line
  let d = 0;
  for (const ch of line) {
    if (ch === '(') { d++; depth++; }
    if (ch === ')') depth--;
  }
  if (d !== 0) {
    parenLines.push(`${i+1}: depthChange=${d:+d} totalDepth=${depth} | ${line.trim().substring(0,70)}`);
  }
}
console.log('Lines with paren changes:');
parenLines.forEach(l => console.log(l));
console.log('');
console.log('Final paren depth:', depth);
console.log('If negative, extra closing parens at end of file');
