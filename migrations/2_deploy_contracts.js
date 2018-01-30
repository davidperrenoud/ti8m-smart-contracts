let SimpleCertifier = artifacts.require('./SimpleCertifier.sol');
let DutchAuction = artifacts.require('./DutchAuction.sol');
let BasicCoin = artifacts.require('./BasicCoin.sol');

const _treasury = ' 0xf17f52151ebef6c7334fad080c5704d77216b732';
const _admin = '0x627306090abab3a6e1400e9345bc60c78a8bef57';
//const _beginTime = Math.round(+new Date()/1000);
const _beginTime = 1517303425;
const _beginPrice = 10000;
const _saleSpeed = 1;
const _tokenCap = 10;

module.exports = function (deployer) {
    deployer.deploy(SimpleCertifier).then(() => {
        return deployer.deploy(BasicCoin, 10, _admin).then(() => {
            return deployer.deploy(DutchAuction, SimpleCertifier.address, BasicCoin.address, _treasury, _admin,
                            _beginTime, _beginPrice, _saleSpeed, _tokenCap);
        });
    });
};
