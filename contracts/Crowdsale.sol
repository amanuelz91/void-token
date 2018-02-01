pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/lifecycle/Pausable.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './Token.sol';

contract Crowdsale is Pausable {

  using SafeMath for uint256;
  // Properties. ---------------------------
  address public wallet; // Address to which funds can be withdrawn.
  uint256 public cap; // Fixed cap for this round of the sale.
  uint256 public rate; // How many token units a buyer gets per wei.
  uint256 public weiRaised; // Amount of raised money in wei.
  Token public token; // The token being sold.

  // Events.
  event Purchase(address indexed from, address indexed to, uint256 value, uint256 tokens);

  /**
  * @dev Constructor.
  * @dev Set initial contract state.
  */
  function Crowdsale(
    address _wallet,
    uint _rate,
    uint _cap
  )
  public {
    wallet = _wallet;
    rate = _rate;
    cap = _cap;
  }

  /*
  * creates the token to be sold.
  * Overrides OpenZepellin function to use
  */
  function assignTokenContract(address tokenContract) public onlyOwner {
    require(token == address(0));
    token = Token(tokenContract);
  }

  /*
  * @dev Fallback function can be used to buy tokens.
  */
  function () external payable {
    buyTokens(msg.sender);
  }

  /*
  * @dev Low level token purchase function.
  * @param beneficiary The address with which to send purchased tokens.
  */
  function buyTokens(address beneficiary) public payable {
    require(beneficiary != address(0));
    require(validPurchase());

    uint256 weiAmount = msg.value;
    // Calculate token amount to be created
    uint256 tokens = weiAmount.mul(rate);
    // Increment total amount of wei raised.
    weiRaised = weiRaised.add(weiAmount);

    token.mint(beneficiary, tokens);
    Purchase(msg.sender, beneficiary, weiAmount, tokens);
    forwardFunds();
  }

  /*
  * @dev Send ether to the fund collection wallet.
  */
  function forwardFunds() internal {
    wallet.transfer(msg.value);
  }

  /*
  * @dev Similar to validPurchase() function in OpenZepellin CappedCrowdsale.sol.
  * @dev Includes check for pause.
  * @returns true if the transaction can buy tokens.
  */
  function validPurchase() internal view returns (bool) {
    bool nonZeroPurchase = msg.value != 0;
    bool withinCap = weiRaised.add(msg.value) <= cap;
    return !paused && nonZeroPurchase && withinCap;
  }

  /*
  * @dev Determines if the crowdsale has ended.
  * @dev Similar to hasEnded() function in OpenZepellin CappedCrowdsale.sol.
  * @returns true if the cap has not been reached.
  */
  function hasEnded() public view returns (bool) {
    bool capReached = weiRaised >= cap;
    return capReached;
  }

  /**
  * @dev Destroy the contract and drain any remaining ether.
  */
  function selfDestruct() public onlyOwner {
    selfdestruct(wallet);
  }
}
