var DutchAuction = artifacts.require("./contracts/DutchAuction.sol");
var SimpleCertifier = artifacts.require("./contracts/SimpleCertifier.sol");

contract("DutchAuction", function(accounts) {
  it("should check if the auction is active", () => {
    return DutchAuction.deployed()
      .then((instance) => {
        return instance.isActive();
      })
      .then(response => {
        assert.equal(response, true, "the auction is not active");
      });
  });
  it("should check if a certified levels account can buy according to the limit", () => {
    return SimpleCertifier.deployed().then(instance => {
      return instance.certify(accounts[1], 1, 0, 0).then(() => {
        return DutchAuction.deployed()
          .then(instance => {
            const amount = web3.toWei(0.5, "ether");
            return instance.sendTransaction({
              from: accounts[1],
              value: amount
            });
          })
          .then(response => {
            assert.ok(response.tx, "transaction not working");
          });
      });

      return instance.certify(accounts[2], 2, 0, 0).then(() => {
        return DutchAuction.deployed()
          .then(instance => {
            const amount = web3.toWei(2, "ether");
            return instance.sendTransaction({
              from: accounts[2],
              value: amount
            });
          })
          .then(response => {
            assert.ok(response.tx, "transaction not working");
          });
      });
    });
  });
  it("should check if a not certified account can buy", () => {
    return SimpleCertifier.deployed().then((instance) => {
      return instance.revoke(accounts[0]).then(() => {
        return DutchAuction.deployed()
          .then((instance) => {
            const amount = web3.toWei(1, "ether");
            return instance.sendTransaction({
              from: accounts[0],
              value: amount
            });
          })
          .then((response) => {
            assert(false, "it was supposed to throw an error but didn't.");
          })
          .catch((error) => {
            assert(true, "the test failed.");
          });
      });
    });
  });
  it("should check if a certified level 1 account can buy with a higher limit", () => {
    return SimpleCertifier.deployed().then((instance) => {
      return instance.certify(accounts[1], 1, 0, 0).then(() => {
        return DutchAuction.deployed()
          .then((instance) => {
            const amount = web3.toWei(2, "ether");
            return instance.sendTransaction({
              from: accounts[2],
              value: amount
            });
          })
          .then((response) => {
            assert(false, "it was supposed to throw an error but didn't.");
          })
          .catch((error) => {
            assert(true, "the test failed.");
          });
      });
    });
  });
});
