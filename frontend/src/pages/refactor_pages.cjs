const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'rahul', 'Desktop', 'crypto-frontend-main', 'src', 'pages', 'PagesIndex.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replacements to match terminal styling
content = content.replace(/glass-panel/g, 'bg-background shadow-none');
content = content.replace(/rounded-2xl/g, 'rounded-none');
content = content.replace(/rounded-xl/g, 'rounded-none');
content = content.replace(/rounded-lg/g, 'rounded-none');
content = content.replace(/border-slate-800/g, 'border-terminal-muted');
content = content.replace(/border-slate-700/g, 'border-terminal-muted');
content = content.replace(/bg-slate-900/g, 'bg-background');
content = content.replace(/bg-slate-950/g, 'bg-background');
content = content.replace(/text-cyan-400/g, 'text-terminal-primary');
content = content.replace(/text-cyan-300/g, 'text-terminal-primary');
content = content.replace(/text-white/g, 'text-terminal-primary');
content = content.replace(/text-slate-400/g, 'text-terminal-muted');
content = content.replace(/text-slate-500/g, 'text-terminal-muted');
content = content.replace(/text-slate-300/g, 'text-terminal-primary');
content = content.replace(/text-slate-200/g, 'text-terminal-primary');
content = content.replace(/bg-cyan-600/g, 'bg-terminal-primary');
content = content.replace(/hover:bg-cyan-500/g, 'hover:bg-terminal-primary');
content = content.replace(/text-slate-950/g, 'text-background');

// make it uppercase and monospace (add to main container classes if possible, but that might be hard with regex)
// let's just do a basic replace for the common classes
content = content.replace(/font-sans/g, 'font-mono');
content = content.replace(/font-extrabold/g, 'font-bold uppercase tracking-widest');
content = content.replace(/font-semibold/g, 'font-bold uppercase');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done refactoring PagesIndex.tsx');
