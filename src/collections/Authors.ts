// src/collections/Authors.ts
import type { CollectionConfig } from 'payload'

import { isAdmin, isEditor } from '@/access/roles'

export const Authors: CollectionConfig = {
  slug: 'authors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: isEditor,
    update: isEditor,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar' },
      hooks: {
        beforeValidate: [
          ({ value, data }) =>
            value ||
            data?.name
              ?.toLowerCase()
              .trim()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, ''),
        ],
      },
    },
    {
      name: 'positions',
      type: 'array',
      admin: {
        description:
          'Titles over time, from its start date until the next entry. Leave the date blank for a title held from the beginning (at most one row). An empty title means no title as of that date.',
      },
      fields: [
        { name: 'title', type: 'text' },
        {
          name: 'from',
          type: 'date',
          required: true,
          admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'MMM d, yyyy' } },
        },
      ],
    },
    { name: 'bio', type: 'textarea' },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    {
      name: 'email',
      type: 'email',
      admin: { description: 'Public email address' },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'Ties author to a CMS user',
      },
    },
  ],
}
