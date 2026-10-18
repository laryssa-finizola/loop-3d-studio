/**
 * Pré-renderiza a página: insere o HTML do React em dist/index.html para que
 * o conteúdo apareça antes do JavaScript carregar (e para buscadores).
 */
import { readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const ssrDir = path.join(root, 'dist-ssr');

const { render } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href);
const file = path.join(dist, 'index.html');
const template = await readFile(file, 'utf8');

if (!template.includes('<!--app-html-->')) {
  throw new Error('Marcador <!--app-html--> não encontrado em dist/index.html.');
}

await writeFile(file, template.replace('<!--app-html-->', render()));
await rm(ssrDir, { recursive: true, force: true });
console.log('✓ HTML pré-renderizado em dist/index.html');
