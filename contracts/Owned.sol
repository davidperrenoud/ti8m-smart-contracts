pragma solidity ^0.4.2;

contract Owned {
	modifier only_owner { if (msg.sender == owner) _; else throw; }

	event NewOwner(address indexed old, address indexed current);

    function setOwner(address _new) only_owner public { NewOwner(owner, _new); owner = _new; }

	address public owner = msg.sender;
}
