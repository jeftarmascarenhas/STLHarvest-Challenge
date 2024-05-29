// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/ISTLHarvestPool.sol";
import "./STL.sol";

/**
 * @title STLHarvestPool
 * @author Jeftar Mascarenhas
 */
contract STLHarvestPool is ISTLHarvestPool, Ownable, Pausable {
    /**
     * stlToken store STL token address
     */
    STL public immutable stlToken;
    /**
     * totalDeposits store users deposit amount
     */
    uint256 public totalDeposits;
    /**
     * Mapping investors is using to account investor information
     */
    mapping(address account => Investor infoInvestor) public investors;
    /**
     * Mapping rewards is using to tracking reward date and amount
     */
    mapping(uint256 createAt => uint256 amount) public rewards;
    /**
     * Mapping totalDepositTracking is using to tracking deposit date and amount
     */
    mapping(uint256 createAt => uint256 amount) public totalDepositTracking;
    /**
     * totalRewards Total of reward
     */
    uint256 public totalRewards;
    /**
     * lastReward is timestamp to store last reward amount added
     * And help calc on function getUserRewards
     */
    uint256 public lastReward;

    /**
     * Constructor
     * @param _stlToken STL is token using to deposit and reward
     */
    constructor(STL _stlToken) Ownable(_msgSender()) {
        stlToken = _stlToken;
    }

    /**
     * Function addRewards called only owner
     * @param amount STL amount
     */
    function addRewards(uint256 amount) external onlyOwner {
        stlToken.transferFrom(_msgSender(), address(this), amount);

        lastReward = block.timestamp;
        totalRewards += amount;
        rewards[lastReward] = amount;
        totalDepositTracking[lastReward] = totalDeposits;

        emit RewardAdded(_msgSender(), amount);
    }

    /**
     * Function deposit to any user transfer STL token
     * @param amount STL amount
     */
    function deposit(uint256 amount) external {
        Investor storage newInvestor = investors[_msgSender()];
        newInvestor.amount += amount;
        newInvestor.lastDeposit = block.timestamp;

        stlToken.transferFrom(_msgSender(), address(this), amount);

        totalDeposits += amount;

        emit Deposited(_msgSender(), address(this), amount);
    }

    /**
     * Function withdraw to user get funds and rewards
     */
    function withdraw() external {
        if (investors[_msgSender()].amount == 0) {
            revert InsufficientBalance(
                _msgSender(),
                investors[_msgSender()].amount
            );
        }
        uint256 rewardAmount = getUserRewards();
        uint256 amount = rewardAmount + investors[_msgSender()].amount;

        stlToken.transfer(_msgSender(), amount);

        totalDeposits -= investors[_msgSender()].amount;
        totalRewards -= rewardAmount;

        emit Withdrawn(address(this), _msgSender(), amount);
    }

    /**
     * Function getUserRewards use to calc reward amount
     */
    function getUserRewards() public view returns (uint256 amount) {
        if (investors[_msgSender()].amount == 0) {
            return amount;
        }

        if (lastReward > investors[_msgSender()].lastDeposit) {
            uint256 BASE_POINTS = 10000;
            uint256 percent = (((investors[_msgSender()].amount) * 100) /
                totalDepositTracking[lastReward]) * 100;

            amount = ((percent * totalRewards) / BASE_POINTS);
            return amount;
        }
    }
}
