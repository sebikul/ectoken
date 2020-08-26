import yargs from 'yargs';

import * as ectoken from './ectoken';

yargs
  .command(
    'encrypt <key> <params>',
    'Validate a path against the available filters',
    {
      key: {
        type: 'string',
      },
      params: {
        type: 'string',
      },
    },
    (args) => {
      if (!args.key || !args.params) {
        return;
      }
      console.log(ectoken.encrypt(args.key, args.params, true));
    },
  )
  .command(
    'decrypt <key> <params>',
    'Validate a path against the available filters and upload to the remote Storage Account',
    {
      key: {
        type: 'string',
      },
      params: {
        type: 'string',
      },
    },
    (args) => {
      if (!args.key || !args.params) {
        return;
      }
      console.log(ectoken.decrypt(args.key, args.params, true));
    },
  )
  .demandCommand()
  .help().argv;
