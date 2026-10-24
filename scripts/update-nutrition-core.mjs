import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { isAbsolute, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseAst } from 'vite';

export const vendorDir = fileURLToPath(new URL('../src/vendor/jn-nutrition-core/', import.meta.url));
export const publicExports = ['calculateFood', 'convertEdibleWeight', 'exactValue', 'findNutrient', 'isExact',
  'normalizeBasis', 'normalizeDensity', 'normalizeHouseholdMeasure', 'parseAmount'];
const renderedAllowlist = new Set(['src/helpers/RecipeCooking.js',
  ...['feature', 'numbers', 'units', 'basis', 'source', 'nutrients', 'adapters', 'aggregate', 'occurrences']
    .map(name => `src/helpers/calculation/${name}.js`)]);
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

// Integrity validation of a reviewed local export, not a signature/trust boundary.
export function validateExport(code, manifest) {
  assert.equal(manifest.contract_version, 'jn-nutrition-core-1', 'Unsupported calculator contract');
  assert.equal(manifest.source.repository, 'nuxt-juanutrisyon');
  assert.match(manifest.source.commit, /^[a-f0-9]{40}$/);
  assert(manifest.source.files.length > 0, 'Missing source hashes');
  const paths = new Set();
  for (const file of manifest.source.files) {
    assert(typeof file.path === 'string' && !isAbsolute(file.path) && !file.path.split(/[\\/]/).includes('..'), 'Invalid source path');
    assert(!paths.has(file.path), 'Duplicate source path'); paths.add(file.path);
    assert.match(file.sha256, /^[a-f0-9]{64}$/);
    assert(typeof file.git_status === 'string' && file.git_status.length > 0, 'Missing source status');
  }
  assert.equal(manifest.source.dirty, manifest.source.files.some(file => file.git_status !== 'clean'));
  assert(!manifest.source.dirty || manifest.source.dirty_source_recorded === true, 'Unrecorded dirty source');
  const dist = manifest.distribution;
  assert.equal(dist.file, 'index.mjs');
  assert.equal(sha256(code), dist.sha256, 'Artifact checksum mismatch');
  assert.equal(Buffer.byteLength(code), dist.bytes, 'Artifact byte count mismatch');
  assert.deepEqual(dist.exports, publicExports);
  assert.deepEqual(dist.imports, []); assert.deepEqual(dist.dynamic_imports, []);
  assert(dist.rendered_modules.length > 0 && dist.rendered_modules.every(path => renderedAllowlist.has(path)), 'Unexpected runtime dependency');
  assert(dist.rendered_modules.includes('src/helpers/RecipeCooking.js'), 'Missing recipe dependency');
  for (const path of [...dist.rendered_modules, 'src/exports/nutrition-core.js',
    'vite.nutrition-core.config.js', 'scripts/build-nutrition-core.mjs', 'package.json', 'package-lock.json']) {
    assert(paths.has(path), `Missing source hash: ${path}`);
  }
  const text = code.toString();
  assert(text.startsWith('// Generated jn-nutrition-core-1; do not edit.'), 'Missing generated banner');
  const exportedNames = [];
  function visit(value) {
    if (!value || typeof value !== 'object') return;
    assert(!['ImportDeclaration', 'ImportExpression', 'ExportAllDeclaration'].includes(value.type), 'Artifact must be self-contained');
    assert(!(value.type === 'CallExpression' && value.callee?.name === 'require'), 'Artifact must be self-contained');
    if (value.type === 'ExportNamedDeclaration') {
      assert(!value.source && !value.declaration, 'Expected only local named exports');
      exportedNames.push(...value.specifiers.map(item => item.exported.name));
    }
    assert(value.type !== 'ExportDefaultDeclaration', 'Unexpected default export');
    for (const child of Object.values(value)) {
      if (Array.isArray(child)) child.forEach(visit);
      else if (child && typeof child === 'object') visit(child);
    }
  }
  visit(parseAst(text));
  assert.deepEqual(exportedNames.sort(), publicExports);
  assert(!/classifyIntake|dailyPercentage|getDailyReferenceSet|REFERENCE_SNAPSHOT|snapshot_id/.test(text), 'Clinical reference payload');
  return manifest;
}

export async function readExport(directory) {
  const [code, manifestBytes] = await Promise.all(['index.mjs', 'manifest.json'].map(file => readFile(resolve(directory, file))));
  const manifest = validateExport(code, JSON.parse(manifestBytes));
  return { code, manifestBytes, manifest };
}

async function main(args) {
  const check = args[0] === '--check';
  if (check) args.shift();
  assert(args.length <= 1 && !args[0]?.startsWith('--'), 'Usage: node scripts/update-nutrition-core.mjs [--check] [explicit-export-directory]');
  assert(check || args[0], 'Supply an explicit app export directory to update; --check validates the vendored copy');
  const input = await readExport(args[0] ? resolve(args[0]) : vendorDir);
  if (check) {
    const local = await readExport(vendorDir);
    assert(input.code.equals(local.code) && input.manifestBytes.equals(local.manifestBytes), 'Vendored artifact differs from supplied export');
  } else {
    await mkdir(vendorDir, { recursive: true });
    await writeFile(resolve(vendorDir, 'index.mjs'), input.code);
    await writeFile(resolve(vendorDir, 'manifest.json'), input.manifestBytes);
  }
  console.log(`${check ? 'Verified' : 'Updated'} ${input.manifest.contract_version}: ${input.manifest.distribution.sha256}`);
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  await main(process.argv.slice(2));
}
