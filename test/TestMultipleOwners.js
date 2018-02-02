const MultipleOwnersMock = artifacts.require('MultipleOwners');


contract('MultipleOwners', function(accounts) {
  describe('Initial Properties', function() {

    beforeEach('deploy new MultipleOwnersMock', async () => {
      contract = await MultipleOwnersMock.new();
    });

    it('should allow adding owner after owner has been removed', async function(){
      const new_owner = accounts[7];
      is_owner_initial = await contract.isOwner(new_owner);
      assert.isFalse(is_owner_initial, 'Address is owner before being added.');
      // Add owner initially.
      await contract.addOwner(new_owner);
      is_owner_added = await contract.isOwner(new_owner);
      assert.isTrue(is_owner_added, 'Address is not owner after being added.');
      // Delete added owner.
      await contract.removeOwner(new_owner);
      is_owner_removed = await contract.isOwner(new_owner);
      assert.isFalse(is_owner_removed, 'Address is owner after being removed.');
      // Add deleted owner.
      await contract.addOwner(new_owner);
      is_owner_readded = await contract.isOwner(new_owner);
      assert.isTrue(is_owner_readded, 'Address is not owner after being added.');
    });

    it('should allow removing owner after owner has been added', async function(){
      const new_owner = '0x9316ccecE3B1717DBF2bA8a752C9f2451A3d9002';
      is_owner_initial = await contract.isOwner(new_owner);
      assert.isFalse(is_owner_initial, 'Address is owner before being added.');
      // Add owner initially.
      await contract.addOwner(new_owner);
      is_owner_added = await contract.isOwner(new_owner);
      assert.isTrue(is_owner_added, 'Address is not owner after being added.');
      //Delete added owner.
      await contract.removeOwner(new_owner);
      is_owner_removed = await contract.isOwner(new_owner);
      assert.isFalse(is_owner_removed, 'Address is owner after being removed.');
    });

    // Most of these tests just use the initial owner.
    // This should add an owner, and have that owner add an owner.
    it('should allow adding owner as a newly created owner', async function(){
      const new_owner = accounts[2];
      const next_owner = accounts[3];
      is_owner_initial = await contract.isOwner(new_owner);
      assert.isFalse(is_owner_initial, 'Address is owner when it should not be.')
      await contract.addOwner(new_owner);
      is_owner_final = await contract.isOwner(new_owner, {from: accounts[0]});
      assert.isTrue(is_owner_final, 'Address is not owner when it should be.');
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

    it('should prevent a removed owner from adding an owner', async function(){
      const first_owner = accounts[9];
      const second_owner = '0x4705400446ed7E44CB0B14e5B248500b4270Ac6C';
      is_owner_initial = await contract.isOwner(first_owner);
      assert.isFalse(is_owner_initial, 'Address is owner when it should not be.')
      // Add owner.
      await contract.addOwner(first_owner);
      is_owner_final = await contract.isOwner(first_owner);
      assert.isTrue(is_owner_final, 'Address is not owner when it should be.');
      // Remove owner.
      await contract.removeOwner(first_owner);
      const is_owner_still = await contract.isOwner(first_owner);
      assert.isFalse(is_owner_still, 'Owner was not removed after being added.')
      // Attempt to add owner as the removed owner.
      reverted = false;
      try {
        let transaction = await contract.addOwner(second_owner, {from: first_owner});
      } catch(error) {
        reverted = true;
      }
    });

    it('should allow adding multiple owners sequentially', async function(){
      const addresses = [
        '0x4d992E9D17C928Fe1c62e6FaDaEF480F3B698171',
        '0x6f2EA512D35d4233555B6010935d4a1BC474f482',
        '0x18655D58263EF5BFdebC93e1bC34E168fa73b9a1',
        '0xC0C238537955a3059396c1cE0065fD6D01F9C2Be'
      ];

      for(let i = 0; i < addresses.length; i++){
        const new_owner = addresses[i];
        const is_owner_initial = await contract.isOwner(new_owner, {from: accounts[0]});
        assert.isFalse(is_owner_initial, 'Address is owner when it should not be.');
        // Add owner.
        await contract.addOwner(new_owner);
        const is_owner_final = await contract.isOwner(new_owner)
        assert.isTrue(is_owner_final, 'Address is not owner when it should be.');
      }
    });

    it('should allow removing multiple owners sequentially', async function(){
      const addresses = [
        '0xBA139300e76E232C154d031aBC4b7fDe0851A0B7',
        '0xECbAE0c2203521b42621c8C2d852E47fFFf30471',
        '0x415DCAF93b8C6DFD9D690EfD4c3c8B2c6f47D571',
      ];

      for(let i = 0; i < addresses.length; i++){
        address = addresses[i];
        is_owner_initial = await contract.isOwner(address);
        assert.isFalse(is_owner_initial, 'Address is owner when it should not be.');
        // Add owner.
        await contract.addOwner(address);
        is_owner_final = await contract.isOwner(address)
        assert.isTrue(is_owner_final, 'Address is not owner when it should be.');
      }
      // Remove owners.
      // This should be done in its own for loop.
      // The idea is to test multiple removeOwner() calls, one after another.
      for(let i = addresses.length - 1; i >= 0; i--){
        address = addresses[i];
        await contract.removeOwner(address);
      }
      // Final loop. Make sure none of the addresses are owners
      for(let i = 0; i < addresses.length; i++){
        address = addresses[i];
        is_owner = await contract.isOwner(address);
        assert.isFalse(is_owner, 'Owner was not removed after being added.')
      }
    });
  });
});
