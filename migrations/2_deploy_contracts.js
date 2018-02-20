const SimpleCertifier = artifacts.require("./SimpleCertifier.sol");
const DutchAuction = artifacts.require("./DutchAuction.sol");
const BasicCoin = artifacts.require("./BasicCoin.sol");

const toPromise = nodeStyleCallback => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      nodeStyleCallback(...args, (error, response) => {
        if (error) {
          return reject(error);
        }
        resolve(response);
      });
    });
  };
};

module.exports = function(deployer, network, accounts) {
  const _treasury = accounts[5];
  const _admin = accounts[0];
  const _beginPrice = 100;
  const _saleSpeed = 1;
  const _tokenCap = 1;

  const getBlockNumber = toPromise(web3.eth.getBlockNumber);
  const getBlock = toPromise(web3.eth.getBlock);

  deployer
    .deploy(SimpleCertifier)
    .then(() => deployer.deploy(BasicCoin, 10, _admin))
    .then(() => getBlockNumber())
    .then(blockNumber => getBlock(blockNumber))
    .then(block =>
      deployer.deploy(
        DutchAuction,
        SimpleCertifier.address,
        BasicCoin.address,
        _treasury,
        _admin,
        block.timestamp,
        _beginPrice,
        _saleSpeed,
        _tokenCap
      )
    )
    .catch(console.error);
};
