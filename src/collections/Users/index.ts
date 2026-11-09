import type { CollectionConfig } from 'payload'

import { hasAnyRole, isAdmin, isAdminOrSelf } from '../../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: hasAnyRole,
    create: isAdmin,
    delete: isAdmin,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
  },
  admin: {
    defaultColumns: ['name', 'email', 'roles'],
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Editor',
          value: 'editor',
        },
        {
          label: 'Business',
          value: 'business',
        },
      ],
      access: {
        update: isAdmin,
      },
      hooks: {
        // Make first user admin by default.
        beforeValidate: [
          async ({ req, operation, value }) => {
            if (operation === 'create') {
              const { totalDocs } = await req.payload.count({ collection: 'users' })
              if (totalDocs === 0) {
                return ['admin']
              }
            }
            return value
          }
        ],
      },
    }
  ],
  timestamps: true,
}
