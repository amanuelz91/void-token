const TokenMock = artifacts.require('Token');
const CrowdsaleMock = artifacts.require('Crowdsale');
const BigNumber = web3.BigNumber;


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

    it('should increment wallet balance with ether when tokens are purchased');
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
