require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks:{
    ganache: {
      url: "HTTP://127.0.0.1:7545",
      // change private key
      accounts:['91c58e78509f48e4d0b6b7a40b1fd8e0d6b4c94e9abdc86463032e354a5fc970']
    }
  },
  solidity: "0.8.17",
};
