pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract MultipleOwners is Ownable {
    struct Owner {
        bool isOwner;
        uint256 index;
    }
    mapping(address => Owner) public owners;
    address[] public ownersLUT;

    modifier onlyOwner() {
        require(msg.sender == owner || owners[msg.sender].isOwner);
        _;
    }

    event AddedOwner(address owner);
    event RemovedOwner(address owner);

    /*
    * @dev Check if a given address is an owner.
    * @param _address the address to
    */
    function isOwner(address _address) public view returns (bool) {
      return owners[_address].isOwner;
    }

    function addOwner(address _newOwner) public onlyOwner {
        require(!owners[_newOwner].isOwner);
        owners[_newOwner] = Owner(true, ownersLUT.length);
        ownersLUT.push(_newOwner);
        AddedOwner(_newOwner);
    }

    function removeOwner(address _owner) public onlyOwner {
        uint256 index = owners[_owner].index;
        // order does not matter so move last element to the deleted index
        ownersLUT[index] = ownersLUT[ownersLUT.length - 1];
        // remove last element
        ownersLUT.length--;
        // remove Owner from mapping
        delete owners[_owner];
        RemovedOwner(_owner);
    }
}
