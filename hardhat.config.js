require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks:{
    ganache: {
      url: "HTTP://127.0.0.1:7545",
      // change private key
      accounts:['29a3d49a108569c3424df48892a6accdb031bdd7a9a0d29ad416e6ee8aabd0f4']
    }
  },
  solidity: "0.8.17",
};
