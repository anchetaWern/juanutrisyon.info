import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { onRequest } from '../../functions/[[path]].js'

const origin = 'https://preview.example.com'
const path = '/tools/food-visualizer'
const html = '<!doctype html><html lang="en"><head><title>Food Visualizer</title></head><body><main><h1 lang="fil">Ano’ng Nasa Pagkain Ko?</h1><p>Total sugar and sodium</p><a href="/data-methodology">Sources</a><script>PRIVATE_SCRIPT</script></main></body></html>'
async function request(pathname, accept = 'text/html', status = 200) {
  return onRequest({ request: new Request(origin + pathname, { headers: { Accept: accept } }),
    next: async () => new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', Vary: 'Accept-Encoding' } }) })
}
async function mcp(name) {
  return (await (await onRequest({ request: new Request(origin + '/mcp', { method: 'POST',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name } }) }) })).json()).result.content[0].text
}

test('public discovery and MCP list the same nested visualizer URL on the serving origin', async () => {
  const data = await (await request('/api/discovery')).json()
  assert.equal(data.tools.filter(tool => tool.name === 'food-visualizer').length, 1)
  assert.equal(data.tools.find(tool => tool.name === 'food-visualizer').url, origin + path)
  assert.equal(data.pages.filter(page => page.url === origin + path).length, 1)
  assert.match(await mcp('list_site_pages'), /https:\/\/preview\.example\.com\/tools\/food-visualizer/)
  assert.match(await mcp('get_site_overview'), /Food Visualizer/)
  assert.deepEqual(JSON.parse(await mcp('get_discovery_resources')), data)
})

test('visualizer skill is discoverable, retrievable and has a matching content digest', async () => {
  const index = await (await request('/.well-known/agent-skills/index.json')).json()
  const skill = index.skills.find(skill => skill.name === 'explore-food-nutrients')
  assert(skill)
  const response = await request(new URL(skill.url).pathname)
  const body = await response.text()
  assert.match(body, /Total sugar is not necessarily added sugar/)
  assert(body.includes(origin + path))
  assert.equal(createHash('sha256').update(body).digest('hex'), skill.sha256)
})

test('HTML responses preserve their content and append Accept to Vary', async () => {
  const response = await request(path + '?utm_source=qa')
  assert.equal(response.status, 200)
  assert.equal(await response.text(), html)
  assert.equal(response.headers.get('vary'), 'Accept-Encoding, Accept')
  assert.match(response.headers.get('link'), /api-catalog/)
})

test('Markdown conversion keeps heading, absolute links and status with Accept variation', async () => {
  const response = await request(path + '?utm_source=qa', 'text/markdown', 404)
  const body = await response.text()
  assert.equal(response.status, 404)
  assert.match(response.headers.get('content-type'), /^text\/markdown/)
  assert.equal(response.headers.get('vary'), 'Accept')
  assert(Number(response.headers.get('x-markdown-tokens')) > 0)
  assert(body.includes('# Ano’ng Nasa Pagkain Ko?'))
  assert(body.includes('[Sources](https://preview.example.com/data-methodology)'))
  assert(!body.includes('PRIVATE_SCRIPT'))
})

test('negotiation respects explicit rejection and preference for HTML', async () => {
  for (const accept of ['text/html', '*/*', 'text/markdown;q=0', 'text/html, text/markdown;q=0.5', 'text/markdown;q=invalid']) {
    const response = await request(path, accept)
    assert.match(response.headers.get('content-type'), /^text\/html/, accept)
  }
  assert.match((await request(path, 'text/html;q=0.5, text/markdown')).headers.get('content-type'), /^text\/markdown/)
})

test('API docs negotiate HTML/Markdown with Vary and link to the visualizer', async () => {
  for (const accept of ['text/html', 'text/markdown']) {
    const response = await request('/docs/api', accept)
    assert.equal(response.headers.get('vary'), 'Accept')
    assert((await response.text()).includes(origin + path))
  }
})
