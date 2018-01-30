let SimpleCertifier = artifacts.require('./SimpleCertifier.sol');
let DutchAuction = artifacts.require('./DutchAuction.sol');
let BasicCoin = artifacts.require('./BasicCoin.sol');

module.exports = function (deployer, network, accounts) {
    const _treasury = accounts[1];
    const _admin = accounts[0];
    const _beginTime = web3.eth.getBlock(web3.eth.blockNumber).timestamp
    const _beginPrice = 10000;
    const _saleSpeed = 1;
    const _tokenCap = 10;

    deployer.deploy(SimpleCertifier).then(() => {
        return deployer.deploy(BasicCoin, 10, _admin).then(() => {
            return deployer.deploy(DutchAuction, SimpleCertifier.address, BasicCoin.address, _treasury, _admin,
                            _beginTime, _beginPrice, _saleSpeed, _tokenCap);
        });
    });
};
