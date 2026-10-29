import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import * as core from '../../src/vendor/jn-nutrition-core/index.mjs';
import { readExport, validateExport, sha256, publicExports, vendorDir } from '../../scripts/update-nutrition-core.mjs';

const captured = key => readFile(new URL(`./fixtures/captured/${key}.json`, import.meta.url), 'utf8').then(JSON.parse);
const nutrient = (food, amount, unit, id) => core.findNutrient(core.calculateFood(food, amount, unit).nutrients, id);
const freeze = object => {
  if (object && typeof object === 'object' && !Object.isFrozen(object)) {
    Object.freeze(object); Object.values(object).forEach(freeze);
  }
  return object;
};

test('vendored artifact integrity, narrow exports and recorded source provenance', async () => {
  const { manifest } = await readExport(vendorDir);
  assert.deepEqual(Object.keys(core).sort(), publicExports);
  assert.equal(manifest.build.target, 'es2022');
});

test('tampered artifacts, missing provenance, dirty-source omissions and extra dependencies fail validation', async () => {
  const { code, manifest } = await readExport(vendorDir);
  assert.throws(() => validateExport(Buffer.concat([code, Buffer.from('\n')]), manifest), /checksum/);
  for (const dependency of ['\nimport "vue";', '\nvoid import("vue");', '\nexport * from "vue";']) {
    const injected = Buffer.concat([code, Buffer.from(dependency)]);
    const edited = structuredClone(manifest);
    edited.distribution.sha256 = sha256(injected); edited.distribution.bytes = injected.length;
    assert.throws(() => validateExport(injected, edited), /self-contained/);
  }
  for (const mutate of [
    value => { value.source.files = []; },
    value => { value.source.files[0].path = '../outside'; },
    value => { value.source.dirty = true; value.source.files[0].git_status = ' M modified'; value.source.dirty_source_recorded = false; },
    value => { value.distribution.imports = ['vue']; },
    value => { value.distribution.rendered_modules.push('src/helpers/calculation/references.js'); },
    value => { value.distribution.exports.push('classifyIntake'); },
    value => { value.contract_version = 'unsupported'; },
  ]) {
    const edited = structuredClone(manifest); mutate(edited);
    assert.throws(() => validateExport(code, edited));
  }
});

test('captured fixture hashes still match Phase 1 evidence', async () => {
  const manifest = JSON.parse(await readFile(new URL('./fixtures/manifest.json', import.meta.url)));
  for (const key of ['rice', 'pandesal', 'mango', 'patis', 'coke', 'gata', 'recipe']) {
    const capture = manifest.captures.find(row => row.key === key);
    assert.equal(sha256(await readFile(new URL(`./fixtures/${capture.file}`, import.meta.url))), capture.sanitized_sha256);
  }
});

test('rice household grams use the canonical calculator at full precision', async () => {
  const rice = freeze(await captured('rice'));
  const option = rice.serving_profile.options.find(row => row.id === 206);
  const measure = core.normalizeHouseholdMeasure({ quantity: 1, weight_in_grams: option.gram_weight });
  assert.equal(measure.weight_grams, 80);
  assert.equal(core.exactValue(nutrient(rice, measure.weight_grams, 'g', 'total carbohydrates')), 29.7 * (80 / 100));
});

test('volume bases and explicit zero survive; grams need density evidence', async () => {
  const coke = freeze(await captured('coke'));
  assert.equal(core.exactValue(nutrient(coke, 120, 'mL', 'sodium')), 12.5);
  assert.equal(core.exactValue(nutrient(coke, 240, 'mL', 'saturated fat')), 0);
  assert.equal(core.exactValue(nutrient(coke, 120, 'g', 'sodium')), null);
  assert.equal(core.exactValue(nutrient(coke, 1, 'can', 'sodium')), null);
  // The captured Coke record has duplicate canonical carbohydrate parents.
  // Keep their nested sugar invalid; never silently deduplicate the raw API data.
  const sugar = nutrient(coke, 120, 'mL', 'sugar');
  assert.equal(core.exactValue(sugar), null);
  assert.equal(sugar.source[0].reason, 'duplicate_ancestor_path');
  const gata = freeze(await captured('gata'));
  assert.equal(core.exactValue(nutrient(gata, 50, 'mL', 'saturated fat')), 8.75);
});

test('patis omitted sugar stays absent and recipe sugar stays partial', async () => {
  const patis = freeze(await captured('patis'));
  assert.equal(nutrient(patis, 15, 'g', 'sugar'), null);
  const recipe = freeze(await captured('recipe'));
  const sugar = nutrient(recipe, 377, 'g', 'sugar');
  assert.equal(sugar.coverage, 'partial');
  assert.equal(sugar.value, null);
  assert.equal(core.exactValue(sugar), null);
  assert(sugar.known_subtotal > 0);
});

test('USDA and Open Food Facts import guards remain active in standalone delivery', () => {
  const food = { serving_size: 100, serving_size_unit: 'g', data_source: 'usda_fdc',
    nutrients: [{ name: 'sugar', amount: 0, unit: 'g' }] };
  assert.equal(nutrient(food, 100, 'g', 'sugar').source[0].reason, 'unverified_import_zero');
  const normalized = { ...food, source_metadata: { import_normalization: {
    version: 'usda-v1', basis: { amount: 100, unit: 'g' }, nutrients: food.nutrients,
  } } };
  assert.equal(core.exactValue(nutrient(freeze(normalized), 100, 'g', 'sugar')), 0);
  assert.equal(nutrient({ ...food, data_source: 'openfoodfacts' }, 100, 'g', 'sugar').source[0].reason, 'unverified_import_basis');
});
