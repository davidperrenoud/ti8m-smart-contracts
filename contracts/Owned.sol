pragma solidity ^0.4.2;

contract Owned {
	modifier only_owner { require(msg.sender == owner); _; }

	event NewOwner(address indexed old, address indexed current);

    function setOwner(address _new) only_owner public { NewOwner(owner, _new); owner = _new; }

	address public owner = msg.sender;
}
