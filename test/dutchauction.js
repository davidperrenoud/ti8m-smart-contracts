//var DutchAuction = artifacts.require('./contracts/DutchAuction.sol');
//var SimpleCertifier = artifacts.require('./contracts/SimpleCertifier.sol');

contract('DutchAuction', function(accounts){
    it('should check if the auction is active', function(){
        return DutchAuction.deployed().then(function(instance){
            return instance.isActive();
        }).then((response) => {
            assert.equal(response, true, 'the auction is not active');
        });
    });
    it('should check if the account is certified', function(){
        return SimpleCertifier.deployed().then(function(instance) {
            instance.certify(accounts[0], 1);
            return instance.certified(accounts[0]);
        }).then(function (response) {
            assert.equal(response, true, 'the account is not certified');
        });
    });
    it('should check if a certified account can buy', function() {
        return DutchAuction.deployed().then(function(instance) {

            let amount = web3.toWei(0.01, "ether");

            return instance.sendTransaction({
                                                from: accounts[0],
                                                value: amount
                                            });
        }).then(function (response) {
            assert.ok(response.tx, 'transaction not working');
        });
    });
    it('should check if the account is not certified', function() {
        return SimpleCertifier.deployed().then(function(instance) {
            instance.revoke(accounts[0]);
            return instance.certified(accounts[0]);
        }).then(function (response) {
            assert.equal(response, false, 'the account is certified');
        });
    });
    it('should check if a not certified account can buy', () => {
        return DutchAuction.deployed().then(function(instance) {

            let amount = web3.toWei(0.01, "ether");

            return instance.sendTransaction({
                                                from: accounts[0],
                                                value: amount
                                            });
        }).then(function(response) {
            assert(false, "it was supposed to throw an error but didn't.");
        }).catch(function(error) {
            assert(true, "Test failed.");
        });
    });
});


