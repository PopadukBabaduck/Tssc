// backup.js
import fs  from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// эмуляция __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// пути
const SRC     = path.join(__dirname, 'public', 'users.json');
const DST_DIR = path.join('/data', 'backups');

if (!fs.existsSync(DST_DIR)) {
  fs.mkdirSync(DST_DIR, { recursive: true });
}

const ts  = new Date().toISOString().replace(/[:.]/g,'-');
const dst = path.join(DST_DIR, `users-${ts}.json`);

fs.copyFileSync(SRC, dst);
console.log(`✅ Backup saved to ${dst}`);
