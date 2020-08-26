import chai from 'chai';
import stdMocks from 'std-mocks';

import * as ectoken from '../src/ectoken';

const expect = chai.expect;
describe('ECToken V3', () => {
  const key = 'GF8PHCp3xy5ypSaJKmPMH2M4';
  const params = 'ec_expire=1257642471&ec_clientip=11.22.33.1';
  let token: string;

  it('should successfully create a V3 token', () => {
    token = ectoken.encrypt(key, params);
  });

  it('should successfully decrypt the V3 token', () => {
    const result = ectoken.decrypt(key, token);
    expect(result).to.equal(params);
  });

  it('should successfully decrypt the V3 token created from the customer portal', () => {
    const result = ectoken.decrypt(
      key,
      'yfuuiWuy8LMiNR1Au3b9-LSNln-X5W-enqvNBlhlpwQspOoLlMX4fIecVLTQJTLMGET14FtLxmp8U6zaDSq5eD-gYMHz9V0',
    );
    expect(result).to.equal(params);
  });

  it('should successfully create a V3 token (verbose = true)', () => {
    stdMocks.use();
    token = ectoken.encrypt(key, params, true);
    stdMocks.restore();
    const output = stdMocks.flush();
    expect(output.stdout.length).to.equal(7);
  });

  it('should successfully decrypt the V3 token (verbose = true)', () => {
    stdMocks.use();
    const result = ectoken.decrypt(key, token, true);
    expect(result).to.equal(params);
    stdMocks.restore();
    const output = stdMocks.flush();
    expect(output.stdout.length).to.equal(7);
  });

  it('should fail to create a V3 token when the key is not alphanumeric', () => {
    try {
      ectoken.encrypt(`_${key}`, params);
    } catch (e) {
      expect(e.message).to.equal('"key" must only contain alpha-numeric characters');
    }
  });

  it('should fail to decrypt the V3 token when the key is not alphanumeric', () => {
    try {
      ectoken.decrypt(`_${key}`, params);
    } catch (e) {
      expect(e.message).to.equal('"key" must only contain alpha-numeric characters');
    }
  });
});
