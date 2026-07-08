const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'frontend');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    // skip node_modules and hidden directories
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
      walk(full);
    } else if (e.isFile()) {
      // only process text files (skip binaries by extension)
      const ext = path.extname(e.name).toLowerCase();
      const binaryExts = ['.exe', '.dll', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg'];
      if (binaryExts.includes(ext)) continue;
      const data = fs.readFileSync(full, 'utf8');
      if (data.includes('<<<<<<<') || data.includes('>>>>>>>') || data.includes('=======')) {
        const cleaned = data
          .split(/\r?\n/) 
          .filter(line => !line.startsWith('<<<<<<<') && !line.startsWith('>>>>>>>') && line !== '=======')
          .join('\n');
        fs.writeFileSync(full, cleaned, 'utf8');
        console.log('Cleaned', path.relative(process.cwd(), full));
      }
    }
  }
}

walk(root);
console.log('Done');
