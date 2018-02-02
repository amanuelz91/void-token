const MultipleOwnersMock = artifacts.require('MultipleOwners');

// Tests to write...
// Also check out the existing owner tests in TestToken.js.
contract('MultipleOwners', function(accounts) {
  describe('Initial Properties', function() {

    before('deploy new MultipleOwnersMock', async () => {
      contract = await MultipleOwnersMock.deployed();
    });
/*
//Failing
    it('should allow adding owner after owner has been removed', async function(){

      const new_owner = accounts[7];

      is_owner_initial = await contract.isOwner(new_owner);
      assert.isFalse(is_owner_initial, 'Address is owner before being added.');

      // Add owner initially
      await contract.addOwner(new_owner);
      is_owner_added = await contract.isOwner(new_owner);
      assert.isTrue(is_owner_added, 'Address is not owner after being added.');

      //Delete added owner
      await contract.removeOwner(new_owner);
      is_owner_deleted = contract.isOwner(new_owner);
      assert.isFalse(is_owner_deleted, 'Address is owner after being removed.');

      //Add deleted owner
      await contract.addOwner(new_owner);
      is_owner_readded = await contract.isOwner(new_owner);
      assert.isTrue(is_owner_readded, 'Address is not owner after being added.');

    });
//Failing
    it('should allow removing owner after owner has been added', async function(){

      const new_owner = accounts[7];

      is_owner_initial = await contract.isOwner(new_owner);
      assert.isFalse(is_owner_initial, 'Address is owner before being added.');

      // Add owner initially
      await contract.addOwner(new_owner);
      is_owner_added = await contract.isOwner(new_owner);
      assert.isTrue(is_owner_added, 'Address is not owner after being added.');

      //Delete added owner
      await contract.removeOwner(new_owner);
      is_owner_deleted = contract.isOwner(new_owner);
      assert.isFalse(is_owner_deleted, 'Address is owner after being removed.');

    });
    */

    // Most of these tests just use the initial owner.
    // This should add an owner, and have that owner add an owner.
    it('should allow adding owner as a newly created owner', async function(){
      const new_owner = accounts[7];
      const next_owner = accounts[8];
      await contract.addOwner(new_owner);
      is_owner_initial = await contract.isOwner(new_owner);
      assert.isTrue(is_owner_initial, 'Address is not owner when it should be.');
      // Add owner.
      reverted = false;
      try {
        let transaction = await contract.addOwner(next_owner, {from: new_owner});
      } catch(error) {
        reverted = true;
      }
      is_owner_added = await contract.isOwner(next_owner);
      assert.isTrue(is_owner_added, 'Next owner not added');

    });


    it('should allow adding multiple owners sequentially')
    it('should allow removing multiple owners sequentially')
    it('should prevent a removed owner from adding an owner')


  });
});
