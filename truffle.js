const ganache = require("ganache-cli");

module.exports = {
  rpc: {
    host: "localhost",
    port: 8545
  },
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 4712388
    },
    in_memory: {
      provider: ganache.provider(),
      network_id: "*"
    }
  }
};
