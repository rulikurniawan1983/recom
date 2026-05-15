const fs = require('fs');
const code = fs.readFileSync('src/components/registration-detail-modal.tsx', 'utf8');
const lines = code.split('\n');

// Simple raw count of { } ( ) balanced
let braceDepth = 0;
let parenDepth = 0;
let errors = [];

lines.forEach((line, i) => {
  let openB = 0, closeB = 0;
  let openP = 0, closeP = 0;
  for (const ch of line) {
    if (ch === '{') openB++;
    if (ch === '}') closeB++;
    // Count parens only when not in JSX tag attribute like className=stuff()
    // Just count raw for now
    if (ch === '(') openP++;
    if (ch === ')') closeP++;
  }
  braceDepth += openB - closeB;
  parenDepth += openP - closeP;
  if (braceDepth < 0 && !errors.includes(i+1)) {
    console.log('BRACE < 0 at line', i+1, 'depth:', braceDepth, '|', line.trim().substring(0,90));
    errors.push('BRACE:'+i+1);
  }
  if (parenDepth < 0 && !errors.includes(i+1)) {
    console.log('PAREN < 0 at line', i+1, 'depth:', parenDepth, '|', line.trim().substring(0,90));
    errors.push('PAREN:'+i+1);
  }
});

console.log('Final brace depth:', braceDepth);
console.log('Final paren depth:', parenDepth);

// Now for JSX angle brackets: track distinct <tag style open vs </tag> close
// Self-closing: <SomeThing /> does NOT open/close with the same < and >
// Opening: <div, <button, <span, <a, <label, <select, <option, <h2, <h3, <h4, <p, <input
// Closing: </div>, </button>, etc.

const openingTags = ['div', 'button', 'span', 'a', 'label', 'select', 'option', 'h2', 'h3', 'h4', 'p', 'input', 'textarea', 'form', 'svg', 'g', 'path', 'thead', 'tbody', 'tr', 'td', 'th', 'table', 'tbody', 'tfoot'];

let tagDepth = 0;
let tagErrors = [];
lines.forEach((line, i) => {
  const l = line.trim();
  // Opening tags that are NOT closing (</) and NOT self-closing (/>)
  // Simple heuristic: if line starts with lower-case tag name it's opening
  // This is approximate
  if (l.startsWith('</div>') || l.startsWith('</button>') || l.startsWith('</span>') ||
      l.startsWith('</a>') || l.startsWith('</label>') || l.startsWith('</select>') ||
      l.startsWith('</p>') || l.startsWith('</h2>') || l.startsWith('</h3>') ||
      l.startsWith('</h4>')) {
    tagDepth--;
    if (tagDepth < 0 && !tagErrors.includes(i+1)) {
      console.log('TAG CLOSE NEG at line', i+1, 'depth:', tagDepth);
      tagErrors.push(i+1);
    }
  } else if (l.startsWith('<div ') || l.startsWith('<div>') || l.startsWith('<button ') || l.startsWith('<button>') ||
             l.startsWith('<span ') || l.startsWith('<span>') || l.startsWith('<a ') || l.startsWith('<a>') ||
             l.startsWith('<label ') || l.startsWith('<select ') || l.startsWith('<option ') ||
             l.startsWith('<p ') || l.startsWith('<p>') ||
             l.startsWith('<h2 ') || l.startsWith('<h2>') || l.startsWith('<h3 ') || l.startsWith('<h3>') ||
             l.startsWith('<textarea') || l.startsWith('<input ') || l.startsWith('<strong') ||
             l.startsWith('<form')) {
    tagDepth++;
  }
});

console.log('Final tag depth:', tagDepth);
console.log('Tag errors:', tagErrors);
