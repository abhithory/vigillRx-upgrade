require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks:{
    ganache: {
      url: "HTTP://127.0.0.1:7545",
      // change private key
      accounts:['45ab33005aa88c036a9032b9d3b65cf2b38940ed14a5f6af815c10bc7dd26e92']
    }
  },
  solidity: "0.8.17",
};
