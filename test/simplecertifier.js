var SimpleCertifier = artifacts.require("./contracts/SimpleCertifier.sol");

contract("SimpleCertifier", (accounts) => {
  administrator = accounts[5];
  simpleCertifier = null;

  beforeEach((done) => {
    SimpleCertifier.new({ from: administrator })
      .then(contract => {
        simpleCertifier = contract;
        done();
      })
      .catch(error => done(error));
  })

  it("should not certify an account if not delegate", (done) => {
    simpleCertifier.certify(accounts[0], 1, accounts[0], { from: accounts[1] })
      .then(() => simpleCertifier.getCertifiedLevel(accounts[0]))
      .then((response) => {
        assert.equal(response, 0, "account certified for level 1");
        done();
      })
      .catch(error => done(error));
  })

  it("should certify an account for level 1", (done) => {
    simpleCertifier.certify(accounts[0], 1, accounts[0], { from: administrator })
      .then(() => simpleCertifier.getCertifiedLevel(accounts[0]))
      .then((response) => {
        assert.equal(response, 1, "account not certified for level 1");
        done();
      })
      .catch(error => done(error));
  });

  it("should certify an account for level 2", (done) => {
    simpleCertifier.certify(accounts[0], 2, accounts[0], { from: administrator })
      .then(() => simpleCertifier.getCertifiedLevel(accounts[0]))
      .then((response) => {
        assert.equal(response, 2, "account not certified for level 2");
        done();
      })
      .catch(error => done(error));
  });

  it("should certify an account for level 3", (done) => {
    simpleCertifier.certify(accounts[0], 3, accounts[0], { from: administrator })
      .then(() => simpleCertifier.getCertifiedLevel(accounts[0]))
      .then((response) => {
        assert.equal(response, 3, "account not certified for level 3");
        done();
      })
      .catch(error => done(error));
  });

  it("should revoke the certification for an account", (done) => {
    simpleCertifier.certify(accounts[0], 3, accounts[0], { from: administrator })
      .then(() => simpleCertifier.getCertifiedLevel(accounts[0]))
      .then((response) => {
        assert.equal(response, 3, "account not certified for level 3");
        return simpleCertifier.revoke(accounts[0], { from: administrator });
      })
      .then(() => simpleCertifier.getCertifiedLevel(accounts[0]))
      .then((response) => {
        assert.equal(response, 0, "the account is certified");
        done();
      })
      .catch(error => done(error));
  });
});
