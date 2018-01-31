var SimpleCertifier = artifacts.require("./contracts/SimpleCertifier.sol");

contract('SimpleCertifier', function(accounts) {
    it('should certify an account for level 1', function(){
        return SimpleCertifier.deployed().then(function(instance) {
            return instance.certify(accounts[0], 1, 0, 0).then(function(){
                return instance.certified(accounts[0]);
            });
        }).then(function (response) {
            assert.equal(response, true, 'the account is not certified for level 2');
        });
    });
    it("should certify an account for level 2", function() {
        return SimpleCertifier.deployed().then(function(instance) {
            return instance.certify(accounts[0], 2, 0, 0).then(function(){
                return instance.highlyCertified(accounts[0]);
            });
        }).then(function (response) {
            assert.equal(response, true, 'the account is not certified for level 2');
        });
    });
    it("should revoke the certification for an account", function() {
        return SimpleCertifier.deployed().then(function(instance) {
            instance.revoke(accounts[0]);
            return instance.certified(accounts[0]);
        }).then(function(response) {
            assert.equal(response, false, "the account is certified");
        });
    });
});


