const MultipleOwnersMock = artifacts.require('MultipleOwners');

// Tests to write...
// Also check out the existing owner tests in TestToken.js.
contract('MultipleOwners', function(accounts) {
  describe('Initial Properties', function() {

    it('should allow adding owner after owner has been removed')
    it('should allow removing owner after owner has been added')

    // Most of these tests just use the initial owner.
    // This should add an owner, and have that owner add an owner.
    it('should allow adding owner as a newly created owner')

    it('should allow adding multiple owners sequentially')
    it('should allow removing multiple owners sequentially')
    it('should prevent a removed owner from adding an owner')
  }
}
