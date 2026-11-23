import * as migration_20261123_183714_initial from './20261123_183714_initial';
import * as migration_20261123_230543_modified_static_pages from './20261123_230543_modified_static_pages';
import * as migration_20261123_230951_update_pages_schema from './20261123_230951_update_pages_schema';

export const migrations = [
  {
    up: migration_20261123_183714_initial.up,
    down: migration_20261123_183714_initial.down,
    name: '20261123_183714_initial',
  },
  {
    up: migration_20261123_230543_modified_static_pages.up,
    down: migration_20261123_230543_modified_static_pages.down,
    name: '20261123_230543_modified_static_pages',
  },
  {
    up: migration_20261123_230951_update_pages_schema.up,
    down: migration_20261123_230951_update_pages_schema.down,
    name: '20261123_230951_update_pages_schema'
  },
];
