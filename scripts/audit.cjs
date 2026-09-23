// Static contract checks; no credentials, database writes, or dependencies.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const app = read('app.js');
const sql = read('supabase-multiplayer-setup.sql');
const functions = new Set([...sql.matchAll(/create (?:or replace )?function public\.([a-z0-9_]+)/gi)].map(m => m[1]));
const calls = new Set([...app.matchAll(/["']([a-z0-9_]+_rpc)["']/g)].map(m => m[1]));
const tables = new Set([...sql.matchAll(/create table if not exists public\.([a-z0-9_]+)/gi)].map(m => m[1]));
const from = new Set([...app.matchAll(/\.from\(["']([a-z0-9_]+)["']\)/g)].map(m => m[1]));
const errors = [];
for (const name of ['app.js', 'index.html', 'styles.css']) {
  if (/dark[-_ ]?market/i.test(read(name))) errors.push('Removed feature still present: ' + name);
}
for (const name of calls) if (!functions.has(name)) errors.push('Missing RPC: ' + name);
for (const name of from) if (!tables.has(name)) errors.push('Missing table: ' + name);
const references = new Set();
for (const name of ['index.html', 'styles.css', 'app.js']) {
  const text = read(name);
  for (const m of text.matchAll(/(?:["'`(])(\.\/[^"'`<>\r\n]*?\.(?:png|jpg|jpeg|webp))/gi)) {
    if (!m[1].includes('${')) references.add(decodeURIComponent(m[1]));
  }
}
for (const file of references) if (!fs.existsSync(path.join(root, file))) errors.push('Missing asset: ' + file);
for (const name of ['app.js', 'supabase-config.js', 'index.html', 'styles.css', 'supabase-multiplayer-setup.sql']) {
  if (/sb_secret_[A-Za-z0-9_-]+|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(read(name))) errors.push('Private credential detected in ' + name);
}
console.log(JSON.stringify({ rpcCalls: calls.size, sqlFunctions: functions.size, queriedTables: [...from], sqlTables: tables.size, literalAssets: references.size, errors }, null, 2));
process.exitCode = errors.length ? 1 : 0;
