import React from 'react'

import type { Article } from '@/payload-types'

import { Media } from '@/components/Media'

const dateFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

export const ArticleHero: React.FC<{ article: Article }> = ({ article }) => {
  const { title, subhead, heroImage, category, authors, publishedAt } = article

  // 'Arts › Restaurant Review' for a subcategory, 'News' for a top-level category.
  // Needs `parent` on Categories and a populated relationship (the default depth covers it).
  const categoryObj = category && typeof category === 'object' ? category : null
  const parentObj =
    categoryObj?.parent && typeof categoryObj.parent === 'object' ? categoryObj.parent : null
  const categoryLabel = categoryObj
    ? [parentObj?.title, categoryObj.title].filter(Boolean).join(' › ')
    : null

  const byline = (authors ?? [])
    .filter((author) => typeof author === 'object')
    .map((author) => author.name)
    .join(', ')

  return (
    <header className="container">
      <div className="max-w-3xl mx-auto">
        {categoryLabel && (
          <p className="text-sm uppercase tracking-wide text-muted-foreground mb-4">
            {categoryLabel}
          </p>
        )}

        <h1 className="text-4xl md:text-5xl font-bold leading-tight">{title}</h1>
        <p className="mt-4 text-xl md:text-2xl text-muted-foreground">{subhead}</p>

        <p className="mt-6 text-sm">
          {byline && <span className="font-medium">By {byline}</span>}
          {byline && publishedAt && <span aria-hidden> · </span>}
          {publishedAt && (
            <time dateTime={publishedAt}>{dateFormat.format(new Date(publishedAt))}</time>
          )}
        </p>
      </div>

      {heroImage && typeof heroImage === 'object' && (
        <div className="max-w-208 mx-auto mt-8">
          <Media resource={heroImage} priority imgClassName="w-full h-auto" />
        </div>
      )}
    </header>
  )
}
