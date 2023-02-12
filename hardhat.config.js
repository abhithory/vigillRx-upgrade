require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks:{
    ganache: {
      url: "HTTP://127.0.0.1:7545",
      // change private key
      accounts:['418dd49831cd916faa18cd7d689f4406ec712acfbc1c5991aa7da3c765789720']
    }
  },
  solidity: "0.8.17",
};
