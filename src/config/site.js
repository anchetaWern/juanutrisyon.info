export const siteConfig = Object.freeze({
  appUrl: 'https://app.juanutrisyon.info',
  contributionUrl: 'https://contribute.juanutrisyon.info',
  contactEmail: 'juanutrisyon@gmail.com'
})

export function createMailto({ subject, body }) {
  const query = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  return `mailto:${siteConfig.contactEmail}?${query}`
}
