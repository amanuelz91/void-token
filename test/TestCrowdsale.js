const CrowdsaleMock = artifacts.require('Crowdsale');
const BigNumber = web3.BigNumber;

// Properties/constructor args.
// Wallet address from accounts[2].
const WALLET = '0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef';
const IS_PURCHASE_ENABLED = true;
const RATE = new BigNumber(web3.toWei(2000000));
const CAP = new BigNumber(web3.toWei(200000000));

contract('Crowdsale', function(accounts) {

  describe('Initial Properties', function() {

    before('deploy new CrowdsaleMock', async () => {
      contract = await CrowdsaleMock.deployed();
    });

    it('should have correct wallet', async function() {
      let wallet = await contract.wallet();
      assert.equal(wallet, WALLET, 'Incorrect wallet.');
    });

    it('should have correct value for purchase enabled', async function() {
      let isPurchaseEnabled = await contract.isPurchaseEnabled();
      assert.equal(isPurchaseEnabled, IS_PURCHASE_ENABLED, 'Incorrect value for purchase enabled.');
    });

    it('should have correct rate', async function() {
      let rate = await contract.rate();
      assert.equal(rate.valueOf(), RATE.valueOf(), 'Incorrect rate.');
    });

    it('should have correct cap', async function() {
      let cap = await contract.cap();
      assert.equal(cap.valueOf(), CAP.valueOf(), 'Incorrect cap.');
    });

    //it('should have token address setup'});

    it('should have weiRaised set to 0', async function() {
      let weiRaised = await contract.weiRaised();
      assert.equal(weiRaised.valueOf(), 0, 'weiRaised is not equal to zero.');
    });

    it('should set token contract');

  });

  describe('Purchase', function() {
    //it('should allow to buy tokens and transfer ether to wallet'});
  });

  describe('Fail cases', function() {
    before('new preICO', async () => {
      // set new contracts
    });

    //it('should have token address setup'});

    //it('should have rate', async () => {
    //     set big enough rate so you can buy out all tokens for this crowdsale
    //     and see how contract will act then
    //});

    //it('should have wallet set'});

    //it('should have hard cap set'});

    //it('should not allow to set token again'});

    //it('should not allow to buy token after sale ended'});

    //it('should not allow to exceed hard cap'});

    //it('should not allow to buy token before start date'});

    //it('should not allow to buy token after end date'});

  });
});
