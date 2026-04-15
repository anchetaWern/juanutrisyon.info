import { useHead } from '@vueuse/head'

export function usePageSeo({ title, description }) {
  const fullTitle = `${title} | Juan Nutrisyon`

  useHead({
    title: fullTitle,
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
