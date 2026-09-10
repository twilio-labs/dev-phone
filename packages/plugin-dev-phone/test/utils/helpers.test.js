const { expect } = require('chai');
const { isLoopbackHost } = require('../../src/utils/helpers');

describe('isLoopbackHost', () => {
    it('accepts localhost', () => {
        expect(isLoopbackHost('localhost')).to.equal(true);
        expect(isLoopbackHost('localhost:1337')).to.equal(true);
    });

    it('accepts 127.0.0.1', () => {
        expect(isLoopbackHost('127.0.0.1')).to.equal(true);
        expect(isLoopbackHost('127.0.0.1:1337')).to.equal(true);
    });

    it('accepts the IPv6 loopback', () => {
        expect(isLoopbackHost('[::1]')).to.equal(true);
        expect(isLoopbackHost('[::1]:1337')).to.equal(true);
    });

    it('rejects arbitrary hostnames', () => {
        expect(isLoopbackHost('attacker.evil')).to.equal(false);
        expect(isLoopbackHost('attacker.evil:1337')).to.equal(false);
    });

    it('rejects LAN IPs', () => {
        expect(isLoopbackHost('192.168.1.10:1337')).to.equal(false);
        expect(isLoopbackHost('10.0.0.5')).to.equal(false);
    });

    it('rejects a missing host', () => {
        expect(isLoopbackHost(undefined)).to.equal(false);
        expect(isLoopbackHost('')).to.equal(false);
    });

    it('rejects a malformed host', () => {
        expect(isLoopbackHost('not a host')).to.equal(false);
    });
});
