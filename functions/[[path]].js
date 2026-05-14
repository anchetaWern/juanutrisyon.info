const CONTENT_SIGNAL = 'ai-train=no, search=yes, ai-input=yes';
const SITE_NAME = 'Juan Nutrisyon';
const APP_URL = 'https://app.juanutrisyon.info';
const CONTRIBUTOR_URL = 'https://contribute.juanutrisyon.info';
const API_PREFIX = '/api';
const SITE_PAGES = [
  {
    slug: '',
    title: 'Home',
    path: '/',
    summary: 'Landing page introducing Juan Nutrisyon, its public tools, and recent nutrition content.'
  },
  {
    slug: 'about',
    title: 'About',
    path: '/about',
    summary: 'The story, mission, and localized nutrition data approach behind Juan Nutrisyon.'
  },
  {
    slug: 'guide',
    title: 'User Guide',
    path: '/guide',
    summary: 'Instructions for searching foods, creating recipes, and tracking daily nutrition.'
  },
  {
    slug: 'contact',
    title: 'Contact',
    path: '/contact',
    summary: 'Support contact details and official social channels for Juan Nutrisyon.'
  },
  {
    slug: 'terms',
    title: 'Terms and Conditions',
    path: '/terms',
    summary: 'Terms of service, medical disclaimer, data accuracy notes, and service limitations.'
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    path: '/privacy',
    summary: 'Privacy practices covering personal data, nutrition-related data, cookies, and retention.'
  },
  {
    slug: 'blog',
    title: 'Blog',
    path: '/blog',
    summary: 'Index of Juan Nutrisyon articles on Filipino nutrition, food literacy, and healthier habits.'
  }
];

const BLOG_POSTS = [
  {
    slug: 'busog-pero-kulang-why-feeling-full-doesnt-mean-youre-nourished',
    title: 'Busog Pero Kulang',
    summary:
      'A practical look at hidden hunger, why being full is not the same as being nourished, and how to improve a simple rice meal without spending more.'
  },
  {
    slug: 'hidden-sugar-in-common-filipino-foods',
    title: 'Hidden Sugar in Common Filipino Foods',
    summary:
      'A practical guide to the sweeteners hiding in tocino, spaghetti, 3-in-1 coffee, bottled bagoong, and fruit juices that seem healthier than they are.'
  },
  {
    slug: 'carinderia-survival-guide-healthy-choices',
    title: 'Carinderia Survival Guide',
    summary:
      'Practical ways to eat better at your neighborhood turo-turo without giving up budget, convenience, or familiar Filipino flavors.'
  },
  {
    slug: 'why-filipino-food-is-high-in-sodium',
    title: 'Why Filipino Food Is High in Sodium',
    summary:
      'A closer look at how preservation, condiments, and modern pantry staples made salty flavors a defining part of Filipino food.'
  },
  {
    slug: 'sana-all-may-label',
    title: 'Sana All May Label',
    summary:
      "A Filipino guide to reading nutrition facts, from instant noodles to 3-in-1 coffee and canned fish, so you actually know what's on your plate."
  },
  {
    slug: 'healthy-eating-on-a-budget',
    title: 'Healthy Eating on a Budget',
    summary:
      "Proof that healthy eating doesn't need to be expensive, with practical tips, a daily budget breakdown, and recipes you can cook this week."
  },
  {
    slug: 'common-nutrition-mistakes-filipinos-make',
    title: 'Common Nutrition Mistakes Filipinos Make',
    summary:
      'A practical look at common Filipino nutrition myths, from softdrinks and eggs to exercise rewards, fruit juice, and meal skipping.'
  },
  {
    slug: 'is-using-asin-a-sin',
    title: 'Is Using Asin a Sin',
    summary:
      'A clear, no-guilt look at salt in Filipino cooking, how much is too much, and easy swaps that still keep your food flavorful.'
  },
  {
    slug: 'natures-hidden-pantry',
    title: "Nature's Hidden Pantry",
    summary:
      'Rediscover native Philippine superfoods, foraged ingredients, and sustainable food traditions that support nutrition, culture, and biodiversity.'
  }
];

function buildSkillDefinitions(origin) {
  return [
    {
      slug: 'search-foods',
      name: 'search-foods',
      type: 'local',
      description:
        'Navigate agents to the public Juan Nutrisyon food search experience when the user wants nutrient information for Filipino foods.',
      body: `---
name: search-foods
description: Open the Juan Nutrisyon food search when the user wants nutrient information for Filipino foods or ingredients.
---

Use this skill when an agent should take the user to the public food search experience.

## Steps

1. Open ${APP_URL}.
2. Ask the user for the food or ingredient name if it is missing.
3. Use the search UI to find the closest Filipino food match.
4. Summarize the key nutrients or guide the user to the full food page.
`
    },
    {
      slug: 'build-recipes',
      name: 'build-recipes',
      type: 'local',
      description:
        'Navigate agents to the recipe builder when the user wants a combined nutrient breakdown for multiple ingredients.',
      body: `---
name: build-recipes
description: Open the Juan Nutrisyon recipe builder when the user wants combined nutrient totals for a homemade recipe.
---

Use this skill when the user has multiple ingredients and wants a combined nutrition estimate.

## Steps

1. Open ${APP_URL}/recipe.
2. Add each ingredient with the closest matching food entry and quantity.
3. Review the combined nutrient totals.
4. Share the result or suggest edits to improve the recipe profile.
`
    },
    {
      slug: 'analyze-diet',
      name: 'analyze-diet',
      type: 'local',
      description:
        'Navigate agents to the food diary when the user wants to review daily intake and nutritional gaps.',
      body: `---
name: analyze-diet
description: Open the Juan Nutrisyon food diary when the user wants to review daily intake, excesses, or nutrient gaps.
---

Use this skill when the user wants to analyze meals across the day instead of a single food or recipe.

## Steps

1. Open ${APP_URL}/diary.
2. Add or review meals for the day.
3. Compare totals against the nutrient targets shown in the app.
4. Highlight likely shortages or excesses in plain language.
`
    },
    {
      slug: 'browse-nutrition-guides',
      name: 'browse-nutrition-guides',
      type: 'local',
      description:
        'Use the public Juan Nutrisyon blog when the user wants practical Filipino nutrition education and local context.',
      body: `---
name: browse-nutrition-guides
description: Browse the public Juan Nutrisyon blog when the user wants practical Filipino nutrition education, food literacy, or local context.
---

Use this skill when the task is informational and best answered by an article instead of the app tools.

## Steps

1. Open ${origin}/blog.
2. Match the user's topic to the closest article.
3. Prefer practical guidance grounded in Filipino meals and pantry staples.
4. Link the article and summarize the key takeaways.
`
    }
  ];
}

function buildLinkHeader(origin) {
  return [
    `<${origin}/.well-known/api-catalog>; rel="api-catalog"`,
    `<${origin}/docs/api>; rel="service-doc"`,
    `<${origin}/openapi.json>; rel="service-desc"`,
    `<${origin}/.well-known/agent-skills/index.json>; rel="service-meta"`
  ].join(', ');
}

function buildApiCatalog(origin) {
  return {
    linkset: [
      {
        anchor: `${origin}${API_PREFIX}`,
        'service-desc': [
          {
            href: `${origin}/openapi.json`,
            type: 'application/openapi+json'
          }
        ],
        'service-doc': [
          {
            href: `${origin}/docs/api`,
            type: 'text/html'
          }
        ],
        status: [
          {
            href: `${origin}/api/status`,
            type: 'application/json'
          }
        ],
        'service-meta': [
          {
            href: `${origin}/.well-known/mcp/server-card.json`,
            type: 'application/json'
          },
          {
            href: `${origin}/.well-known/agent-skills/index.json`,
            type: 'application/json'
          }
        ]
      }
    ]
  };
}

function buildOpenApiSpec(origin) {
  return {
    openapi: '3.1.0',
    info: {
      title: 'Juan Nutrisyon Public Discovery API',
      version: '1.0.0',
      description:
        'Read-only endpoints that help agents discover Juan Nutrisyon public resources, content, and operational status.'
    },
    servers: [
      {
        url: origin
      }
    ],
    paths: {
      '/api/status': {
        get: {
          summary: 'Get service status',
          operationId: 'getStatus',
          responses: {
            '200': {
              description: 'Service status information.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string' },
                      service: { type: 'string' },
                      version: { type: 'string' },
                      generatedAt: { type: 'string', format: 'date-time' }
                    },
                    required: ['status', 'service', 'version', 'generatedAt']
                  }
                }
              }
            }
          }
        }
      },
      '/api/discovery': {
        get: {
          summary: 'List app, content, and discovery resources',
          operationId: 'getDiscovery',
          responses: {
            '200': {
              description: 'Discovery links for the public site.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      site: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          url: { type: 'string', format: 'uri' }
                        },
                        required: ['name', 'url']
                      },
                      tools: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
                            url: { type: 'string', format: 'uri' }
                          },
                          required: ['name', 'url']
                        }
                      }
                    },
                    required: ['site', 'tools']
                  }
                }
              }
            }
          }
        }
      }
    }
  };
}

function buildApiDocsHtml(origin) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Juan Nutrisyon API Discovery</title>
    <meta name="description" content="Public discovery endpoints for Juan Nutrisyon and AI-agent integrations.">
    <style>
      :root {
        color-scheme: light;
        --bg: #f6f3ea;
        --surface: #fffdf8;
        --border: #dbcdb4;
        --ink: #1f2a1f;
        --muted: #5e6b5e;
        --accent: #2f7a4f;
      }
      body {
        margin: 0;
        font-family: Georgia, "Times New Roman", serif;
        background: linear-gradient(180deg, #f3efe3 0%, #fbf9f3 100%);
        color: var(--ink);
      }
      main {
        max-width: 760px;
        margin: 0 auto;
        padding: 48px 20px 80px;
      }
      h1, h2 {
        line-height: 1.2;
      }
      .card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 18px;
        padding: 20px;
        margin-top: 20px;
      }
      code {
        font-family: "SFMono-Regular", Consolas, monospace;
        background: rgba(47, 122, 79, 0.08);
        padding: 0.15rem 0.35rem;
        border-radius: 6px;
      }
      a {
        color: var(--accent);
      }
      ul {
        padding-left: 1.25rem;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Juan Nutrisyon Public Discovery API</h1>
      <p>
        This site publishes read-only discovery endpoints for agents and integrations. The public API
        focuses on site metadata, health, content discovery, and tool discovery rather than account data.
      </p>

      <section class="card">
        <h2>Endpoints</h2>
        <ul>
          <li><a href="${origin}/api/status"><code>GET /api/status</code></a> returns the service status.</li>
          <li><a href="${origin}/api/discovery"><code>GET /api/discovery</code></a> returns public tool and content links.</li>
          <li><a href="${origin}/openapi.json"><code>GET /openapi.json</code></a> returns the machine-readable OpenAPI document.</li>
          <li><a href="${origin}/.well-known/api-catalog"><code>GET /.well-known/api-catalog</code></a> returns the RFC 9727 API catalog.</li>
        </ul>
      </section>

      <section class="card">
        <h2>Agent Discovery</h2>
        <ul>
          <li><a href="${origin}/.well-known/agent-skills/index.json"><code>/.well-known/agent-skills/index.json</code></a> publishes the agent skills index.</li>
          <li><a href="${origin}/.well-known/mcp/server-card.json"><code>/.well-known/mcp/server-card.json</code></a> publishes the MCP Server Card.</li>
          <li><a href="${origin}/mcp"><code>POST /mcp</code></a> exposes a lightweight read-only MCP endpoint.</li>
        </ul>
      </section>

      <section class="card">
        <h2>Application Links</h2>
        <ul>
          <li><a href="${APP_URL}">${APP_URL}</a> for food search</li>
          <li><a href="${APP_URL}/recipe">${APP_URL}/recipe</a> for recipe analysis</li>
          <li><a href="${APP_URL}/diary">${APP_URL}/diary</a> for food diary analysis</li>
          <li><a href="${CONTRIBUTOR_URL}">${CONTRIBUTOR_URL}</a> for community contributions</li>
        </ul>
      </section>
    </main>
  </body>
</html>`;
}

function buildDiscoveryPayload(origin) {
  return {
    site: {
      name: SITE_NAME,
      url: origin
    },
    tools: [
      {
        name: 'food-search',
        url: APP_URL
      },
      {
        name: 'recipe-builder',
        url: `${APP_URL}/recipe`
      },
      {
        name: 'food-diary',
        url: `${APP_URL}/diary`
      },
      {
        name: 'blog',
        url: `${origin}/blog`
      },
      {
        name: 'contribute',
        url: CONTRIBUTOR_URL
      }
    ],
    pages: SITE_PAGES.map((page) => ({
      title: page.title,
      url: `${origin}${page.path}`,
      summary: page.summary
    })),
    blogPosts: BLOG_POSTS.map((post) => ({
      title: post.title,
      url: `${origin}/blog/${post.slug}`,
      summary: post.summary
    })),
    discovery: {
      apiCatalog: `${origin}/.well-known/api-catalog`,
      apiDocs: `${origin}/docs/api`,
      openApi: `${origin}/openapi.json`,
      agentSkills: `${origin}/.well-known/agent-skills/index.json`,
      mcpServerCard: `${origin}/.well-known/mcp/server-card.json`
    }
  };
}

function buildMcpTools(origin) {
  return [
    {
      name: 'get_site_overview',
      title: 'Get Site Overview',
      description: 'Return a summary of Juan Nutrisyon and its public app tools.',
      inputSchema: {
        type: 'object',
        properties: {}
      },
      annotations: {
        readOnlyHint: true
      },
      execute: () => ({
        content: [
          {
            type: 'text',
            text: `${SITE_NAME} explains nutrition for Filipino foods and links to public tools for food search, recipe analysis, and diet tracking.`
          }
        ]
      })
    },
    {
      name: 'list_blog_posts',
      title: 'List Blog Posts',
      description: 'Return recent Juan Nutrisyon blog posts and short summaries.',
      inputSchema: {
        type: 'object',
        properties: {
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: BLOG_POSTS.length,
            description: 'Maximum number of posts to return.'
          }
        }
      },
      annotations: {
        readOnlyHint: true
      },
      execute: ({ limit }) => {
        const max = Number.isInteger(limit) ? limit : BLOG_POSTS.length;
        const items = BLOG_POSTS.slice(0, max).map(
          (post) => `- ${post.title}: ${post.summary} (${origin}/blog/${post.slug})`
        );
        return {
          content: [
            {
              type: 'text',
              text: items.join('\n')
            }
          ]
        };
      }
    },
    {
      name: 'get_discovery_resources',
      title: 'Get Discovery Resources',
      description: 'Return agent-facing discovery endpoints for Juan Nutrisyon.',
      inputSchema: {
        type: 'object',
        properties: {}
      },
      annotations: {
        readOnlyHint: true
      },
      execute: () => ({
        content: [
          {
            type: 'text',
            text: JSON.stringify(buildDiscoveryPayload(origin), null, 2)
          }
        ]
      })
    },
    {
      name: 'list_site_pages',
      title: 'List Site Pages',
      description: 'Return the main informational pages available on the Juan Nutrisyon website.',
      inputSchema: {
        type: 'object',
        properties: {}
      },
      annotations: {
        readOnlyHint: true
      },
      execute: () => ({
        content: [
          {
            type: 'text',
            text: SITE_PAGES.map(
              (page) => `- ${page.title}: ${page.summary} (${origin}${page.path})`
            ).join('\n')
          }
        ]
      })
    }
  ];
}

async function sha256Hex(value) {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  const bytes = new Uint8Array(digest);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function buildAgentSkillsIndex(origin) {
  const skills = buildSkillDefinitions(origin);
  return {
    $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
    skills: await Promise.all(
      skills.map(async (skill) => ({
        name: skill.name,
        type: skill.type,
        description: skill.description,
        url: `${origin}/.well-known/agent-skills/${skill.slug}/SKILL.md`,
        sha256: await sha256Hex(skill.body)
      }))
    )
  };
}

function appendHeader(headers, name, value) {
  const current = headers.get(name);
  headers.set(name, current ? `${current}, ${value}` : value);
}

function decorateResponse(response, origin, { varyAccept = false } = {}) {
  const headers = new Headers(response.headers);
  headers.set('Content-Signal', CONTENT_SIGNAL);
  if (varyAccept) {
    appendHeader(headers, 'Vary', 'Accept');
  }
  if (headers.get('content-type')?.startsWith('text/html') || headers.get('content-type')?.startsWith('text/markdown')) {
    headers.set('Link', buildLinkHeader(origin));
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function jsonResponse(body, origin, contentType = 'application/json; charset=utf-8') {
  return decorateResponse(
    new Response(JSON.stringify(body, null, 2), {
      headers: {
        'Content-Type': contentType
      }
    }),
    origin,
    ''
  );
}

function htmlResponse(html, origin) {
  return decorateResponse(
    new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    }),
    origin,
    '',
    { varyAccept: true }
  );
}

function textResponse(text, origin, contentType = 'text/plain; charset=utf-8') {
  return decorateResponse(
    new Response(text, {
      headers: {
        'Content-Type': contentType
      }
    }),
    origin,
    ''
  );
}

function shouldReturnMarkdown(request, response) {
  const accept = request.headers.get('accept') || '';
  const contentType = response.headers.get('content-type') || '';
  return accept.includes('text/markdown') && contentType.includes('text/html');
}

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function toAbsoluteUrl(url, href) {
  try {
    return new URL(href, url).toString();
  } catch {
    return href;
  }
}

function htmlToMarkdown(html, pageUrl) {
  let output = html;

  output = output.replace(/<script[\s\S]*?<\/script>/gi, '');
  output = output.replace(/<style[\s\S]*?<\/style>/gi, '');

  output = output.replace(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
    const label = decodeEntities(text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
    return label ? `[${label}](${toAbsoluteUrl(pageUrl, href)})` : '';
  });

  output = output.replace(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n\n');
  output = output.replace(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n\n');
  output = output.replace(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n\n');
  output = output.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1');
  output = output.replace(/<(p|div|section|article|main|header|footer|nav|ul|ol|br)\b[^>]*>/gi, '\n');
  output = output.replace(/<\/(p|div|section|article|main|header|footer|nav|ul|ol)>/gi, '\n');
  output = output.replace(/<[^>]+>/g, ' ');
  output = decodeEntities(output);
  output = output.replace(/[ \t]+\n/g, '\n');
  output = output.replace(/\n{3,}/g, '\n\n');
  output = output.replace(/[ \t]{2,}/g, ' ');

  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  const title = titleMatch ? decodeEntities(titleMatch[1].trim()) : SITE_NAME;

  return `---\ntitle: ${title}\nsource: ${pageUrl}\n---\n\n${output.trim()}\n`;
}

function estimateMarkdownTokens(markdown) {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return String(Math.max(1, Math.ceil(words * 1.33)));
}

function markdownResponse(markdown, origin, status = 200) {
  return decorateResponse(
    new Response(markdown, {
      status,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'X-Markdown-Tokens': estimateMarkdownTokens(markdown)
      }
    }),
    origin,
    '',
    { varyAccept: true }
  );
}

async function handleMcpRequest(request, origin) {
  if (request.method === 'GET') {
    return jsonResponse(
      {
        name: `${SITE_NAME} MCP`,
        endpoint: `${origin}/mcp`,
        transport: 'streamable-http',
        capabilities: {
          tools: {}
        }
      },
      origin
    );
  }

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const payload = await request.json();
  const tools = buildMcpTools(origin);
  const toolMap = new Map(tools.map((tool) => [tool.name, tool]));

  if (payload.method === 'initialize') {
    return jsonResponse(
      {
        jsonrpc: '2.0',
        id: payload.id ?? null,
        result: {
          protocolVersion: '2025-03-26',
          serverInfo: {
            name: `${SITE_NAME} MCP`,
            version: '1.0.0'
          },
          capabilities: {
            tools: {}
          }
        }
      },
      origin
    );
  }

  if (payload.method === 'tools/list') {
    return jsonResponse(
      {
        jsonrpc: '2.0',
        id: payload.id ?? null,
        result: {
          tools: tools.map(({ execute, ...tool }) => tool)
        }
      },
      origin
    );
  }

  if (payload.method === 'tools/call') {
    const name = payload.params?.name;
    const tool = toolMap.get(name);

    if (!tool) {
      return jsonResponse(
        {
          jsonrpc: '2.0',
          id: payload.id ?? null,
          error: {
            code: -32601,
            message: `Unknown tool: ${name}`
          }
        },
        origin
      );
    }

    return jsonResponse(
      {
        jsonrpc: '2.0',
        id: payload.id ?? null,
        result: tool.execute(payload.params?.arguments || {})
      },
      origin
    );
  }

  if (payload.method === 'notifications/initialized') {
    return new Response(null, { status: 204 });
  }

  return jsonResponse(
    {
      jsonrpc: '2.0',
      id: payload.id ?? null,
      error: {
        code: -32601,
        message: `Unsupported method: ${payload.method}`
      }
    },
    origin
  );
}

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const { origin, pathname } = url;
  const skillDefinitions = buildSkillDefinitions(origin);
  const skillMap = new Map(skillDefinitions.map((skill) => [skill.slug, skill]));

  if (pathname === '/.well-known/api-catalog') {
    return jsonResponse(buildApiCatalog(origin), origin, 'application/linkset+json; charset=utf-8');
  }

  if (pathname === '/openapi.json') {
    return jsonResponse(buildOpenApiSpec(origin), origin, 'application/openapi+json; charset=utf-8');
  }

  if (pathname === '/docs/api') {
    const html = buildApiDocsHtml(origin);
    if ((request.headers.get('accept') || '').includes('text/markdown')) {
      return markdownResponse(htmlToMarkdown(html, request.url), origin);
    }
    return htmlResponse(html, origin);
  }

  if (pathname === '/api/status') {
    return jsonResponse(
      {
        status: 'ok',
        service: 'juanutrisyon-public-site',
        version: '1.0.0',
        generatedAt: new Date().toISOString()
      },
      origin
    );
  }

  if (pathname === '/api/discovery') {
    return jsonResponse(buildDiscoveryPayload(origin), origin);
  }

  if (pathname === '/.well-known/agent-skills/index.json') {
    return jsonResponse(await buildAgentSkillsIndex(origin), origin);
  }

  const skillMatch = pathname.match(/^\/\.well-known\/agent-skills\/([^/]+)\/SKILL\.md$/);
  if (skillMatch) {
    const skill = skillMap.get(skillMatch[1]);
    if (!skill) {
      return new Response('Not Found', { status: 404 });
    }
    return markdownResponse(skill.body, origin);
  }

  if (pathname === '/.well-known/mcp/server-card.json') {
    return jsonResponse(
      {
        serverInfo: {
          name: `${SITE_NAME} MCP`,
          version: '1.0.0'
        },
        protocolVersion: '2025-03-26',
        transport: {
          type: 'streamable-http',
          url: `${origin}/mcp`
        },
        capabilities: {
          tools: {}
        }
      },
      origin
    );
  }

  if (pathname === '/mcp') {
    return handleMcpRequest(request, origin);
  }

  const response = await context.next();

  if (shouldReturnMarkdown(request, response)) {
    const html = await response.text();
    return markdownResponse(htmlToMarkdown(html, request.url), origin, response.status);
  }

  return decorateResponse(response, origin, { varyAccept: true });
}
