const TZ = 'America/New_York'

export function getArticlePath(doc: { slug?: string | null; publishedAt?: string | null }) {
  const date = doc.publishedAt ? new Date(doc.publishedAt) : new Date()
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const get = (type: string) => parts.find((p) => p.type === type)!.value
  return `/${get('year')}/${get('month')}/${get('day')}/${doc.slug}`
}
