import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { notFound, permanentRedirect } from 'next/navigation'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import RichText from '@/components/RichText'
import { ArticleHero } from '@/heros/ArticleHero'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { getArticlePath } from '@/utilities/getArticlePath'

// The first segment is named `slug` (not `year`) because Next.js requires every dynamic
// segment at the same level to share a name, and the static pages route is [slug].
// Here `slug` holds the four-digit year.
type Args = {
  params: Promise<{
    slug: string
    month: string
    day: string
    articleSlug: string
  }>
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const articles = await payload.find({
    collection: 'articles',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
      publishedAt: true,
    },
  })

  return articles.docs.map((doc) => {
    // '/yyyy/mm/dd/slug' -> ['', yyyy, mm, dd, slug]
    const [, year, month, day, articleSlug] = getArticlePath(doc).split('/')
    return { slug: year, month, day, articleSlug }
  })
}

export default async function ArticlePage({ params: paramsPromise }: Args) {
  const { slug: year, month, day, articleSlug } = await paramsPromise

  if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month) || !/^\d{2}$/.test(day)) notFound()

  const { isEnabled: draft } = await draftMode()
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(articleSlug)
  const requestedPath = `/${year}/${month}/${day}/${decodedSlug}`

  const article = await queryArticleBySlug({ slug: decodedSlug })

  if (!article) return <PayloadRedirects url={requestedPath} />

  // The slug is the real key. If the date segments don't match publishedAt, send the
  // reader to the canonical URL. Skipped in draft mode so previews never bounce.
  const canonicalPath = getArticlePath(article)
  if (!draft && canonicalPath !== requestedPath) permanentRedirect(canonicalPath)

  return (
    <article className="pt-16 pb-16">
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={requestedPath} />

      {draft && <LivePreviewListener />}

      <ArticleHero article={article} />

      <div className="flex flex-col items-center gap-4 pt-8">
        <div className="container">
          <RichText className="max-w-[48rem] mx-auto" data={article.content} enableGutter={false} />
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { articleSlug } = await paramsPromise
  const article = await queryArticleBySlug({ slug: decodeURIComponent(articleSlug) })

  if (!article) return {}

  const image =
    article.heroImage && typeof article.heroImage === 'object' ? article.heroImage.url : null

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.description,
      url: getArticlePath(article),
      publishedTime: article.publishedAt ?? undefined,
      images: image ? [{ url: image }] : undefined,
    },
  }
}

const queryArticleBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'articles',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
