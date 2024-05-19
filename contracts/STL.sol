// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract STL is ERC20, Ownable {
    uint256 constant AIR_DROP_AMOUNT = 500e18;
    uint256 constant MAX_AIR_DROP_AMOUT_PER_WALLET = 1000e18;
    bool airDropPaused = false;

    event Claimed(address indexed to, address indexed from, uint256 value);

    error MaxAmountExceed();
    error AirDropPaused();

    constructor() ERC20("STL Coin", "STL") Ownable(_msgSender()) {
        _mint(_msgSender(), 1000000 * 1e18);
        _mint(address(this), 500000 * 1e18);
    }

    function claimToken(address receipt) external {
        airDropValidate(receipt);
        _transfer(address(this), receipt, AIR_DROP_AMOUNT);
        emit Claimed(address(this), receipt, AIR_DROP_AMOUNT);
    }

    function finishAirDrop() external onlyOwner {
        _transfer(address(this), owner(), balanceOf(address(this)));
        airDropPaused = true;
    }

    function burn(address account, uint256 value) external {
        _burn(account, value);
    }

    function airDropValidate(address receipt) internal view {
        if (balanceOf(receipt) >= MAX_AIR_DROP_AMOUT_PER_WALLET) {
            revert MaxAmountExceed();
        }
        if (airDropPaused == true || balanceOf(address(this)) == 0) {
            revert AirDropPaused();
        }
    }
}
