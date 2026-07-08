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
      const skip = ['.exe', '.dll', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg'];
      if (skip.includes(ext)) continue;
      let data = fs.readFileSync(full, 'utf8');
      const lines = data.split(/\r?\n/);
      const firstImportIdx = lines.findIndex(l => l.startsWith('import '));
      if (firstImportIdx !== -1) {
        const firstImportLine = lines[firstImportIdx].trim();
        // find second occurrence of identical import line
        const secondIdx = lines.findIndex((l, i) => i > firstImportIdx && l.trim() === firstImportLine);
        if (secondIdx !== -1) {
          const newData = lines.slice(0, secondIdx).join('\n').trim() + '\n';
          fs.writeFileSync(full, newData, 'utf8');
          console.log('Trimmed at second import in', path.relative(process.cwd(), full));
        }
      }
    }
  }
}

walk(root);
console.log('Done trimming at second import');
