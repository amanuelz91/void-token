var CrowdsaleContract = artifacts.require("./Crowdsale.sol");
var TokenContract = artifacts.require("./Token.sol");


module.exports = function(deployer, network, accounts) {

  let token;
  let wallet = accounts[1];
  let isPurchaseEnabled = true;
  let rate = 2;
  let cap = 600000;

  deployer.then(() => {
      return deployer.deploy(TokenContract, wallet, isPurchaseEnabled, rate, cap, {gas: 3000000});
  }).then((result) => {
      return TokenContract.deployed();
  }).then((instance) => {
      token = instance;
      return token.addOwner(CrowdsaleContract.address);
  }).then((result) => {
      return CrowdsaleContract.deployed();
  }).then((instance) => {
      return instance.assignTokenContract(token.address);
  });
};
