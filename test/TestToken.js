const TokenMock = artifacts.require('Token');
const BigNumber = web3.BigNumber;

/*
* @dev Test initial constants/constructor.
* @dev Tests that all initial properties are set correctly.
* @dev These might not be too useful, but they do provide a sanity check.
* @dev If tests are failing, it's likely that the initial properties changed.
*/
contract('TokenMock', function(accounts) {

  /*
  * @dev Tests for isTransferEnabled().
  * @dev Try to avoid writing tests for zepplin contracts/dependencies
  * @dev unless the function has been modified, such as with transfer().
  */
  describe('isTransferEnabled', function() {
    let contract;

    before('deploy new TokenMock', async () => {
        contract = await TokenMock.deployed();
    });

    it('should toggle ability to transfer tokens', async function(){
      let canTransferInitial = contract.isTransferEnabled();
      await contract.toggleTransfers();
      let canTransferFinal = contract.isTransferEnabled();
      assert.notEqual(
        canTransferInitial,
        canTransferFinal,
        'isTransferEnabled was not toggled properly.'
      );
    });

    it('should prevent token transfers when transfers are disabled', async function(){
      let recipient = '0x950E573130697bb013D4ecA2d01a718a0286B322';
      let numberOfTokens = 1613;
      let reverted;
      let canTransfer = await contract.isTransferEnabled();
      if(canTransfer){
        await contract.toggleTransfers();
      }

      try {
        let transaction = await contract.transfer(
          recipient, numberOfTokens, {from: accounts[0], gas: 250000}
        );
      } catch(error) {
        reverted = true;
      }
      assert.isTrue(reverted, 'Transfer did not revert when transfers are disabled.');
    });
  });
});
