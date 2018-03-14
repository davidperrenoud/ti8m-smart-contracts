var SimpleCertifier = artifacts.require("./contracts/SimpleCertifier.sol");

contract("SimpleCertifier", function(accounts) {
  it("should certify an account for level 1", () => {
    return SimpleCertifier.deployed()
      .then(function(instance) {
        return instance.certify(accounts[0], 1, accounts[0]).then(function() {
          return instance.certified(accounts[0]);
        });
      })
      .then(function(response) {
        assert.equal(
          response,
          1,
          "the account is not certified for level 1"
        );
      });
  });
  it("should certify an account for level 2", () => {
    return SimpleCertifier.deployed()
      .then(function(instance) {
        return instance.certify(accounts[0], 2, accounts[0]).then(function() {
          return instance.certified(accounts[0]);
        });
      })
      .then(function(response) {
        assert.equal(
          response,
          2,
          "the account is not certified for level 2"
        );
      });
  });
  it("should certify an account for level 3", () => {
    return SimpleCertifier.deployed()
      .then(function(instance) {
        return instance.certify(accounts[0], 3, accounts[0]).then(function() {
          return instance.certified(accounts[0]);
        });
      })
      .then(function(response) {
        assert.equal(
          response,
          3,
          "the account is not certified for level 3"
        );
      });
  });
  it("should revoke the certification for an account", () => {
    return SimpleCertifier.deployed()
      .then(function(instance) {
        instance.revoke(accounts[0]);
        return instance.certified(accounts[0]);
      })
      .then(function(response) {
        assert.equal(response, 0, "the account is certified");
      });
  });
});
