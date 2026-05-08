import { onMounted } from 'vue'

const APP_URL = 'https://app.juanutrisyon.info'
const SITE_PAGES = [
  {
    slug: 'home',
    title: 'Home',
    path: '/'
  },
  {
    slug: 'about',
    title: 'About',
    path: '/about'
  },
  {
    slug: 'guide',
    title: 'User Guide',
    path: '/guide'
  },
  {
    slug: 'contact',
    title: 'Contact',
    path: '/contact'
  },
  {
    slug: 'terms',
    title: 'Terms and Conditions',
    path: '/terms'
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    path: '/privacy'
  },
  {
    slug: 'blog',
    title: 'Blog',
    path: '/blog'
  }
]

const BLOG_POSTS = [
  {
    slug: 'busog-pero-kulang-why-feeling-full-doesnt-mean-youre-nourished',
    title: 'Busog Pero Kulang'
  },
  {
    slug: 'hidden-sugar-in-common-filipino-foods',
    title: 'Hidden Sugar in Common Filipino Foods'
  },
  {
    slug: 'carinderia-survival-guide-healthy-choices',
    title: 'Carinderia Survival Guide'
  },
  {
    slug: 'why-filipino-food-is-high-in-sodium',
    title: 'Why Filipino Food Is High in Sodium'
  },
  {
    slug: 'sana-all-may-label',
    title: 'Sana All May Label'
  },
  {
    slug: 'healthy-eating-on-a-budget',
    title: 'Healthy Eating on a Budget'
  },
  {
    slug: 'common-nutrition-mistakes-filipinos-make',
    title: 'Common Nutrition Mistakes Filipinos Make'
  },
  {
    slug: 'is-using-asin-a-sin',
    title: 'Is Using Asin a Sin'
  },
  {
    slug: 'natures-hidden-pantry',
    title: "Nature's Hidden Pantry"
  }
]

function toolResult(text) {
  return {
    content: [
      {
        type: 'text',
        text
      }
    ]
  }
}

function navigate(url, text) {
  window.location.assign(url)
  return toolResult(text)
}

export function useWebMcp() {
  onMounted(() => {
    if (typeof window === 'undefined' || !('modelContext' in window.navigator)) {
      return
    }

    window.navigator.modelContext.provideContext({
      tools: [
        {
          name: 'open_food_search',
          title: 'Open Food Search',
          description: 'Open the Juan Nutrisyon food search app for Filipino foods and ingredients.',
          inputSchema: {
            type: 'object',
            properties: {}
          },
          execute: () => navigate(APP_URL, 'Opened the Juan Nutrisyon food search app.')
        },
        {
          name: 'open_recipe_builder',
          title: 'Open Recipe Builder',
          description: 'Open the recipe builder to estimate nutrients for multiple ingredients.',
          inputSchema: {
            type: 'object',
            properties: {}
          },
          execute: () => navigate(`${APP_URL}/recipe`, 'Opened the Juan Nutrisyon recipe builder.')
        },
        {
          name: 'open_food_diary',
          title: 'Open Food Diary',
          description: 'Open the food diary to review meals and daily nutrient totals.',
          inputSchema: {
            type: 'object',
            properties: {}
          },
          execute: () => navigate(`${APP_URL}/diary`, 'Opened the Juan Nutrisyon food diary.')
        },
        {
          name: 'open_site_page',
          title: 'Open Site Page',
          description: 'Open a public informational page on the Juan Nutrisyon website.',
          inputSchema: {
            type: 'object',
            properties: {
              slug: {
                type: 'string',
                description: `One of: ${SITE_PAGES.map((page) => page.slug).join(', ')}`
              }
            },
            required: ['slug']
          },
          execute: ({ slug }) => {
            const page = SITE_PAGES.find((entry) => entry.slug === slug)

            if (!page) {
              return toolResult('Unknown site page slug.')
            }

            return navigate(page.path, `Opened the ${page.title} page.`)
          }
        },
        {
          name: 'open_blog_post',
          title: 'Open Blog Post',
          description: 'Open a Juan Nutrisyon blog post about Filipino nutrition and practical eating habits.',
          inputSchema: {
            type: 'object',
            properties: {
              slug: {
                type: 'string',
                description: `One of: ${BLOG_POSTS.map((post) => post.slug).join(', ')}`
              }
            },
            required: ['slug']
          },
          execute: ({ slug }) => {
            const post = BLOG_POSTS.find((entry) => entry.slug === slug)

            if (!post) {
              return toolResult('Unknown blog post slug.')
            }

            return navigate(`/blog/${post.slug}`, `Opened the blog post "${post.title}".`)
          }
        },
        {
          name: 'get_site_summary',
          title: 'Get Site Summary',
          description: 'Summarize what Juan Nutrisyon offers to users and agents.',
          inputSchema: {
            type: 'object',
            properties: {}
          },
          annotations: {
            readOnlyHint: true
          },
          execute: () =>
            toolResult(
              'Juan Nutrisyon provides Filipino food nutrition search, recipe analysis, diet tracking, and practical blog content for healthier everyday meals.'
            )
        }
      ]
    })
  })
}
