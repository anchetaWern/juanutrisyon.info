import { useHead } from '@vueuse/head'

const SITE_URL = 'https://juanutrisyon.info'

export function usePageSeo({ title, description, path }) {
  const fullTitle = `${title} | Juan Nutrisyon`
  const canonicalUrl = path ? `${SITE_URL}${path}` : undefined

  useHead({
    title: fullTitle,
    link: canonicalUrl
      ? [
          {
            rel: 'canonical',
            href: canonicalUrl
          }
        ]
      : [],
    meta: [
      {
        name: 'description',
        content: description
      },
      ...(canonicalUrl
        ? [
            {
              property: 'og:url',
              content: canonicalUrl
            }
          ]
        : []),
      {
        property: 'og:title',
        content: fullTitle
      },
      {
        property: 'og:description',
        content: description
      },
      {
        name: 'twitter:title',
        content: fullTitle
      },
      {
        name: 'twitter:description',
        content: description
      }
    ]
  })
}
