// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.24;

interface ISTLHarvestPool {
    event RewardAdded(address indexed from, uint256 value);
    event Deposited(address indexed from, address indexed to, uint256 value);
    event Withdrawn(address indexed from, address indexed to, uint256 value);

    struct Investor {
        uint256 amount;
        uint256 lastDeposit;
    }

    error InsufficientBalance(address from, uint256 balance);

    function deposit(uint256 amount) external;

    function addRewards(uint256 amount) external;

    function withdraw() external;

    function getUserRewards() external returns (uint256 amount);
}
