// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/ISTLHarvestPool.sol";
import "./STL.sol";

contract STLHarvestPool is ISTLHarvestPool, Ownable, Pausable {
    STL public immutable stlToken;

    uint256 public totalDeposits;
    uint256 public lastDeposit;

    mapping(address account => Investor infoInvestor) public investors;
    mapping(uint256 createAt => uint256 amount) public rewards;
    mapping(uint256 createAt => uint256 amount) public totalDepositTracking;

    uint256 public totalRewards;
    uint256 public lastReward;

    constructor(STL _stlToken) Ownable(_msgSender()) {
        stlToken = _stlToken;
    }

    function addRewards(uint256 amount) external onlyOwner {
        stlToken.transferFrom(_msgSender(), address(this), amount);

        lastReward = block.timestamp;
        totalRewards += amount;
        rewards[lastReward] = amount;
        totalDepositTracking[lastReward] = totalDeposits;

        emit RewardAdded(_msgSender(), amount);
    }

    function deposit(uint256 amount) external {
        Investor storage newInvestor = investors[_msgSender()];
        newInvestor.amount += amount;
        newInvestor.lastDeposit = block.timestamp;

        stlToken.transferFrom(_msgSender(), address(this), amount);

        totalDeposits += amount;

        emit Deposited(_msgSender(), address(this), amount);
    }

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
