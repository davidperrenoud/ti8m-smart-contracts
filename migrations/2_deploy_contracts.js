var SimpleCertifier = artifacts.require('./SimpleCertifier.sol');
var DutchAuction = artifacts.require('./DutchAuction.sol');
var BasicCoin = artifacts.require('./BasicCoin.sol');

module.exports = function (deployer, network, accounts) {
    const _treasury = accounts[5];
    const _admin = accounts[0];
    const _beginTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
    const _beginPrice = 100;
    const _saleSpeed = 1;
    const _tokenCap = 1;

    deployer.deploy(SimpleCertifier).then(() => {
        return deployer.deploy(BasicCoin, 10, _admin).then(() => {
            return deployer.deploy(DutchAuction, SimpleCertifier.address, BasicCoin.address, _treasury, _admin,
                            _beginTime, _beginPrice, _saleSpeed, _tokenCap);
        });
    });
};
