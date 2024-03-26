require('@nomiclabs/hardhat-waffle');
require('dotenv').config({ path: '.env' });

module.exports = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  allowUnlimitedContractSize: true,
  networks: {
    hardhat: {
      // allowUnlimitedContractSize: true,
      chainId: 1337,
    },
    sepolia: {
      url: process.env.API_KEY,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111,
    },
  },
  settings: { optimizer: { enabled: true, runs: 200 } },  
};
