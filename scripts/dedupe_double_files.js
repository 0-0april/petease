const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'frontend');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
      walk(full);
    } else if (e.isFile()) {
      const ext = path.extname(e.name).toLowerCase();
      const skip = ['.exe', '.dll', '.png', '.jpg', '.jpeg', '.gif', '.ico'];
      if (skip.includes(ext)) continue;
      let data = fs.readFileSync(full, 'utf8');
      const lines = data.split(/\r?\n/);
      // try forgiving duplicate detection: compare trimmed first/second halves
      const half = Math.floor(lines.length / 2);
      if (half > 0) {
        const first = lines.slice(0, half).join('\n').trim();
        const second = lines.slice(half).join('\n').trim();
        if (first && first === second) {
          fs.writeFileSync(full, first + '\n', 'utf8');
          console.log('Deduped', path.relative(process.cwd(), full));
        }
      }
    }
  }
}

walk(root);
console.log('Done dedupe');
