var TokenContract = artifacts.require('./Token.sol');
var PresaleContract = artifacts.require('./Crowdsale.sol');
var MultipleOwners = artifacts.require('./MultipleOwners.sol');

module.exports = function(deployer, network, accounts) {

  deployer.deploy(MultipleOwners);

  /* Token parameters. */
  let _name = 'Void';
  let _symbol = 'VOID';
  let _decimals = 18;
  let _initialSupply = 12000000;
  let _isTransferEnabled = true;

  /* Crowdsale parameters. */
  let _wallet = accounts[1];
  let _isPurchaseEnabled = true;
  let _rate = 1; // Replaced by 3_contracts_config.js.
  let _cap = _initialSupply; // Replaced by 3_contracts_config.js.

  deployer.deploy(
    TokenContract,
    _name,
    _symbol,
    _decimals,
    _initialSupply,
    _isTransferEnabled,
    {gas: 3000000}
  );

  deployer.deploy(
    PresaleContract,
    _wallet,
    _isPurchaseEnabled,
    _rate,
    _cap,
    {gas: 3000000}
  );
};
