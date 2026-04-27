import { useHead } from '@vueuse/head'

const SITE_NAME = 'Juan Nutrisyon'
const SITE_URL = 'https://juanutrisyon.info'
const DEFAULT_AUTHOR = 'Wern Ancheta'
const DEFAULT_AUTHOR_URL = 'https://wernancheta.com'
const DEFAULT_SECTION = 'Nutrition'
const DEFAULT_IMAGE = '/logo.png'
const DEFAULT_LOCALE = 'en_PH'
const DEFAULT_TIMEZONE_OFFSET = '+08:00'

function toAbsoluteUrl(pathOrUrl) {
  if (!pathOrUrl) {
    return `${SITE_URL}${DEFAULT_IMAGE}`
  }

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl
  }

  return `${SITE_URL}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`
}

function toIsoDateTime(value) {
  if (!value) {
    return value
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T00:00:00${DEFAULT_TIMEZONE_OFFSET}`
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) {
    return value
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/.test(value)) {
    return value.replace(/(Z|[+-]\d{2}:\d{2})$/, ':00$1')
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value)) {
    return `${value}${DEFAULT_TIMEZONE_OFFSET}`
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return `${value}:00${DEFAULT_TIMEZONE_OFFSET}`
  }

  return value
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
  const publishedDateTime = toIsoDateTime(publishedTime)
  const modifiedDateTime = toIsoDateTime(modifiedTime || publishedTime)

  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    image: imageUrl,
    datePublished: publishedDateTime,
    dateModified: modifiedDateTime,
    author: {
      '@type': 'Person',
      name: authorName,
      url: DEFAULT_AUTHOR_URL
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
        content: publishedDateTime
      },
      {
        property: 'article:modified_time',
        content: modifiedDateTime
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
