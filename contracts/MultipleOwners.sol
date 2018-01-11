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

    function addOwner(address newOwner) public onlyOwner {
        require(!owners[msg.sender].isOwner);
        owners[newOwner] = Owner(true, ownersLUT.length);
        ownersLUT.push(newOwner);
    }

    function removeOwner(address _owner) public onlyOwner {
        uint256 index = owners[_owner].index;
        // order does not matter so move last element to the deleted index
        ownersLUT[index] = ownersLUT[ownersLUT.length - 1];
        // remove last element
        ownersLUT.length--;
        // remove Owner from mapping
        delete owners[_owner];
    }
}
