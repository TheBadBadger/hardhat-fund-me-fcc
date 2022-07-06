// function deployFunc() {
//   console.log("Hi!");
// }
// module.exports.default = deployFunc;

// module.exports = async (hre) => {
//     const {getNamedAccounts, deployments} = hre
// }

const { getNamedAccounts, deployments, network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId

  //if chainId is X use address Y
  //if chainId is Z use address Z

  // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
  let ethUsdPriceFeedAddress
  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator")
    ethUsdPriceFeedAddress = ethUsdAggregator.address
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
  }

  // if the contract doestnt excist, we deploy a minimal version of our local testing

  // well what happens when we want to change chains?

  // when going for localhost or hardhat network we want to use a mock
  const args = [ethUsdPriceFeedAddress]
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  })

  if (!developmentChains.includes(network.name) && process.env.ETHER_API) {
    await verify(fundMe.address, args)
  }
  log("------------------------------------------------------------")
}

module.exports.tags = ["all", "fundme"]
