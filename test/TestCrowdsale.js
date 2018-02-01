const TokenMock = artifacts.require('Token');
const CrowdsaleMock = artifacts.require('Crowdsale');
const BigNumber = web3.BigNumber;
const Crypto = require("crypto");

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

contract('Crowdsale', function(accounts) {

  // Token properties/constructor args.
  const NAME = 'VoidToken';
  const SYMBOL = 'VOID';
  const DECIMALS = 18;
  const INITIAL_SUPPLY = 0;

  // Crowdsale properties/constructor args.
  const WALLET = accounts[2];
  const RATE = new BigNumber(web3.toWei(2000000));
  const CAP = new BigNumber(web3.toWei(200000000));

  describe('Initial Properties', function() {

    before('deploy new CrowdsaleMock', async () => {
      contract = await CrowdsaleMock.deployed();
    });

    it('should have correct wallet', async function() {
      let wallet = await contract.wallet();
      assert.equal(wallet, WALLET, 'Incorrect wallet.');
    });

    it('should be unpaused', async function() {
      let paused = await contract.paused();
      assert.isFalse(paused, 'Contract is paused when it should not be.');
    });

    it('should have correct rate', async function() {
      let rate = await contract.rate();
      assert.equal(rate.valueOf(), RATE.valueOf(), 'Incorrect rate.');
    });

    it('should have correct cap', async function() {
      let cap = await contract.cap();
      assert.equal(cap.valueOf(), CAP.valueOf(), 'Incorrect cap.');
    });

    it('should have weiRaised set to 0', async function() {
      let weiRaised = await contract.weiRaised();
      assert.equal(weiRaised.valueOf(), 0, 'weiRaised is not equal to zero.');
    });
  });

  describe('Set Token', function(){
    beforeEach('Deploy contract and assign token contract', async function(){
      // Deploy crowdsale contract.
      contract = await CrowdsaleMock.new(WALLET, RATE, CAP, {gas: 3000000});
    });

    it('should set token contract', async function() {
      // Deploy token contract.
      token = await TokenMock.new(NAME, SYMBOL, DECIMALS, INITIAL_SUPPLY, {gas: 3000000});
      // Assign token contract to crowdsale.
      await contract.assignTokenContract(token.address);
      // Add crowdsale contract address to token contract.
      await token.addOwner(contract.address);
      // Get crowdsale token address.
      const expected_address = await token.address;
      const actual_address = await contract.token();
      assert.equal(expected_address, actual_address, 'Crowdsale token address does not match token instance.' );
    });
  });

  describe('Purchase', function() {
    beforeEach('deploy new CrowdsaleMock', async () => {
      // Deploy crowdsale contract.
      contract = await CrowdsaleMock.new(WALLET, RATE, CAP, {gas: 3000000});
      // Deploy token contract.
      token = await TokenMock.new(NAME, SYMBOL, DECIMALS, INITIAL_SUPPLY, {gas: 3000000});
      // Assign token contract to crowdsale.
      await contract.assignTokenContract(token.address);
      // Add crowdsale contract address to token contract.
      await token.addOwner(contract.address);
    });

    it('should allow to buy tokens and transfer ether to wallet', async function(){
      const amount_ether = 0.26;
      const token_buyer = accounts[3];
      const token_recipient = '0x5BeCC805470Ff7afE502821f4fbAfF7ffFd41239';
      const value = new BigNumber(web3.toWei(amount_ether, 'ether'));
      const rate = await contract.rate();
      const expected_number_of_tokens = value.mul(rate);
      // Get initial balance from token contract.
      const balance_recipient_initial = await token.balanceOf(token_recipient);
      assert.equal(
        balance_recipient_initial.valueOf(),
        0,
        'Initial token balance of recipient is non-zero.'
      );
      // Purchase tokens.
      await contract.buyTokens(token_recipient, {from: token_buyer, value: value});
      // Get updated balance from token contract.
      const balance_recipient_final = await token.balanceOf(token_recipient);
      assert.equal(
        balance_recipient_final.valueOf(),
        expected_number_of_tokens.valueOf(),
        'Incorrect number of tokens after purchasing tokens.'
      );
    });
  });

  describe('Wallet', function() {
    beforeEach('deploy new CrowdsaleMock', async () => {

      // Generate a fake address to ensure intial wallet balance is always zero.
      // web3.js 1.0 includes an accounts.create() method to use instead.
      let empty_wallet = '0x' + Crypto.randomBytes(20).toString('hex');

      // Deploy crowdsale contract.
      contract = await CrowdsaleMock.new(empty_wallet, RATE, CAP, {gas: 3000000});
      // Deploy token contract.
      token = await TokenMock.new(NAME, SYMBOL, DECIMALS, INITIAL_SUPPLY, {gas: 3000000});
      // Assign token contract to crowdsale.
      await contract.assignTokenContract(token.address);
      // Add crowdsale contract address to token contract.
      await token.addOwner(contract.address);
    });

    it('should increment wallet ether balance when tokens are purchased.', async function(){
      const amount_ether = 2.3642;
      const token_buyer = accounts[3];
      const token_recipient = accounts[7];
      const value = new BigNumber(web3.toWei(amount_ether, 'ether'));
      const wallet = await contract.wallet();
      // Make sure initial wallet balance is zero.
      const wallet_balance_initial = web3.eth.getBalance(wallet);
      assert.equal(wallet_balance_initial.valueOf(), 0, 'Initial wallet balance is not zero.');
      // Purchase tokens.
      await contract.buyTokens(token_recipient, {from: token_buyer, value: value});
      // Get wallet balance.
      const wallet_balance_final = await web3.eth.getBalance(wallet);
      assert.equal(
        value.valueOf(),
        wallet_balance_final.valueOf(),
        'Incorrect wallet balance after purchasing tokens.'
      );
    });

    it('should increment wallet ether balance for multiple purchases.', async function(){
      const number_of_purchases = 7;
      const max_amount_ether = 4;
      const token_recipient = '0x5304a4158b232CE32AaA228Ed4355A18C4251E82';
      let wallet_balance_expected = new BigNumber(0);

      for(let i = 0; i < number_of_purchases; i++){
         // Get random amount of ether.
        const random_amount_ether = getRandomArbitrary(0, max_amount_ether);
        const value = new BigNumber(web3.toWei(random_amount_ether));
        // Get random account from accounts[].
        const token_buyer = accounts[Math.floor(Math.random()*accounts.length)];
        // Purchase tokens.
        await contract.buyTokens(token_recipient, {from: token_buyer, value: value});
        // Add value to wallet_balance_expected.
        wallet_balance_expected = wallet_balance_expected.add(value);
      }

      // Get wallet balance.
      const wallet = await contract.wallet();
      const wallet_balance_actual = await web3.eth.getBalance(wallet);

      assert.equal(
        wallet_balance_actual.valueOf(),
        wallet_balance_expected.valueOf(),
        'Incorrect wallet ether balance after multiple token purchases.'
      );
    });
  });

  describe('Hardcap', function() {
    beforeEach('Deploy contract with small hardcap', async function(){
      // Set small cap.
      const small_cap = web3.toWei(20, 'ether');
      // Deploy crowdsale contract.
      contract = await CrowdsaleMock.new(WALLET, RATE, small_cap, {gas: 3000000});
      // Deploy token contract.
      token = await TokenMock.new(NAME, SYMBOL, DECIMALS, INITIAL_SUPPLY, {gas: 3000000});
      // Assign token contract to crowdsale.
      await contract.assignTokenContract(token.address);
      // Add crowdsale contract address to token contract.
      await token.addOwner(contract.address);
    });

    it('should be allowed to buy all of the tokens', async function(){
      const cap = await contract.cap();
      const rate = await contract.rate();
      const token_buyer = accounts[8];
      const token_recipient = accounts[4];
      // Get initial recipient balance.
      const balance_recipient_initial = await token.balanceOf(token_recipient);
      // Make sure recipient balance is 0.
      assert.equal(
        balance_recipient_initial.valueOf(),
        0,
        'Initial token balance of recipient is non-zero.'
      );
      // Buy as many tokens as possible within the hardcap.
      await contract.buyTokens(token_recipient, {from: token_buyer, value: cap.valueOf()});
      const balance_recipient_final = await token.balanceOf(token_recipient);
      // Calculate number of tokens from rate.
      number_of_tokens = cap.mul(rate);
      // Make sure the number of tokens matches the recipient's balance.
      assert.equal(
        balance_recipient_final.valueOf(),
        number_of_tokens.valueOf(),
        'Recipient token balance does not equal the hardcap.'
      );
      // Get totalSupply from token contract.
      const total_supply = await token.totalSupply();
      // Make sure that the token totalSupply was incremented correctly.
      assert.equal(
        total_supply.valueOf(),
        number_of_tokens.valueOf(),
        'Total supply was not incremented correctly after buying tokens.'
      );
    });

    it('should ensure hasEnded() is true after hardcap is reached.', async function(){
      const cap = await contract.cap();
      const rate = await contract.rate();
      const token_buyer = accounts[6];
      const token_recipient = accounts[3];
      // Buy as many tokens as possible within the hardcap.
      await contract.buyTokens(token_recipient, {from: token_buyer, value: cap.valueOf()});
      has_ended = await contract.hasEnded();
      assert.isTrue(has_ended, 'hasEnded() is false after the hardcap is reached.');
    });

    it('should ensure hasEnded() is false when hardcap has not been reached.', async function(){
      const cap = await contract.cap();
      const value = cap.sub(1); // Subtract one wei.
      const rate = await contract.rate();
      const token_buyer = accounts[6];
      const token_recipient = accounts[3];
      // Buy as many tokens as possible within the hardcap.
      await contract.buyTokens(token_recipient, {from: token_buyer, value: value.valueOf()});
      has_ended = await contract.hasEnded();
      assert.isFalse(has_ended, 'hasEnded() is true before the hardcap is reached.');
    });

    it('should not allow to exceed hard cap', async function(){
      const cap = await contract.cap();
      const value = cap.add(1); // Add one wei.
      const token_buyer = accounts[8];
      const token_recipient = accounts[4];

      reverted = false;
      try {
        let transaction = await contract.buyTokens(
          token_recipient, {from: token_buyer, value: value.valueOf()}
        );
      } catch(error) {
        reverted = true;
      }
      assert.isTrue(reverted, 'Transaction did not revert when buying more tokens than hardcap.');
    });
  });

  describe('Fail cases', function() {
    //before('new preICO', async () => {
    //  // set new contracts
    //});

    //it('should have token address setup');

    //it('should have rate', async () => {
    //     // set big enough rate so you can buy out all tokens for this crowdsale
    //     // and see how contract will act then
    //});

    //it('should not allow to set token again');

    //it('should not allow to buy token after sale ended');

    //it('should not allow to buy token before start date');

    //it('should not allow to buy token after end date');

  });
});
