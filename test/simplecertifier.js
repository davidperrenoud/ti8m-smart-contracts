// Print the deployed version of SimpleCertifier.
// Note that getting the deployed version requires a promise, hence the .then.
let SimpleCertifier = artifacts.require("./contracts/SimpleCertifier.sol");

contract('SimpleCertifier', function(accounts) {
    it("should certify an account for level 1", function() {
        return SimpleCertifier.deployed().then(function(instance) {
            instance.certify(accounts[0], 1);
            return instance.certified(accounts[0]);
        }).then(function(response) {
            assert.equal(response, true, "the account is not certified");
        });
    });
    it("should certify an account for level 2", function() {
        return SimpleCertifier.deployed().then(function(instance) {
            instance.certify(accounts[0], 2);
            return instance.certified(accounts[0]);
        }).then(function(response) {
            assert.equal(response, true, "the account is not certified");
        });
    });
    it("should certify an account for level 3", function() {
        return SimpleCertifier.deployed().then(function(instance) {
            instance.certify(accounts[0], 3);
            return instance.certified(accounts[0]);
        }).then(function(response) {
            assert.equal(response, true, "the account is not certified");
        });
    });
    it("should revoke the certification for an account", function() {
        return SimpleCertifier.deployed().then(function(instance) {
            instance.revoke(accounts[0]);
            return instance.certified(accounts[0]);
        }).then(function(response) {
            assert.equal(response, false, "the account is not certified");
        });
    });
});


