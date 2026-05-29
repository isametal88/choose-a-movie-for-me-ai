import { LUNA_BRIDGE, PROVIDER_LAUNCHER } from './platform.tokens';

describe('Platform tokens', () => {
  it('LUNA_BRIDGE token is defined', () => expect(LUNA_BRIDGE).toBeDefined());
  it('PROVIDER_LAUNCHER token is defined', () => expect(PROVIDER_LAUNCHER).toBeDefined());
  it('tokens are distinct', () => expect(LUNA_BRIDGE).not.toBe(PROVIDER_LAUNCHER));
});
