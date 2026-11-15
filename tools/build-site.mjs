// A forrásból (edzesnaplo.html) elkészíti a weboldalt (docs/index.html),
// és frissíti a service worker verzióját, hogy a telefonok megkapják az új változatot.
import { readFileSync, writeFileSync } from 'node:fs';
const root = new URL('..', import.meta.url);

const swUrl = new URL('docs/sw.js', root);
const ver = new Date().toISOString().replace(/\D/g, '').slice(0, 12);
const nice = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
writeFileSync(new URL('docs/index.html', root), readFileSync(new URL('edzesnaplo.html', root), 'utf8').replace("'build __BUILD__'", `'${nice}'`));
writeFileSync(swUrl, readFileSync(swUrl, 'utf8').replace(/const VER = 'gym-[^']*';/, `const VER = 'gym-${ver}';`));
writeFileSync(new URL('docs/version.json', root), JSON.stringify({ v: nice }));
console.log('docs/index.html kész, sw verzió: gym-' + ver);
