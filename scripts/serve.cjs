// Local verification server. No packages or global installation required.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.sql': 'text/plain', '.png': 'image/png', '.jpg': 'image/jpeg' };
http.createServer((req, res) => {
  try {
    const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + (name === '/' ? '/index.html' : name));
    const rel = path.relative(root, file);
    if (rel.startsWith('..') || path.isAbsolute(rel) || rel.split(path.sep).some(x => x.startsWith('.'))) {
      res.writeHead(403).end(); return;
    }
    fs.stat(file, (error, stat) => {
      if (error || !stat.isFile()) { res.writeHead(404).end(); return; }
      res.writeHead(200, { 'Content-Type': (mime[path.extname(file)] || 'application/octet-stream') + '; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      fs.createReadStream(file).pipe(res);
    });
  } catch { res.writeHead(400).end(); }
}).listen(4173, '127.0.0.1', () => console.log('La Table Ronde: http://127.0.0.1:4173'));
