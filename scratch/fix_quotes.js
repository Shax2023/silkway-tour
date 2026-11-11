const fs = require('fs');

let code = fs.readFileSync('D:/Loyiha/public/js/timeline-i18n.js', 'utf8');

// Replace lines like: fr: 'Déjeuner... d'Asie...' with double quotes
// Better yet, let's fix any `fr: '...'` or `title: { ... }` where an inner unescaped single quote exists
code = code.replace(/:\s*'([^'\r\n]*(?:'[^'\r\n]*)+)'/g, (match, inner) => {
  // If inner contains quotes, replace enclosing with double quotes or escape
  const escaped = inner.replace(/"/g, '\\"');
  return `: "${escaped}"`;
});

fs.writeFileSync('D:/Loyiha/public/js/timeline-i18n.js', code, 'utf8');
console.log('Regex replace done');
