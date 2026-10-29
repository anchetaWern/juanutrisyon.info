// Explicit read-only source checkout argument; not needed by production builds.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createPortionState, nutrientSummary } from '../src/features/food-visualizer/portions.js'
const app = resolve(process.argv[2] ?? '')
assert(process.argv[2], 'Supply the explicit Nuxt app checkout path')
const { createServer } = await import(pathToFileURL(resolve(app,'node_modules/vite/dist/node/index.js')).href)
const server = await createServer({root:app,configFile:false,cacheDir:'/private/tmp/jn-phase5-vite',
 resolve:{alias:{'@':resolve(app,'src')}},server:{middlewareMode:true,hmr:false,watch:{ignored:['**/*']}}})
try {
 const source = await server.ssrLoadModule('/src/helpers/calculation/feature.js')
 const { buildNutrientRow } = await server.ssrLoadModule('/src/composables/useNutrientRows.js')
 let selections=0, comparisons=0
 const differences=[]
 const findDisplay = (nodes,id) => {
  for(const node of nodes??[]) {if(node.name===id)return node;const nested=findDisplay(node.composition,id);if(nested)return nested}
  return null
 }
 for(const key of ['rice','pandesal','mango','patis','coke','gata','recipe']) {
  const food=JSON.parse(await readFile(new URL(`../tests/food-visualizer/fixtures/captured/${key}.json`,import.meta.url)))
  const model=createPortionState();model.setFood(food)
  for(const option of model.state.options) for(const quantity of [0.375,1,1.5,2]) {
   model.setQuantity(quantity);model.setOption(option.key)
   const {amount,unit}=model.state.selection
   const calculated=source.calculateFood(food,amount,unit)
   assert.deepEqual(model.state.result,calculated,`${key}: source/artifact exact result`)
   // Food Details pre-normalizes at source basis, then its actual table helper
   // scales display nodes for the selected source-unit amount.
   const displayed=source.displayNutrients(source.calculateFood(food,food.serving_size).nutrients)
   for(const field of nutrientSummary(model.state.result)) {
    const node=findDisplay(displayed,field.id)
    const row=node?buildNutrientRow(node,displayed,{originalServingSize:food.serving_size,
     servingSizeUnit:food.serving_size_unit,newServingSize:amount,displayValuesPerContainer:false,
     recommended_daily_values:{},getValueColor:()=>null}):null
    const actual=row?.total_amount??null
    comparisons++
    if(!Object.is(actual,field.value)) {
     if(actual!==null&&field.value!==null&&Math.abs(actual-field.value)<=1e-12*Math.max(1,Math.abs(actual),Math.abs(field.value))) {
      differences.push({food:key,option:option.key,quantity,nutrient:field.id,table:actual,canonical:field.value,kind:'floating_point_operation_order'})
     } else assert.equal(actual,field.value,`${key}: Food Details table ${field.id} at ${amount} ${unit}`)
    }
   }
   selections++
  }
 }
 console.log(JSON.stringify({sourceArtifactExact:true,selections,foodDetailsFieldComparisons:comparisons,tableRoundingOrderDifferences:differences},null,2))
} finally { await server.close() }
