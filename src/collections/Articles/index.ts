import type { CollectionConfig } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { slugField } from 'payload'

import { isAdmin, isEditor } from '../../access/roles'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { Banner } from '../../blocks/Banner/config'
import { Code } from '../../blocks/Code/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { getArticlePath } from '../../utilities/getArticlePath'
import { revalidateArticle, revalidateDelete } from './hooks/revalidateArticle'

export const Articles: CollectionConfig<'articles'> = {
  slug: 'articles',
  access: {
    create: isEditor,
    delete: isAdmin,
    read: authenticatedOrPublished,
    update: isEditor,
  },
  // What gets populated when another doc (e.g. a home page layout) references an article
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  defaultPopulate: {
    title: true,
    subhead: true,
    description: true,
    slug: true,
    category: true,
    authors: true,
    heroImage: true,
    publishedAt: true,
  },
  admin: {
    defaultColumns: ['title', 'authors', 'category', 'publishedAt', '_status'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          path: getArticlePath(data),
          collection: 'articles',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        path: getArticlePath(data),
        collection: 'articles',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      // Stored as `title` so useAsTitle, slugField(), and preview keep working unchanged.
      name: 'title',
      label: 'Headline',
      type: 'text',
      required: true,
    },
    {
      name: 'subhead',
      type: 'text',
      required: true,
    },
    {
      // Not rendered on the article page. Used for <meta description> and listings.
      name: 'description',
      type: 'textarea',
      required: true,
      maxLength: 200,
      admin: {
        description:
          'Used for search/social previews and home page listings. Not shown on the article itself.',
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
            BlocksFeature({ blocks: [Banner, Code, MediaBlock] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
            HorizontalRuleFeature(),
          ]
        },
      }),
      label: false,
      required: true,
    },
    {
      // Point this at the most specific category (the subcategory). The parent is derived
      // from the Categories hierarchy, so the two can never disagree.
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      // Order is preserved, so this doubles as the byline order.
      name: 'authors',
      type: 'relationship',
      relationTo: 'authors',
      hasMany: true,
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidateArticle],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
