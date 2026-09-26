// Assemble le jeu en un seul fichier HTML jouable hors ligne :
// labyrinthe/jeu/src/page.html + labyrinthe/jeu/src/*.js (ordre des préfixes numériques).
// Usage : node labyrinthe/outils/construire.mjs [--verifier]
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(racine, 'jeu', 'src');
const fichiers = readdirSync(src).filter(f => /^\d\d_.*\.js$/.test(f)).sort();
let code = '';
for (const f of fichiers) code += `\n// ─── ${f} ───\n` + readFileSync(join(src, f), 'utf8').replace(/^if \(typeof module[^\n]*\n?/m, '');
const page = readFileSync(join(src, 'page.html'), 'utf8');
const script = `(function(){'use strict';\n${code}\n})();`;
// Vérification syntaxique avant écriture
try { new Function(script); } catch (e) { console.error('Erreur de syntaxe dans le jeu assemblé :', e.message); process.exit(1); }
const sortie = page.replace('/*__SCRIPT__*/', () => script);
writeFileSync(join(racine, 'jeu', 'index.html'), sortie);
console.log(`jeu/index.html : ${fichiers.length} modules, ${(sortie.length / 1024).toFixed(0)} Kio`);
