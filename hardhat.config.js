require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    ganache: {
      url: "HTTP://127.0.0.1:8545",
      // change private key
      accounts: ['0xec47be5b93239312af7e262f722d246f8e5e7ee4362ab44064a7ea16e0e5fbfb']
    }
  },
  solidity: "0.8.17",
};
