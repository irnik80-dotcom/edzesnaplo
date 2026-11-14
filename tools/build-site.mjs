// A forrásból (edzesnaplo.html) elkészíti a weboldalt (docs/index.html),
// és frissíti a service worker verzióját, hogy a telefonok megkapják az új változatot.
import { readFileSync, writeFileSync } from 'node:fs';
const root = new URL('..', import.meta.url);
writeFileSync(new URL('docs/index.html', root), readFileSync(new URL('edzesnaplo.html', root), 'utf8'));
const swUrl = new URL('docs/sw.js', root);
const ver = new Date().toISOString().replace(/\D/g, '').slice(0, 12);
writeFileSync(swUrl, readFileSync(swUrl, 'utf8').replace(/const VER = 'gym-[^']*';/, `const VER = 'gym-${ver}';`));
console.log('docs/index.html kész, sw verzió: gym-' + ver);
