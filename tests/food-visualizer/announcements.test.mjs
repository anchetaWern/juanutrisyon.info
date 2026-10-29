import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resultAnnouncement } from '../../src/features/food-visualizer/announcements.js'
import { calculateFood } from '../../src/vendor/jn-nutrition-core/index.mjs'
import { sugarComparison } from '../../src/features/food-visualizer/sugarComparison.js'
const cola = sugarComparison({type:{slug:'prepared-and-processed'}},{status:'ready',reference:{sugar:24.44}})
const captured = async key => JSON.parse(await readFile(new URL(`./fixtures/captured/${key}.json`, import.meta.url)))
const synthetic = nutrients => calculateFood({ serving_size: 100, serving_size_unit: 'g', nutrients }, 100, 'g')
test('announcements reuse the portion values and qualified weight equivalents across lenses', async () => {
 const rice = calculateFood(await captured('rice'), 40, 'g')
 assert.match(resultAnnouncement('sugar', rice, cola), /Total sugar: 0.04 g.*<0.01 glasses of cola.*260 g.*does not estimate added sugar/)
 assert.match(resultAnnouncement('sodium', rice), /Sodium: 1.2 mg.*<0.01 g salt-equivalent.*not salt added/)
 assert.match(resultAnnouncement('saturated-fat', rice), /Saturated fat: 0.02 g.*0.1% Daily Value.*Low.*20 g saturated fat/)
 assert.match(resultAnnouncement('carbohydrates', rice, {status:'ready', reference:{carbs:23.76}}), /11.88 g.*0.5 reference rice servings.*not equivalent health effects/)
})
test('missing and partial nutrients cannot be announced as zero or complete totals', async () => {
 const recipe = await captured('recipe'), result = calculateFood(recipe, 377, 'g')
 for (const lens of ['sugar', 'saturated-fat', 'carbohydrates']) {
  const text = resultAnnouncement(lens, result)
  assert.match(text, /Data not available/);assert.match(text, /unavailable/)
 }
 assert.match(resultAnnouncement('sugar', synthetic([])), /Data not available.*Sugar comparison unavailable/)
})
test('zero, inconsistent fat and missing reference have distinct announcements', () => {
 const zero = synthetic([{name:'sugar',amount:0,unit:'g'},{name:'total fat',amount:0,unit:'g',composition:[{name:'saturated fat',amount:0,unit:'g'}]}])
 assert.match(resultAnnouncement('sugar',zero,cola), /Total sugar: 0 g.*0 glasses of cola/)
 assert.match(resultAnnouncement('saturated-fat',zero), /0% Daily Value.*Low/)
 const invalid = synthetic([{name:'total fat',amount:1,unit:'g',composition:[{name:'saturated fat',amount:2,unit:'g'}]}])
 assert.match(resultAnnouncement('saturated-fat',invalid), /exceeds total fat; Daily Value percentage unavailable/)
 const carbs = synthetic([{name:'total carbohydrates',amount:20,unit:'g'}])
 assert.match(resultAnnouncement('carbohydrates',carbs,{status:'loading'}), /20 g.*Rice comparison unavailable/)
 assert.equal(resultAnnouncement('unknown',carbs),'')
})

test('sodium announces salt grams and the distinct 5 g teaspoon definition', () => {
 for (const [mg,pattern] of [[800,/2 g salt-equivalent.*0.4 teaspoon equivalents/],
  [2000,/5 g salt-equivalent.*1 teaspoon equivalent of salt/],
  [4000,/10 g salt-equivalent.*2 teaspoon equivalents/],[0,/0 g salt-equivalent.*0 teaspoon equivalents/]]) {
  const text=resultAnnouncement('sodium',synthetic([{name:'sodium',amount:mg,unit:'mg'}]))
  assert.match(text,pattern);assert.match(text,/not salt added.*5 g salt/)
 }
 assert.match(resultAnnouncement('sodium',synthetic([{name:'sodium',amount:1,unit:'mg'}])), /<0.01 teaspoon equivalents/)
 assert.match(resultAnnouncement('sodium',synthetic([])), /teaspoon equivalent unavailable/)
})

test('saturated-fat announcements retain uncapped DV and band without a total-fat denominator',()=>{
 const fat=grams=>synthetic([{name:'saturated fat',amount:grams,unit:'g'}])
 assert.match(resultAnnouncement('saturated-fat',fat(30)),/150% Daily Value.*High.*Above the Daily Value reference/)
 assert.match(resultAnnouncement('saturated-fat',fat(1.02)),/5.1% Daily Value.*Mid-range/)
 assert.match(resultAnnouncement('saturated-fat',fat(1)),/5% Daily Value.*Low/)
})
