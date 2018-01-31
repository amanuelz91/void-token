const TokenMock = artifacts.require('Token');
const BigNumber = web3.BigNumber;

/*
* @dev Test initial constants/constructor.
* @dev Tests that all initial properties are set correctly.
* @dev These might not be too useful, but they do provide a sanity check.
* @dev If tests are failing, it's likely that the initial properties changed.
*/
contract('TokenMock', function(accounts) {

  // Properties/constructor args.
  const NAME = 'VoidToken';
  const SYMBOL = 'VOID';
  const DECIMALS = 18;
  const INITIAL_SUPPLY = 0;

  let contract;

  beforeEach('deploy new TokenMock', async () => {
      contract = await TokenMock.new(NAME, SYMBOL, DECIMALS, INITIAL_SUPPLY, {gas: 3000000})
  });

  describe('Initial Properties', function(){

    it('should have correct owners');

    it('should have correct name', async function(){
      let name = await contract.name();
      assert.equal(name, NAME, 'Incorrect name.');
    });

    it('should have correct symbol', async function(){
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
      let total_supply = await contract.totalSupply();
      assert.equal(
        total_supply.valueOf(), initial_supply.valueOf(), 'Incorrect total supply.'
      );
    });
  });

  describe('Ownership', function(){

    it('should allow owner to add owners', async function() {
      const new_owner = accounts[8]
      is_owner_initial = await contract.isOwner(new_owner);
      assert.isFalse(is_owner_initial, 'Address is owner when it should not be.');
      await contract.addOwner(new_owner);
      is_owner_final = await contract.isOwner(new_owner);
      assert.isTrue(is_owner_final, 'Address is not owner after adding owner.');
    });

    it('should not allow non-owner to add owners', async function() {
      const fake_owner = '0x0D84fcDdFb862d607c547D609B61d0edA2B604c2';
      const new_owner = '0xA5668EfF3849620749AAa3a58ec197630f7bF601';
      is_owner_initial = await contract.isOwner(fake_owner);
      assert.isFalse(is_owner_initial, 'Address is owner when it should not be.');
      // Add owner.
      reverted = false;
      try {
        let transaction = await contract.addOwner(new_owner, {from: fake_owner});
      } catch(error) {
        reverted = true;
      }
      assert.isTrue(reverted, 'Transaction did not revert when adding owner as non-owner.');
    });

    it('should not allow owner to be added if already an owner', async function() {
      const owner = '0x2288EC3Dd60cA8ca4835fB69f349339Cc75797c8';
      await contract.addOwner(owner)
      is_owner = await contract.isOwner(owner);
      assert.isTrue(is_owner, 'Address is not owner when it should be.');

      // Add owner.
      reverted = false;
      try {
        let transaction = await contract.addOwner(owner);
      } catch(error) {
        reverted = true;
      }
      assert.isTrue(reverted, 'Transaction did not revert when adding owner twice.');
    });
  });

  describe('Transfer', function(){

    it('should transfer token between peers', async function(){
      const sender_address = accounts[2]
      const recipient_address = '0x1d66F4829773a92E0468528330EbA101241c6610';
      const amount_to_mint = 200
      const amount_to_transfer = 32

      // Make sure sender balance is zero.
      const balance_sender_initial = await contract.balanceOf(sender_address)
      assert.equal(balance_sender_initial, 0, 'Initial token balance of sender is non-zero.')
      // Make sure recipient balance is zero.
      const balance_recipient_initial = await contract.balanceOf(recipient_address)
      assert.equal(balance_recipient_initial, 0, 'Initial token balance of recipient is non-zero.')
      // Mint tokens.
      await contract.mint(sender_address, amount_to_mint)
      const balance_mint = await contract.balanceOf(sender_address)
      assert.equal(balance_mint, amount_to_mint, 'Recipient balance not updated after minting.')
      // Transfer tokens to arbitrary address.
      await contract.transfer(recipient_address, amount_to_transfer, { from: sender_address });
      // Get recipient balance.
      const balance_recipient_final = await contract.balanceOf(recipient_address)
      const balance_recipient_expected = balance_recipient_initial.add(amount_to_transfer)
      assert.equal(
        balance_recipient_final.valueOf(),
        balance_recipient_expected.valueOf(),
        'Recipient balance incorrect after transfer.'
      );
    });

    it('should revert transfer between peers if balance insufficient', async function(){
      const sender_address = accounts[8]
      const recipient_address = '0x426A4C0a885A484CEd9340379eDDc7ce34F76Dc0';
      const amount_to_mint = 72
      const amount_to_transfer = amount_to_mint + 1

      // Make sure sender balance is zero.
      const balance_sender_initial = await contract.balanceOf(sender_address)
      assert.equal(balance_sender_initial, 0, 'Initial token balance of sender is non-zero.')
      // Make sure recipient balance is zero.
      const balance_recipient_initial = await contract.balanceOf(recipient_address)
      assert.equal(balance_recipient_initial, 0, 'Initial token balance of recipient is non-zero.')
      // Mint tokens.
      await contract.mint(sender_address, amount_to_mint)
      const balance_mint = await contract.balanceOf(sender_address)
      assert.equal(balance_mint, amount_to_mint, 'Recipient balance not updated after minting.')
      // Transfer tokens.
      reverted = false;
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
      const paused = await contract.paused();
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

    it('should prevent transfers when token is paused', async function(){
      const sender_address = accounts[4];
      const recipient_address = '0xa505a70F9d68af2068A0D3e336f0a3A35262325c';
      const amount_to_mint = 9821;
      const amount_to_transfer = 6568;
      // Make sure token is paused.
      let paused_initial = await contract.paused();
      if(!paused_initial){
        await contract.pause()
        paused_initial = await contract.paused();
      }
      assert.isTrue(paused_initial, 'Token is not paused when it should be.')
      // Mint tokens.
      await contract.mint(sender_address, amount_to_mint)
      const sender_balance = await contract.balanceOf(sender_address);
      assert.equal(amount_to_mint, sender_balance, 'Incorrect balance after minting.');
      reverted = false;
      // Transfer tokens.
      try {
        let transaction = await contract.transfer(
          recipient_address,
          amount_to_transfer,
          {from: sender_address}
        );
      } catch(error) {
        reverted = true;
      }
      assert.isTrue(reverted, 'Transfer did not revert when token was paused.');
    });

    it('should allow transfers when token is unpaused', async function(){
      const sender_address = accounts[2];
      const recipient_address = '0x69682AF371A78827418983B9162775ae30117f1E';
      const amount_to_mint = 200000;
      const amount_to_transfer = 40000;
      // Pause token.
      await contract.pause();
      // Unpause token.
      await contract.unpause();
      // Make sure contract is not paused.
      let paused = await contract.paused();
      assert.isFalse(paused, 'Token is paused when it should not be.');
      // Make sure recipient balance is zero.
      let recipient_balance_initial = await contract.balanceOf(recipient_address)
      assert.equal(recipient_balance_initial.valueOf(), 0, 'Address has non-zero initial balance.')
      // Mint tokens.
      await contract.mint(sender_address, amount_to_mint)
      const sender_balance = await contract.balanceOf(sender_address);
      assert.equal(amount_to_mint, sender_balance, 'Incorrect balance after minting.');
      // Transfer tokens.
      await contract.transfer(
        recipient_address,
        amount_to_transfer,
        {from: sender_address}
      );
      // Get recipient balance.
      const recipient_balance_final = await contract.balanceOf(recipient_address);
      assert.equal(
        recipient_balance_final.valueOf(),
        amount_to_transfer,
        'Incorrect balance after transfer.'
      );
    });
  });

  describe('MintableToken', function() {

    it('should ensure mintingFinished is false ', async () => {
      const mintingFinished = await contract.mintingFinished()
      assert.isFalse(mintingFinished, 'Minting is finished when it should not be.')
    });

    it('should mint tokens if mintingFinished is false', async() => {
      const address = accounts[2]
      const amount = 200
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
      const address = accounts[2]
      const amount = 200
      // Make sure mintingFinished is true.
      mintingFinished = await contract.mintingFinished()
      if(!mintingFinished){
        await contract.finishMinting()
        mintingFinished = await contract.mintingFinished()
      }
      assert.isTrue(mintingFinished, 'Minting is not finished when it should be.')
      // Mint tokens.
      reverted = false;
      try {
        let transaction = await contract.mint(address, amount);
      } catch(error) {
        reverted = true;
      }
      assert.isTrue(reverted, 'Mint did not revert when mintingFinished was true.');
    });

    it('should mint tokens if address is owner', async function(){
      const amount_to_mint = 414124;
      const minting_address = accounts[8]
      const recipient_address = '0x2d44956c37A35825Aeb973953c34480fb5C553C5';
      // Make sure minting_address is not an owner.
      is_owner = await contract.isOwner(minting_address);
      assert.isFalse(is_owner, 'Address is owner when it should not be.');
      // Add owner.
      await contract.addOwner(minting_address);
      is_owner = await contract.isOwner(minting_address);
      assert.isTrue(is_owner, 'Address is not owner when it should be.');
      // Mint tokens.
      await contract.mint(recipient_address, amount_to_mint, {from: minting_address});
      // Make sure totalSupply is incremented properly.
      total_supply = await contract.totalSupply();
      assert.equal(total_supply.valueOf(), amount_to_mint);
    });

    it('should prevent non-owners from minting tokens', async function(){
      const amount_to_mint = 36000;
      const minting_address = accounts[9];
      const recipient_address = '0xAB71566DD2FdbF701c94005d73991e3715d7d2BF';
      // Make sure mintingFinished is false.
      mintingFinished = await contract.mintingFinished()
      assert.isFalse(mintingFinished, 'Minting is finished when it should not be.');
      // Mint tokens.
      reverted = false;
      try {
        let transaction = await contract.mint(recipient_address, amount, {from: minting_address});
      } catch(error) {
        reverted = true;
      }
      assert.isTrue(reverted, 'Mint did not revert when mintingFinished was true.');
    });
  });

  describe('BurnableToken', function() {

    it('should allow user to burn tokens', async () => {
      const address = accounts[3];
      const amount = 500;
      const amount_to_burn = 120;
      // Make sure mintingFinished is false.
      const mintingFinished = await contract.mintingFinished();
      assert.isFalse(mintingFinished, 'Minting is finished when it should not be.');
      // Mint tokens.
      await contract.mint(address, amount)
      const balance_initial = await contract.balanceOf(address)
      assert.isTrue(balance_initial >= amount, 'Mint did not properly increment balance.')
      // Burn tokens.
      await contract.burn(amount_to_burn, {from: address})
      const balance_final = await contract.balanceOf(address)
      // Use BigNumber subtraction to prevent rounding errors.
      const balance_expected = balance_initial.sub(amount_to_burn);
      assert.equal(balance_final.valueOf(), balance_expected.valueOf(), 'Burn did not properly decrement balance.')
    });

    it('should not allow user to burn more tokens than balance', async () => {
      const address = accounts[3];
      const amount = 400;
      const amount_to_burn = amount + 1;
      // Make sure mintingFinished is false.
      const mintingFinished = await contract.mintingFinished();
      assert.isFalse(mintingFinished, 'Minting is finished when it should not be.');
      // Mint tokens.
      await contract.mint(address, amount)
      const balance = await contract.balanceOf(address)
      assert.isTrue(balance >= amount, 'Mint did not properly increment balance.')
      // Burn tokens.
      reverted = false;
      try {
        let transaction = await contract.burn(amount_to_burn, {from: address})
      } catch(error) {
        reverted = true;
      }
      assert.isTrue(reverted, 'Burn did not revert when amount was larger than balance.');
    });

    it('should decrement total supply when tokens are burnt', async () => {
      const address = accounts[3];
      const amount = 40;
      const amount_to_burn = 6;
      // Make sure mintingFinished is false.
      const mintingFinished = await contract.mintingFinished();
      assert.isFalse(mintingFinished, 'Minting is finished when it should not be.');
      // Mint tokens.
      await contract.mint(address, amount)
      const balance_initial = await contract.balanceOf(address)
      assert.isTrue(balance_initial >= amount, 'Mint did not properly increment balance.')
      // Get initial total supply.
      const totalSupply_initial = await contract.totalSupply()
      // Burn tokens.
      await contract.burn(amount_to_burn, {from: address})
      // Get final total supply.
      const totalSupply_final = await contract.totalSupply()
      const totalSupply_expected = totalSupply_initial.sub(amount_to_burn)
      // Use BigNumber subtraction to prevent rounding errors.
      assert.equal(totalSupply_final.valueOf(), totalSupply_expected.valueOf(), 'Burn did not properly decrement totalSupply.')
    });
  });
});
