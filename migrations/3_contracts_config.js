var CrowdsaleContract = artifacts.require("./Crowdsale.sol");
var TokenContract = artifacts.require("./Token.sol");


module.exports = function(deployer, network, accounts) {

  _name = 'VoidToken'
  _symbol = 'VOID'
  _decimals = 18
  _initialSupply = 0

  deployer.then(() => {
      return deployer.deploy(TokenContract, _name, _symbol, _decimals, _initialSupply, {gas: 3000000});
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
