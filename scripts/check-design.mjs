import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const sheets=['src/style.css','src/observatory.css'];
for(const file of sheets){
 const source=readFileSync(file,'utf8');
 assert.ok(!/#[0-9a-f]{3,8}\b|\brgba?\(/i.test(source),`${file}: use semantic color tokens`);
 assert.ok(!/grid-template-columns\s*:\s*(?:repeat\(3,\s*1fr\)|1fr\s+1fr\s+1fr)/.test(source),`${file}: no equal three-column layout`);
 assert.ok(!/\b(?:purple|indigo|blueviolet)\b/i.test(source),`${file}: no prohibited UI palette`);
}
const tokens=readFileSync('src/tokens.css','utf8');
assert.ok(!/--(?:bg|surface)\s*:\s*#(?:000000|ffffff|000|fff)\s*;/i.test(tokens),'Use tinted base surfaces');
const definitions=new Set([...tokens.matchAll(/(--[\w-]+)\s*:/g)].map(m=>m[1]));
definitions.add('--entry-delay'); // Per-card runtime value supplied by main.js.
definitions.add('--rz'); // Per-exhibit decorative angle defined in observatory.css.
for(const file of sheets){for(const match of readFileSync(file,'utf8').matchAll(/var\((--[\w-]+)\)/g)){assert.ok(definitions.has(match[1]),`Undefined token ${match[1]} in ${file}`)}}
console.log('Design checks passed: semantic colors, defined tokens, tinted surfaces, asymmetric layout.');
