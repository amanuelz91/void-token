pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import 'zeppelin-solidity/contracts/token/BurnableToken.sol';
import './MultipleOwners.sol';

contract Token is MintableToken, BurnableToken, MultipleOwners {

	// Properties. ---------------------------
	string public name = 'VoidToken';
	string public symbol = 'VOID';
	uint public decimals = 18;
	uint public initialSupply = 12000000;
	bool public isTransferEnabled; // Token transfers enabled/disabled.

	/**
  * @dev Constructor.
  * @dev Set initial token supply and balances.
  */
	function Token (
		string _name,
		string _symbol,
		uint _decimals,
		uint _initialSupply,
		bool _isTransferEnabled
	)
	public {
		// Set initial state from params.
		name = _name;
		symbol = _symbol;
		decimals = _decimals;
		initialSupply = _initialSupply;
		isTransferEnabled = _isTransferEnabled;
		// Set total supply and initial balance.
		totalSupply = initialSupply;
		balances[msg.sender] = initialSupply;
	}

	// Override transfer(). ---------------------------

	/**
	* @dev Enable or disable the ability to transfer tokens.
	* @dev Should not affect ability to purchase tokens.
	*/
	function toggleTransfers() public onlyOwner returns (bool) {
		isTransferEnabled = !isTransferEnabled;
		return true;
	}

	/**
  * @dev Transfer tokens to a specified address.
	* @dev Overrides the normal transfer() function
	* @dev to add a check for isTransferEnabled.
  * @param _to The address to transfer to.
  * @param _value The amount to be transferred.
  */
  function transfer(address _to, uint256 _value) public returns (bool) {
    require(_to != address(0));
    require(_value <= balances[msg.sender]);
		require(isTransferEnabled); // Allows token transfers to be disabled.

    // SafeMath.sub will throw if there is not enough balance.
    balances[msg.sender] = balances[msg.sender].sub(_value);
    balances[_to] = balances[_to].add(_value);
    Transfer(msg.sender, _to, _value);
    return true;
  }
}
