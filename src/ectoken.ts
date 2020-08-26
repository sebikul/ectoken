import * as Joi from 'joi';

const { createCipheriv, createDecipheriv, createHash, randomBytes } = require('crypto');

// constants
const IV_SIZE = 12;
const TAG_SIZE = 16;

const schema = {
  V3: {
    decrypt: Joi.object().keys({
      key: Joi.string().alphanum().min(1).required(),
      token: Joi.string().max(512).required(),
      verbose: Joi.boolean(),
    }),
    encrypt: Joi.object().keys({
      key: Joi.string().alphanum().min(1).required(),
      params: Joi.string().required(),
      verbose: Joi.boolean(),
    }),
  },
};

/**
 * base64 encodes and replaces characters just like urlsafe_b64encode
 * @param  {Buffer} buffer
 * @return {String}
 */
function encode(buffer: Buffer) {
  let encoded = encodeURI(buffer.toString('base64'));
  encoded = encoded.split('=').join('');
  encoded = encoded.split('+').join('-');
  encoded = encoded.split('/').join('_');

  return encoded;
}

/**
 * base64 decodes and re-replaces characters just like urlsafe_b64decode
 * @param  {String} token
 * @return {Buffer}
 */
function decode(token: string) {
  let decoded = decodeURI(token);
  decoded = decoded.split('-').join('+');
  decoded = decoded.split('_').join('/');
  switch (decoded.length % 4) {
    case 2:
      decoded += '==';
      break;
    case 3:
      decoded += '=';
      break;
  }

  return Buffer.from(decoded, 'base64');
}

/**
 * Generates an encrypted authentication token [version 3]
 * @param  {String}  key
 * @param  {String}  params
 * @param  {Boolean} verbose
 * @return {String}
 */
export function encrypt(key: string, params: string, verbose: boolean = false) {
  // validate input
  const result = schema.V3.encrypt.validate({ key, params, verbose });
  if (result.error) {
    throw new Error(result.error.message);
  }

  // create iv
  const iv = randomBytes(IV_SIZE);

  // sha256 hash key
  const hash = createHash('sha256').update(key).digest();

  // create cipher
  const cipher = createCipheriv('aes-256-gcm', hash, iv);

  // encrypt the params
  const cipherText = Buffer.concat([cipher.update(params, 'utf8'), cipher.final()]);

  // create tag
  const tag = cipher.getAuthTag();

  // create token (iv + encypted + tag)
  const token = Buffer.concat([iv, cipherText, tag]);

  // debug output
  if (verbose) {
    console.log('+-------------------------------------------------------------');
    console.log('| iv:                %s', iv.toString('hex'));
    console.log('| cipherText:        %s', cipherText.toString('hex'));
    console.log('| tag:               %s', tag.toString('hex'));
    console.log('+-------------------------------------------------------------');
    console.log('| token:             %s', token.toString('hex'));
    console.log('+-------------------------------------------------------------');
  }

  return encode(token);
}

/**
 * Decrypts an authentication token [version 3]
 * @param  {String}  key
 * @param  {String}  token
 * @param  {Boolean} verbose
 * @return {String}
 */
export function decrypt(key: string, token: string, verbose: boolean = false) {
  // validate input
  const result = schema.V3.decrypt.validate({ key, token, verbose });
  if (result.error) {
    throw new Error(result.error.message);
  }

  // sha256 hash key
  const hash = createHash('sha256').update(key).digest();

  // decode token
  const buffer = decode(token);

  // parse iv
  const iv = buffer.slice(0, IV_SIZE);

  // parse cipher text
  const cipherTextLength = buffer.length - TAG_SIZE;
  const cipherText = buffer.slice(IV_SIZE, cipherTextLength);

  // parse tag
  const tag = buffer.slice(cipherTextLength, buffer.length);

  // decrypt the params
  const decipher = createDecipheriv('aes-256-gcm', hash, iv);
  decipher.setAuthTag(tag);
  const params = decipher.update(cipherText, 'binary') + decipher.final('utf8');

  // debug output
  if (verbose) {
    console.log('+-------------------------------------------------------------');
    console.log('| iv:                %s', iv.toString('hex'));
    console.log('| cipherText:        %s', cipherText.toString('hex'));
    console.log('| tag:               %s', tag.toString('hex'));
    console.log('+-------------------------------------------------------------');
    console.log('| params:            %s', params.toString('hex'));
    console.log('+-------------------------------------------------------------');
  }

  return params;
}
