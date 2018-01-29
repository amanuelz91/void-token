var CrowdsaleContract = artifacts.require('./Crowdsale.sol');
var MultipleOwners = artifacts.require('./MultipleOwners.sol');

module.exports = function(deployer, network, accounts) {

  if (network == "develop" || network == "development") {
    var _rate = web3.toWei(2000000); // 2,000,000 VOID/ETH.
    var _wallet = accounts[2];
    var _isPurchaseEnabled = true;
    var _hardCap = web3.toWei(200000000, "ether"); // 200,000,000 VOID.

  } else if (network == "rinkeby") {
    var _rate = web3.toWei(2000000); // 2,000,000 VOID/ETH.
    // FIXME: Set correct testnet wallet address.
    var _wallet = "0x0000000000000000000000000000000000000000";
    var _isPurchaseEnabled = true;
    var _hardCap = web3.toWei(200000000, "ether"); // 200,000,000 VOID.

  } else if (network == "mainnet") {
    var _rate = web3.toWei(2000000); // 2,000,000 VOID/ETH.
    // FIXME: Set correct wallet address before launch.
    var _wallet = "0x0000000000000000000000000000000000000000";
    var _isPurchaseEnabled = true;
    var _hardCap = web3.toWei(200000000, "ether"); // 200,000,000 VOID.
  }

  deployer.deploy(CrowdsaleContract, _rate, _wallet, _hardCap, {gas: 3000000});
  deployer.deploy(MultipleOwners);
};
