require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    ganache: {
      url: "HTTP://127.0.0.1:7545",
      // change private key
      accounts: ['be6a7109b8eba8dcc2d3968ff34ccdbca93b06b70e6b097ccd940ac4132cbe78']
    }
  },
  solidity: "0.8.17",
};
