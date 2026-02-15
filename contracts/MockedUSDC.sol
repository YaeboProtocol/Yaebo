// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockedUSDC
 * @dev Mock USDC token for testing on Mantle Sepolia testnet
 * This is a simple ERC20 token that can be minted by anyone for testing purposes
 */
contract MockedUSDC is ERC20, Ownable {
    uint8 private constant _decimals = 6; // USDC uses 6 decimals
    
    /**
     * @dev Constructor that mints initial supply to the deployer
     * @param initialSupply Initial amount of tokens to mint (in token units, not wei)
     */
    constructor(uint256 initialSupply) ERC20("Mantle USDC", "mUSDC") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }
    
    /**
     * @dev Returns the number of decimals used by the token
     */
    function decimals() public pure override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @dev Mint tokens to any address (for testing purposes)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint (in token units, not wei)
     */
    function mint(address to, uint256 amount) public {
        _mint(to, amount * 10 ** decimals());
    }
    
    /**
     * @dev Mint tokens to msg.sender (for testing purposes)
     * @param amount Amount of tokens to mint (in token units, not wei)
     */
    function mintToSelf(uint256 amount) public {
        _mint(msg.sender, amount * 10 ** decimals());
    }
}

