//! The dutch-auction contract.
//!
//! Copyright 2017 Gavin Wood, Parity Technologies Ltd.
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

import "./SimpleCertifier.sol";

/// Stripped down ERC20 standard token interface.
contract Token {
	function transfer(address _to, uint256 _value) public returns (bool success);
}

/// Simple Dutch Auction contract. Price starts high and monotonically decreases
/// until all tokens are sold at the current price with currently received
/// funds.
contract DutchAuction {
	/// Someone bought in at a particular max-price.
	event Buyin(address indexed who, uint price, uint spent, uint refund);

	/// The sale just ended with the current price.
	event Ended(uint price);

	/// Finalised the purchase for `who`, who has been given `tokens` tokens and
	/// refunded `refund` (which is the remainder since only a whole number of
	/// tokens may be purchased).
	event Finalised(address indexed who, uint tokens);

	/// Auction is over. All accounts finalised.
	event Retired();

	/// Simple constructor.
	function DutchAuction(address _certifierContract, address _tokenContract, address _treasury, address _admin, uint _beginTime, uint _beginPrice, uint _saleSpeed, uint _tokenCap) public {
		certifier = SimpleCertifier(_certifierContract);
		tokenContract = Token(_tokenContract);
		treasury = _treasury;
		admin = _admin;
		beginTime = _beginTime;
		beginPrice = _beginPrice;
		saleSpeed = _saleSpeed;
		tokenCap = _tokenCap;
		endTime = beginTime + beginPrice / saleSpeed;
	}

	/// Buyin function. Throws if the sale is not active. May refund some of the
	/// funds if they would end the sale.
	function()
        public
		payable
		when_not_halted
		when_active
		avoid_dust
		only_certified
		only_limited_amount_or_highly_certified
	{
		uint price = currentPrice();
		uint tokens = msg.value / price;
		uint refund = 0;
		uint accepted = msg.value;

		// if we've asked for too many, send back the extra.
		if (tokens > tokensAvailable()) {
			refund = (tokens - tokensAvailable()) * price;
			if (!msg.sender.send(refund)) { revert(); }
			tokens = tokensAvailable();
			accepted -= refund;
		}

		// send rest to treasury
		if (!treasury.send(accepted)) { revert(); }

		// record the acceptance.
		participants[msg.sender] += accepted;
		totalReceived += accepted;
		uint targetPrice = totalReceived / tokenCap;
		uint salePriceDrop = beginPrice - targetPrice;
		uint saleDuration = salePriceDrop / saleSpeed;
		endTime = beginTime + saleDuration;
		Buyin(msg.sender, price, accepted, refund);
	}

	/// Mint tokens for a particular participant.
	function finalise(address _who)
        public
		when_not_halted
		when_ended
		only_participants(_who)
	{
		// end the auction if we're the first one to finalise.
		if (endPrice == 0) {
			endPrice = totalReceived / tokenCap;
			Ended(endPrice);
		}

		// enact the purchase.
		uint tokens = participants[_who] / endPrice;
//		uint refund = participants[_who] - endPrice * tokens;
		totalFinalised += participants[_who];
		participants[_who] = 0;
		if (!tokenContract.transfer(_who, tokens)) { revert(); }

		Finalised(_who, tokens);

		if (totalFinalised == totalReceived) {
			Retired();
		}
	}

	/// Emergency function to pause buy-in and finalisation.
	function setHalted(bool _halted) public only_admin { halted = _halted; }

	/// Emergency function to drain the contract of any funds.
	function drain() public only_admin { if (!treasury.send(this.balance)) { revert(); } }

	/// Kill this contract once the sale is finished.
	function kill() public when_all_finalised { selfdestruct(admin); }

	/// The current price for a single token. If a buyin happens now, this is
	/// the highest price per token that the buyer will pay.
	function currentPrice() public constant returns (uint weiPerToken) {
		if (!isActive()) return 0;
		return beginPrice - (now - beginTime) * saleSpeed;
	}

	/// Returns the tokens available for purchase right now.
	function tokensAvailable() public constant returns (uint tokens) {
		if (!isActive()) return 0;
		return tokenCap - totalReceived / currentPrice();
	}

	/// The largest purchase than can be made at present.
	function maxPurchase() public constant returns (uint spend) {
		if (!isActive()) return 0;
		return tokenCap * currentPrice() - totalReceived;
	}

	/// True if the sale is ongoing.
	function isActive() public constant returns (bool) { return now >= beginTime && now < endTime; }

	/// True if all participants have finalised.
	function allFinalised() public constant returns (bool) { return now >= endTime && totalReceived == totalFinalised; }

	/// Ensure the sale is ongoing.
	modifier when_active { require(isActive()); _; }

	/// Ensure the sale is ended.
	modifier when_ended { require(now >= endTime); _; }

	/// Ensure we're not halted.
	modifier when_not_halted { require(!halted); _; }

	/// Ensure all participants have finalised.
	modifier when_all_finalised { require(allFinalised()); _; }

	/// Ensure the sender sent a sensible amount of ether.
	modifier avoid_dust { require(msg.value >= DUST_LIMIT); _; }

	/// Ensure `_who` is a participant.
	modifier only_participants(address _who) { require(participants[_who] != 0); _; }

	/// Ensure sender is admin.
	modifier only_admin { require(msg.sender == admin); _; }

	/// Ensure sender is certified.
	modifier only_certified { require(certifier.getCertifiedLevel(msg.sender) != Certifier.Level.Revoked); _; }

	/// Ensure sender is certified for that amount.
	modifier only_limited_amount_or_highly_certified {
		if (msg.value < HIGHLY_CERTIFIED_LIMIT) {
			_;
		} else if (certifier.getCertifiedLevel(msg.sender) == Certifier.Level.Level_2) {
			_;
		} else if (certifier.getCertifiedLevel(msg.sender) == Certifier.Level.Level_3) {
			_;
		} else {
			revert();
		}
	}

	// State:

	/// The auction participants.
	mapping (address => uint) public participants;

	/// Total amount of ether received.
	uint public totalReceived = 0;

	/// Total amount of ether which has been finalised.
	uint public totalFinalised = 0;

	/// The current end time. Gets updated when new funds are received.
	uint public endTime;

	/// The price per token; only valid once the sale has ended and at least one
	/// participant has finalised.
	uint public endPrice;

	/// Must be false for any public function to be called.
	bool public halted;

	// Constants after constructor:

	/// The certifier.
	SimpleCertifier public certifier;

	/// The tokens contract.
	Token public tokenContract;

	/// The treasury address; where all the Ether goes.
	address public treasury;

	/// The admin address; auction can be paused or halted at any time by this.
	address public admin;

	/// The time at which the sale begins.
	uint public beginTime;

	/// Price at which the sale begins.
	uint public beginPrice;

	/// The speed at which the price reduces, in Wei per second.
	uint public saleSpeed;

	/// Maximum amount of tokens to mint. Once totalSale / currentPrice is
	/// greater than this, the sale ends.
	uint public tokenCap;

	// Static constants:

	/// Anything less than this is considered dust and cannot be used to buy in.
	uint constant public DUST_LIMIT = 10 finney;

	// Constant values for the different levels of certification
	uint constant public HIGHLY_CERTIFIED_LIMIT = 1 ether;

}
