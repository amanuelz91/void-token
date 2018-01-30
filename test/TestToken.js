const TokenMock = artifacts.require('Token');
const BigNumber = web3.BigNumber;

// Properties/constructor args.
const NAME = 'VoidToken';
const SYMBOL = 'VOID';
const DECIMALS = 18;
const INITIAL_SUPPLY = 0;

/*
* @dev Test initial constants/constructor.
* @dev Tests that all initial properties are set correctly.
* @dev These might not be too useful, but they do provide a sanity check.
* @dev If tests are failing, it's likely that the initial properties changed.
*/
contract('TokenMock', function(accounts) {

  let contract;

  beforeEach('deploy new TokenMock', async () => {
      contract = await TokenMock.new(NAME, SYMBOL, DECIMALS, INITIAL_SUPPLY, {gas: 3000000})
  });

  describe('Initial Properties', function(){

    //it('should have owners setup'});

    it('should have correct name', async function(){
      let name = await contract.name();
      assert.equal(name, NAME, 'Incorrect name.');
    });

    it('should have correct symbol',async () => {
      let symbol = await contract.symbol();
      assert.equal(symbol, SYMBOL, 'Incorrect symbol.');
    });

    it('should have correct decimals', async function(){
      let decimals = await contract.decimals();
      assert.equal(decimals, DECIMALS, 'Incorrect decimals.');
    });

    it('should have correct initial supply', async function(){
      let initial_supply = await contract.initialSupply();
      assert.equal(
        initial_supply, INITIAL_SUPPLY, 'Incorrect initial supply.'
      );
    });

    it('should have correct total supply', async function(){
      let initial_supply = await contract.initialSupply();
      let totat_supply = await contract.totalSupply();
      assert.equal(
        totat_supply.valueOf(), initial_supply.valueOf(), 'Incorrect total supply.'
      );
    });
  });

  describe('Ownership', function(){
    /*
      FIXME: MultipleOwners.sol currenly lacks events and a getter method
      with which to get the current contract owners.
      Events and an isOwner() method should be added before writing ownership tests.
    */

    it('should allow owner to add owners')
    it('should not allow non-owner to add owners')
  });

  describe('Transfer', function(){

    it('should transfer token between peers', async function(){
      sender_address = accounts[2]
      recipient_address = '0x1d66F4829773a92E0468528330EbA101241c6610';
      amount_to_mint = 200
      amount_to_transfer = 32

      // Make sure sender balance is zero.
      balance_sender_initial = await contract.balanceOf(sender_address)
      assert.equal(balance_sender_initial, 0, 'Initial token balance of sender is non-zero.')
      // Make sure recipient balance is zero.
      balance_recipient_initial = await contract.balanceOf(recipient_address)
      assert.equal(balance_recipient_initial, 0, 'Initial token balance of recipient is non-zero.')
      // Mint tokens.
      await contract.mint(sender_address, amount_to_mint)
      balance_mint = await contract.balanceOf(sender_address)
      assert.equal(balance_mint, amount_to_mint, 'Recipient balance not updated after minting.')
      // Transfer tokens to arbitrary address.
      await contract.transfer(recipient_address, amount_to_transfer, { from: sender_address });
      // Get recipient balance.
      balance_recipient_final = await contract.balanceOf(recipient_address)
      balance_recipient_expected = balance_recipient_initial.add(amount_to_transfer)
      assert.equal(
        balance_recipient_final.valueOf(),
        balance_recipient_expected.valueOf(),
        'Recipient balance incorrect after transfer.'
      );
    });

    it('should revert transfer between peers if balance insufficient', async function(){
      sender_address = accounts[8]
      recipient_address = '0x426A4C0a885A484CEd9340379eDDc7ce34F76Dc0';
      amount_to_mint = 72
      amount_to_transfer = amount_to_mint + 1

      // Make sure sender balance is zero.
      balance_sender_initial = await contract.balanceOf(sender_address)
      assert.equal(balance_sender_initial, 0, 'Initial token balance of sender is non-zero.')
      // Make sure recipient balance is zero.
      balance_recipient_initial = await contract.balanceOf(recipient_address)
      assert.equal(balance_recipient_initial, 0, 'Initial token balance of recipient is non-zero.')
      // Mint tokens.
      await contract.mint(sender_address, amount_to_mint)
      balance_mint = await contract.balanceOf(sender_address)
      assert.equal(balance_mint, amount_to_mint, 'Recipient balance not updated after minting.')
      // Transfer tokens.
      try {
        let transaction = await contract.transfer(recipient_address, amount_to_transfer, { from: sender_address });
      } catch(error) {
        reverted = true;
      }
      assert.isTrue(reverted, 'Transfer did not revert with insufficient balance.');
    });
  });

  /*
  * @dev Tests for isTransferEnabled().
  * @dev Try to avoid writing tests for zepplin contracts/dependencies
  * @dev unless the function has been modified, such as with transfer().
  */
  describe('PausableToken', function() {

    it('should ensure token is not paused', async function(){
      let paused = await contract.paused();
      assert.isFalse(paused, 'Token is paused when it should not be.')
    });

    it('should pause token', async function(){
      // Make sure token is not paused.
      let paused_initial = await contract.paused();
      if(paused_initial){
        await contract.unpause()
        paused_initial = await contract.paused();
      }
      assert.isFalse(paused_initial, 'Token is paused when it should not be.')
      await contract.pause();
      let paused_final = await contract.paused()
      assert.isTrue(paused_final, 'Pause is false after pausing.')
    });

    it('should unpause token', async function(){
      // Make sure token is paused.
      let paused_initial = await contract.paused();
      if(!paused_initial){
        await contract.pause()
        paused_initial = await contract.paused();
      }
      assert.isTrue(paused_initial, 'Token is not paused when it should be.')
      await contract.unpause()
      let paused_final = await contract.paused()
      assert.isFalse(paused_final, 'Pause is true after unpausing.')
    });

    it('should prevent transfers when token is paused')
    it('should allow transfers when token is unpaused')
  });

  describe('MintableToken', function() {

    it('should ensure mintingFinished is false ', async () => {
      mintingFinished = await contract.mintingFinished()
      assert.isFalse(mintingFinished, 'Minting is finished when it should not be.')
    });

    it('should mint tokens if mintingFinished is false', async() => {
      address = accounts[2]
      amount = 200
      // Make sure mintingFinished is false.
      mintingFinished = await contract.mintingFinished()
      assert.isFalse(mintingFinished, 'Minting is finished when it should not be.')
      // Make sure address token balance is zero.
      balance_initial = await contract.balanceOf(address)
      assert.equal(balance_initial, 0, 'Initial token balance of recipient is non-zero.')
      // Mint tokens.
      await contract.mint(address, amount)
      balance_final = await contract.balanceOf(address)
      assert.equal(balance_final, amount, 'Recipient balance not updated after minting.')
    });

    it('should not mint tokens if mintingFinished is true', async() => {
      address = accounts[2]
      amount = 200
      // Make sure mintingFinished is true.
      mintingFinished = await contract.mintingFinished()
      if(!mintingFinished){
        await contract.finishMinting()
        mintingFinished = await contract.mintingFinished()
      }
      assert.isTrue(mintingFinished, 'Minting is not finished when it should be.')

      try {
        let transaction = await contract.mint(address, amount);
      } catch(error) {
        reverted = true;
      }
      assert.isTrue(reverted, 'Mint did not revert when mintingFinished was true.');
    });

    it('should allow to mint only from owners');
    it('should disallow to mint from non owners');
  });

  describe('BurnableToken', function() {

    it('should allow user to burn tokens', async () => {
      address = accounts[3];
      amount = 500;
      amount_to_burn = 120;
      // Make sure mintingFinished is false.
      mintingFinished = await contract.mintingFinished();
      assert.isFalse(mintingFinished, 'Minting is finished when it should not be.');
      // Mint tokens.
      await contract.mint(address, amount)
      balance_initial = await contract.balanceOf(address)
      assert.isTrue(balance_initial >= amount, 'Mint did not properly increment balance.')
      // Burn tokens.
      await contract.burn(amount_to_burn, {from: address})
      balance_final = await contract.balanceOf(address)
      // Use BigNumber subtraction to prevent rounding errors.
      balance_expected = balance_initial.sub(amount_to_burn),
      assert.equal(balance_final.valueOf(), balance_expected.valueOf(), 'Burn did not properly decrement balance.')
    });

    it('should not allow user to burn more tokens than balance', async () => {
      address = accounts[3];
      amount = 400;
      amount_to_burn = amount + 1;
      // Make sure mintingFinished is false.
      mintingFinished = await contract.mintingFinished();
      assert.isFalse(mintingFinished, 'Minting is finished when it should not be.');
      // Mint tokens.
      await contract.mint(address, amount)
      balance = await contract.balanceOf(address)
      assert.isTrue(balance >= amount, 'Mint did not properly increment balance.')
      // Burn tokens.
      try {
        let transaction = await contract.burn(amount_to_burn, {from: address})
      } catch(error) {
        reverted = true;
      }
      assert.isTrue(reverted, 'Burn did not revert when amount was larger than balance.');
    });

    it('should decrement total supply when tokens are burnt', async () => {
      address = accounts[3];
      amount = 40;
      amount_to_burn = 6;
      // Make sure mintingFinished is false.
      mintingFinished = await contract.mintingFinished();
      assert.isFalse(mintingFinished, 'Minting is finished when it should not be.');
      // Mint tokens.
      await contract.mint(address, amount)
      balance_initial = await contract.balanceOf(address)
      assert.isTrue(balance_initial >= amount, 'Mint did not properly increment balance.')
      // Get initial total supply.
      totalSupply_initial = await contract.totalSupply()
      // Burn tokens.
      await contract.burn(amount_to_burn, {from: address})
      // Get final total supply.
      totalSupply_final = await contract.totalSupply()
      totalSupply_expected = totalSupply_initial.sub(amount_to_burn)
      // Use BigNumber subtraction to prevent rounding errors.
      assert.equal(totalSupply_final.valueOf(), totalSupply_expected.valueOf(), 'Burn did not properly decrement totalSupply.')
    });
  });
});






























// Anchors the page so I don't strain my neck.
