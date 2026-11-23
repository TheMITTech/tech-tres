import * as migration_20261123_183714_initial from './20261123_183714_initial';

export const migrations = [
  {
    up: migration_20261123_183714_initial.up,
    down: migration_20261123_183714_initial.down,
    name: '20261123_183714_initial'
  },
];
