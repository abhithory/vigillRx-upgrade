require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks:{
    ganache: {
      url: "HTTP://127.0.0.1:7545",
      // change private key
      accounts:['965b09406f43bd7fa5eb07e923cad4ffc2f26b98ee1f9d7b52c003e206fffc6f']
    }
  },
  solidity: "0.8.17",
};
