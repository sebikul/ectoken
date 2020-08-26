# ectoken generation for Node.js

```
npm i
npm run build
node dist/src/index.js encrypt '[KEY]' '[PARAMS]'
node dist/src/index.js decrypt '[KEY]' '[ENCRYPTED_PARAMS]'
```

## Examples

```
$ node dist/src/index.js encrypt 'asd' 'ec_url_allow=/uploads/private1.txt'
V3pcp5WHJYHdm3k-Ha29MCwRMNbydr825p81tj-RL0phRPnbfabipWieW_wcqCx5mtfSqZkLiRt5Y2bhV3A

$ node dist/src/index.js decrypt 'asd' 'V3pcp5WHJYHdm3k-Ha29MCwRMNbydr825p81tj-RL0phRPnbfabipWieW_wcqCx5mtfSqZkLiRt5Y2bhV3A'
ec_url_allow=/uploads/private1.txt
```


# Tests

```
npm i
npm run build
cd dist && mocha
```
