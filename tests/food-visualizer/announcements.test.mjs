import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resultAnnouncement } from '../../src/features/food-visualizer/announcements.js'
import { calculateFood } from '../../src/vendor/jn-nutrition-core/index.mjs'
const captured = async key => JSON.parse(await readFile(new URL(`./fixtures/captured/${key}.json`, import.meta.url)))
const synthetic = nutrients => calculateFood({ serving_size: 100, serving_size_unit: 'g', nutrients }, 100, 'g')
test('announcements reuse the portion values and qualified weight equivalents across lenses', async () => {
 const rice = calculateFood(await captured('rice'), 40, 'g')
 assert.match(resultAnnouncement('sugar', rice), /Total sugar: 0.04 g.*<0.01 five-gram.*not packets added/)
 assert.match(resultAnnouncement('sodium', rice), /Sodium: 1.2 mg.*<0.01 g salt-equivalent.*not salt added/)
 assert.match(resultAnnouncement('saturated-fat', rice), /Saturated fat: 0.02 g.*Total fat: 0.08 g.*25%/)
 assert.match(resultAnnouncement('carbohydrates', rice, {status:'ready', reference:{carbs:23.76}}), /11.88 g.*0.5 reference rice servings.*not equivalent health effects/)
})
test('missing and partial nutrients cannot be announced as zero or complete totals', async () => {
 const recipe = await captured('recipe'), result = calculateFood(recipe, 377, 'g')
 for (const lens of ['sugar', 'saturated-fat', 'carbohydrates']) {
  const text = resultAnnouncement(lens, result)
  assert.match(text, /Data not available/);assert.match(text, /unavailable/)
 }
 assert.match(resultAnnouncement('sugar', synthetic([])), /Data not available.*Packet equivalent unavailable/)
})
test('zero, inconsistent fat and missing reference have distinct announcements', () => {
 const zero = synthetic([{name:'sugar',amount:0,unit:'g'},{name:'total fat',amount:0,unit:'g',composition:[{name:'saturated fat',amount:0,unit:'g'}]}])
 assert.match(resultAnnouncement('sugar',zero), /Total sugar: 0 g.*0 five-gram/)
 assert.match(resultAnnouncement('saturated-fat',zero), /Zero total fat; share unavailable/)
 const invalid = synthetic([{name:'total fat',amount:1,unit:'g',composition:[{name:'saturated fat',amount:2,unit:'g'}]}])
 assert.match(resultAnnouncement('saturated-fat',invalid), /exceeds total fat; share unavailable/)
 const carbs = synthetic([{name:'total carbohydrates',amount:20,unit:'g'}])
 assert.match(resultAnnouncement('carbohydrates',carbs,{status:'loading'}), /20 g.*Rice comparison unavailable/)
 assert.equal(resultAnnouncement('unknown',carbs),'')
})
