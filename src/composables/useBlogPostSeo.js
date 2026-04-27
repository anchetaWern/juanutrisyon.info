import { useHead } from '@vueuse/head'

const SITE_NAME = 'Juan Nutrisyon'
const SITE_URL = 'https://juanutrisyon.info'
const DEFAULT_AUTHOR = 'Wern Ancheta'
const DEFAULT_SECTION = 'Nutrition'
const DEFAULT_IMAGE = '/logo.png'
const DEFAULT_LOCALE = 'en_PH'

function toAbsoluteUrl(pathOrUrl) {
  if (!pathOrUrl) {
    return `${SITE_URL}${DEFAULT_IMAGE}`
  }

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl
  }

  return `${SITE_URL}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`
}

export function useBlogPostSeo({
  title,
  description,
  path,
  publishedTime,
  modifiedTime,
  authorName = DEFAULT_AUTHOR,
  image = DEFAULT_IMAGE,
  imageAlt,
  section = DEFAULT_SECTION,
  tags = []
}) {
  const fullTitle = `${title} | ${SITE_NAME}`
  const canonicalUrl = `${SITE_URL}${path}`
  const imageUrl = toAbsoluteUrl(image)
  const normalizedTags = tags.filter(Boolean)
  const resolvedModifiedTime = modifiedTime || publishedTime

  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    image: imageUrl,
    datePublished: publishedTime,
    dateModified: resolvedModifiedTime,
    author: {
      '@type': 'Person',
      name: authorName
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl
    },
    url: canonicalUrl,
    keywords: normalizedTags.join(', ')
  }

  useHead({
    title: fullTitle,
    link: [
      {
        rel: 'canonical',
        href: canonicalUrl
      }
    ],
    meta: [
      {
        name: 'description',
        content: description
      },
      {
        property: 'og:title',
        content: fullTitle
      },
      {
        property: 'og:description',
        content: description
      },
      {
        property: 'og:type',
        content: 'article'
      },
      {
        property: 'og:url',
        content: canonicalUrl
      },
      {
        property: 'og:site_name',
        content: SITE_NAME
      },
      {
        property: 'og:image',
        content: imageUrl
      },
      {
        property: 'og:image:alt',
        content: imageAlt || title
      },
      {
        property: 'og:locale',
        content: DEFAULT_LOCALE
      },
      {
        property: 'article:published_time',
        content: publishedTime
      },
      {
        property: 'article:modified_time',
        content: resolvedModifiedTime
      },
      {
        property: 'article:author',
        content: authorName
      },
      {
        property: 'article:section',
        content: section
      },
      ...normalizedTags.map((tag) => ({
        property: 'article:tag',
        content: tag
      })),
      {
        name: 'twitter:card',
        content: 'summary_large_image'
      },
      {
        name: 'twitter:title',
        content: fullTitle
      },
      {
        name: 'twitter:description',
        content: description
      },
      {
        name: 'twitter:image',
        content: imageUrl
      }
    ],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(blogPostingSchema)
      }
    ]
  })
}
