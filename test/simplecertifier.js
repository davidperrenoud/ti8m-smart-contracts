var SimpleCertifier = artifacts.require("./contracts/SimpleCertifier.sol");

contract("SimpleCertifier", (accounts) => {
  simpleCertifier = null;

  administrator = accounts[0];
  maliciousUser = accounts[1];

  sendWallet = accounts[2];
  receiveWallet = accounts[3];

  LEVELS = {
    REVOKED: 0,
    LEVEL_1: 1,
    LEVEL_2: 2,
    LEVEL_3: 3,
  }

  beforeEach((done) => {
    SimpleCertifier.new({ from: administrator })
      .then(contract => {
        simpleCertifier = contract;
        done();
      })
      .catch(error => done(error));
  })

  it("should not certify an account if not delegate", (done) => {
    simpleCertifier.certify(sendWallet, LEVELS.LEVEL_1, receiveWallet, { from: maliciousUser })
      .then(() => Promise.all([
          simpleCertifier.getCertifiedLevel(sendWallet),
          simpleCertifier.getCertifiedReceiveWallet(sendWallet),
      ]))
      .then((response) => {
        let certifiedLevel = response[0];
        let certifiedReceiveWallet = response[1];

        assert.equal(certifiedLevel, 0, "account certified for level 1");
        assert.equal(certifiedReceiveWallet, 0, "receiveWallet certified for level 1");

        done();
      })
      .catch(error => done(error));
  })

  it("should certify an account for level 1", (done) => {
    simpleCertifier.certify(sendWallet, LEVELS.LEVEL_1, receiveWallet, { from: administrator })
      .then(() => Promise.all([
        simpleCertifier.getCertifiedLevel(sendWallet),
        simpleCertifier.getCertifiedReceiveWallet(sendWallet),
      ]))
      .then((response) => {
        let certifiedLevel = response[0];
        let certifiedReceiveWallet = response[1];

        assert.equal(certifiedLevel, LEVELS.LEVEL_1, "account not certified for level 1");
        assert.equal(certifiedReceiveWallet, receiveWallet, "receiveWallet not certified for level 1");
        done();
      })
      .catch(error => done(error));
  });

  it("should certify an account for level 2", (done) => {
    simpleCertifier.certify(sendWallet, LEVELS.LEVEL_2, receiveWallet, { from: administrator })
      .then(() => Promise.all([
        simpleCertifier.getCertifiedLevel(sendWallet),
        simpleCertifier.getCertifiedReceiveWallet(sendWallet),
      ]))
      .then((response) => {
        let certifiedLevel = response[0];
        let certifiedReceiveWallet = response[1];

        assert.equal(certifiedLevel, LEVELS.LEVEL_2, "account not certified for level 2");
        assert.equal(certifiedReceiveWallet, receiveWallet, "receiveWallet not certified for level 2");
        done();
      })
      .catch(error => done(error));
  });

  it("should certify an account for level 3", (done) => {
    simpleCertifier.certify(sendWallet, LEVELS.LEVEL_3, receiveWallet, { from: administrator })
      .then(() => Promise.all([
        simpleCertifier.getCertifiedLevel(sendWallet),
        simpleCertifier.getCertifiedReceiveWallet(sendWallet),
      ]))
      .then((response) => {
        let certifiedLevel = response[0];
        let certifiedReceiveWallet = response[1];

        assert.equal(certifiedLevel, LEVELS.LEVEL_3, "account not certified for level 3");
        assert.equal(certifiedReceiveWallet, receiveWallet, "receiveWallet not certified for level 3");
        done();
      })
      .catch(error => done(error));
  });

  it("should revoke the certification for an account", (done) => {
    simpleCertifier.certify(sendWallet, LEVELS.LEVEL_3, receiveWallet, { from: administrator })
      .then(() => Promise.all([
        simpleCertifier.getCertifiedLevel(sendWallet),
        simpleCertifier.getCertifiedReceiveWallet(sendWallet),
      ]))
      .then((response) => {
        let certifiedLevel = response[0];
        let certifiedReceiveWallet = response[1];

        assert.equal(certifiedLevel, LEVELS.LEVEL_3, "account not certified for level 3");
        assert.equal(certifiedReceiveWallet, receiveWallet, "receiveWallet not certified for level 3");

        return simpleCertifier.revoke(sendWallet, { from: administrator });
      })
      .then(() => simpleCertifier.getCertifiedLevel(sendWallet))
      .then((response) => {
        let certifiedLevel = response;
        assert.equal(certifiedLevel, 0, "account certified for level 3");
        done();
      })
      .catch(error => done(error));
  });
});
