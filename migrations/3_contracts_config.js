var CrowdsaleContract = artifacts.require("./Crowdsale.sol");
var TokenContract = artifacts.require("./Token.sol");


module.exports = function(deployer, network, accounts) {

  /*
   * Estimating initial rate `rate`:
   * The going rate should be 2,000 tokens/$1.
   * Assume 1 ETH = $1100 USD (as of 01/25/17).
   * (1100 USD/1 ETH) * (2000 VOID/1 USD) = 2,200,000 VOID/ETH.
   */

  /*
   * Estimating hardcap `cap`:
   * The hard cap should be set at $100,000.00 USD
   * Unlike rate, the cap cannot be changed after deployment.
   * Use the assumption from before, 1 ETH = $1100 USD.
   * 100000 USD/1100 ETH/USD = 9.090909091 ETH.
   * Use the rate from before, 2200000 VOID/ETH.
   * 9.090909091 ETH * 2200000 VOID/ETH = 20,000,000.00 VOID.
   */

  let token;
  let wallet = accounts[1]; // FIXME: Set the correct wallet address before launch.
  let isPurchaseEnabled = true;

  /*
   * Both rate and cap are estimates.
   * Rate can be changed after deployment.
   * Cap can NOT be changed after deployment.
   */
  let rate = 2200000;
  let cap = 20000000;

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
