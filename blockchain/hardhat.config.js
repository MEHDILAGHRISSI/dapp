require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Ajouter le préfixe 0x si nécessaire
const addPrefix = (key) => {
  if (!key) return "0x" + "1".repeat(64); // Clé dummy si vide
  return key.startsWith("0x") ? key : "0x" + key;
};

const SEPOLIA_RPC_URL = process.env.RPC_URL || "https://sepolia.infura.io/v3/9bb9205c91274c548d54949fce59ff3c";
const PRIVATE_KEY_OWNER = addPrefix(process.env.PRIVATE_KEY);
const PRIVATE_KEY_TENANT = addPrefix(process.env.PRIVATE_KEY_TENANT);

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY_OWNER, PRIVATE_KEY_TENANT],
      chainId: 11155111,
    },
  },
};