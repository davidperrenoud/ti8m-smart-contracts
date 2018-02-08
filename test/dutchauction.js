var DutchAuction = artifacts.require('./contracts/DutchAuction.sol');
var SimpleCertifier = artifacts.require('./contracts/SimpleCertifier.sol');

contract('DutchAuction', function(accounts){
    it('should check if the auction is active', function(){
        return DutchAuction.deployed().then(function(instance){
            return instance.isActive();
        }).then((response) => {
            assert.equal(response, true, 'the auction is not active');
        });
    });
    it('should check if a certified levels account can buy according to the limit', function() {
        return SimpleCertifier.deployed().then(function(instance) {
            return instance.certify(accounts[1], 1, 0, 0).then(function(){
                return DutchAuction.deployed().then(function(instance) {

                    let amount = web3.toWei(0.5, "ether");

                    return instance.sendTransaction({
                                                        from: accounts[1],
                                                        value: amount
                                                    });
                }).then(function (response) {
                    assert.ok(response.tx, 'transaction not working');
                });
            });

            return instance.certify(accounts[2], 2, 0, 0).then(function(){
                return DutchAuction.deployed().then(function(instance) {

                    let amount = web3.toWei(2, "ether");
                    return instance.sendTransaction({
                                                        from: accounts[2],
                                                        value: amount
                                                    });
                }).then(function (response) {
                    assert.ok(response.tx, 'transaction not working');
                });
            });
        })
    });
    it('should check if a not certified account can buy', function() {
        return SimpleCertifier.deployed().then(function(instance) {
            return instance.revoke(accounts[0]).then(function(){
                return DutchAuction.deployed().then(function(instance) {

                    let amount = web3.toWei(1, "ether");
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
        })
    });
    it('should check if a certified level 1 account can buy with a higher limit', function() {
        return SimpleCertifier.deployed().then(function(instance) {
            return instance.certify(accounts[1], 1, 0, 0).then(function(){
                return DutchAuction.deployed().then(function(instance) {

                    let amount = web3.toWei(2, "ether");
                    return instance.sendTransaction({
                                                        from: accounts[2],
                                                        value: amount
                                                    });
                }).then(function(response) {
                    assert(false, "it was supposed to throw an error but didn't.");
                }).catch(function(error) {
                    assert(true, "Test failed.");
                });
            });
        })
    });
});


