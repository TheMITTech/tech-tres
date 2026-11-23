import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

import { getAuthorTitle } from '@/utilities/getAuthorTitle'

type Args = { params: Promise<{ slug: string }> }

export default async function AuthorPage({ params }: Args) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'authors',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })

  const author = docs[0]
  if (!author) notFound()

  const title = getAuthorTitle(author.positions, new Date())
  const photo = typeof author.photo === 'object' ? author.photo : null

  return (
    <main style={{ maxWidth: '42rem', margin: '0 auto', padding: '3rem 1.25rem' }}>
      <header
        style={{
          display: 'flex',
          gap: '1.5rem',
          paddingBottom: '2rem',
        }}
      >
        {photo?.url && (
          <img
            src={photo.url}
            alt={author.name}
            style={{
              width: 120,
              height: 120,
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
        )}
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', lineHeight: 1.15 }}>{author.name}</h1>
          {title && (
            <p style={{ margin: '0.25rem 0 0', color: '#555', fontSize: '1.05rem' }}>{title}</p>
          )}
          {author.email && (
            <a
              href={`mailto:${author.email}`}
              style={{
                display: 'inline-block',
                marginTop: '0.5rem',
                fontSize: '0.95rem',
                color: '#555',
              }}
            >
              {author.email}
            </a>
          )}
        </div>
      </header>

      {author.bio && (
        <p
          style={{
            margin: '2rem 0 0',
            fontSize: '1.1rem',
            lineHeight: 1.7,
            whiteSpace: 'pre-line',
          }}
        >
          {author.bio}
        </p>
      )}
    </main>
  )
}
