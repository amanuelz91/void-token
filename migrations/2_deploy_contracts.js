var TokenContract = artifacts.require('./Token.sol');
var PresaleContract = artifacts.require('./Crowdsale.sol');
var MultipleOwners = artifacts.require('./MultipleOwners.sol');

module.exports = function(deployer, network, accounts) {

  deployer.deploy(MultipleOwners);

  /* Token parameters. */
  let _name = 'Void';
  let _symbol = 'VOID';
  let _decimals = 18;
  let _initialSupply = web3.toWei('20000000', 'ether');
  let _isTransferEnabled = true;

  /* Crowdsale parameters. */
  let _wallet = accounts[1]; // FIXME: Change this address.
  let _isPurchaseEnabled = true;
  let _rate = 2200000; // See estimates in 3_contracts_config.js.
  let _cap = _initialSupply; // See estimates in 3_contracts_config.js.

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
