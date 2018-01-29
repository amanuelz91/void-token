pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import 'zeppelin-solidity/contracts/token/BurnableToken.sol';
import 'zeppelin-solidity/contracts/token/PausableToken.sol';
import './MultipleOwners.sol';

contract Token is MintableToken, BurnableToken, PausableToken, MultipleOwners {

	// Properties. ---------------------------
	string public name = 'VoidToken';
	string public symbol = 'VOID';
	uint public decimals = 18;
	uint public initialSupply = 12000000;

	/**
  * @dev Constructor.
  * @dev Set initial token supply and balances.
  */
	function Token (
		string _name,
		string _symbol,
		uint _decimals,
		uint _initialSupply
	)
	public {
		// Set initial state from params.
		name = _name;
		symbol = _symbol;
		decimals = _decimals;
		initialSupply = _initialSupply;
		// Set total supply and initial balance.
		totalSupply = initialSupply;
		balances[msg.sender] = initialSupply;
	}
}
