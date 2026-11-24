import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Article } from '../../../payload-types'
import { getArticlePath } from '../../../utilities/getArticlePath'

export const revalidateArticle: CollectionAfterChangeHook<Article> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc

  const path = getArticlePath(doc)

  if (doc._status === 'published') {
    payload.logger.info(`Revalidating article at path: ${path}`)
    revalidatePath(path)
    revalidateTag('articles-sitemap', 'max')
  }

  // Old URL is stale if the article was unpublished, or if its slug or publish date changed
  if (previousDoc?._status === 'published') {
    const oldPath = getArticlePath(previousDoc)

    if (doc._status !== 'published' || oldPath !== path) {
      payload.logger.info(`Revalidating old article at path: ${oldPath}`)
      revalidatePath(oldPath)
      revalidateTag('articles-sitemap', 'max')
    }
  }

  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Article> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidatePath(getArticlePath(doc))
    revalidateTag('articles-sitemap', 'max')
  }

  return doc
}
