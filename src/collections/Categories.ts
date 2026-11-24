import type { CollectionConfig } from 'payload'

import { APIError, slugField } from 'payload'

import { anyone } from '../access/anyone'
import { isAdmin, isEditor } from '../access/roles'

// `parent` and `breadcrumbs` are added to this collection by nestedDocsPlugin
// (see plugins/index.ts), so they are deliberately not declared here.
// Empty parent = top-level category (Arts). Set = subcategory (Restaurant Review).
export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: isEditor,
    delete: isAdmin,
    read: anyone,
    update: isEditor,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'parent', 'slug'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField({
      position: undefined,
    }),
  ],
  hooks: {
    // The plugin allows unlimited nesting; this caps it at two levels (category > subcategory).
    beforeValidate: [
      async ({ data, originalDoc, req }) => {
        const rawParent = (data as { parent?: unknown } | undefined)?.parent
        if (!rawParent) return data

        const parentID = (
          typeof rawParent === 'object' ? (rawParent as { id: number | string }).id : rawParent
        ) as number | string
        const id = originalDoc?.id as number | string | undefined

        if (id && String(parentID) === String(id)) {
          throw new APIError('A category cannot be its own parent.', 400)
        }

        const parent = await req.payload.findByID({
          collection: 'categories',
          id: parentID,
          depth: 0,
          req,
        })
        if ((parent as { parent?: unknown }).parent) {
          throw new APIError(
            'Subcategories cannot have subcategories. Choose a top-level category.',
            400,
          )
        }

        if (id) {
          const children = await req.payload.count({
            collection: 'categories',
            where: { parent: { equals: id } },
            req,
          })
          if (children.totalDocs > 0) {
            throw new APIError(
              'This category has subcategories, so it cannot become a subcategory itself.',
              400,
            )
          }
        }

        return data
      },
    ],
    // Without this, deleting a referenced category nulls the FK and leaves articles with no category.
    beforeDelete: [
      async ({ id, req }) => {
        const [children, articles] = await Promise.all([
          req.payload.count({ collection: 'categories', where: { parent: { equals: id } }, req }),
          req.payload.count({ collection: 'articles', where: { category: { equals: id } }, req }),
        ])

        if (children.totalDocs > 0 || articles.totalDocs > 0) {
          throw new APIError(
            'This category still has subcategories or articles. Move or delete them first.',
            400,
          )
        }
      },
    ],
  },
}
