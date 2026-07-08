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
      const matches = data.match(/export default/g);
      if (matches && matches.length > 1) {
        const idx = data.indexOf('export default');
        // find end of line after this occurrence
        const nextNl = data.indexOf('\n', idx);
        const newData = nextNl === -1 ? data.slice(0) : data.slice(0, nextNl+1);
        fs.writeFileSync(full, newData, 'utf8');
        console.log('Trimmed after first export for', path.relative(process.cwd(), full));
      }
    }
  }
}

walk(root);
console.log('Done trimming');
