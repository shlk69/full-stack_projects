const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const dotenv = require('../Backend/node_modules/dotenv');
const envFile = path.join(root, 'Backend/.env');
const env = { ...(fs.existsSync(envFile) ? dotenv.parse(fs.readFileSync(envFile)) : {}), ...process.env };
const secretNames = ['JWT_SECRET','RAZORPAY_KEY_SECRET','DB_CONNECT'];
const secrets = secretNames.map(name => [name, env[name]]).filter(([, value]) => value && value.length > 8);
const excluded = new Set(['node_modules','.git','coverage','logs']);
const violations = [];
function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (excluded.has(entry.name) || entry.name.startsWith('.env')) continue;
    const file = path.join(dir,entry.name);
    if (entry.isDirectory()) { scan(file); continue; }
    if (!/.(jsx?|cjs|json|html|ya?ml|md|css)$/.test(entry.name)) continue;
    const content = fs.readFileSync(file,'utf8');
    for (const [name,value] of secrets) if (content.includes(value)) violations.push(name + ' found in ' + path.relative(root,file));
    if (file.includes(path.join('Frontend','dist')) && entry.name.endsWith('.map')) violations.push('Source map in production build');
  }
}
scan(root);
const front = path.join(root,'Frontend');
for (const name of fs.readdirSync(front).filter(name => name.startsWith('.env') && name !== '.env.example')) {
  const values = dotenv.parse(fs.readFileSync(path.join(front,name)));
  for (const key of Object.keys(values)) if (/^VITE_.*(SECRET|PASSWORD|DB_CONNECT|JWT)/i.test(key)) violations.push('Private variable in frontend env: ' + key);
}
if (violations.length) { console.error(violations.join(String.fromCharCode(10))); process.exitCode = 1; }
else console.log('PASS: no configured backend secrets found in project source or build output; no private frontend variables.');
