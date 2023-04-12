require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks:{
    ganache: {
      url: "HTTP://127.0.0.1:7545",
      // change private key
      accounts:['1d45a80cacabebb93722db58ea5ddd9165289497954bd83a929a61f482ca1a32']
    }
  },
  solidity: "0.8.17",
};
