//! The SimpleCertifier contract, taken from paritytech/sms-verification.
//!
//! Copyright 2016 Gavin Wood, Parity Technologies Ltd.
//! Copyright 2018 David Perrenoud, ti&m AG
//!
//! Licensed under the Apache License, Version 2.0 (the "License");
//! you may not use this file except in compliance with the License.
//! You may obtain a copy of the License at
//!
//!     http://www.apache.org/licenses/LICENSE-2.0
//!
//! Unless required by applicable law or agreed to in writing, software
//! distributed under the License is distributed on an "AS IS" BASIS,
//! WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//! See the License for the specific language governing permissions and
//! limitations under the License.

pragma solidity ^0.4.7;

import "./Owned.sol";
import "./Certifier.sol";

contract SimpleCertifier is Owned, Certifier {
	modifier onlyDelegate {
		if (msg.sender != delegate)
			return;
		_;
	}

	modifier onlyCertified(address _who) {
		if (certs[_who].level == Level.Revoked)
			return;
		_;
	}

	struct Certification {
		Level level;
		address receiveWallet;
	}

	function certify(address _who, uint level, address receiveWallet) public onlyDelegate {
		certs[_who].level = Level(level);
		certs[_who].receiveWallet = receiveWallet;
		Confirmed(_who, level, receiveWallet);
	}

	function revoke(address _who) public onlyDelegate onlyCertified(_who) {
		certs[_who].level = Level.Revoked;
		Revoked(_who);
	}

	function getCertifiedLevel(address _who) public constant returns (Level) {
		return certs[_who].level;
	}

	function getCertifiedReceiveWallet(address _who) public constant returns (address) {
		return certs[_who].receiveWallet;
	}

	function setDelegate(address _new) public only_owner { delegate = _new; }

	mapping (address => Certification) certs;

	// So that the server posting puzzles doesn't have access to the ETH.
	address public delegate = msg.sender;
}
