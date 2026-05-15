const fs = require('fs');
const code = fs.readFileSync('src/components/registration-detail-modal.tsx', 'utf8');
const lines = code.split('\n');

let depth = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  let d = 0;
  for (const ch of line) {
    if (ch === '(') depth++, d++;
    if (ch === ')') depth--, d--;
  }
  if (depth < 0) {
    console.log('PAREN UNDERFLOW at line', i+1, 'depth change:', d, 'total:', depth);
    console.log('  CONTEXT:');
    for (let j = Math.max(0, i-3); j <= Math.min(lines.length-1, i+2); j++) {
      console.log('  ' + (j+1) + ': ' + lines[j]);
    }
    break;
  }
}
console.log('Final paren depth:', depth);
console.log('Total lines:', lines.length);
