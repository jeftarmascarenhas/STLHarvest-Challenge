import { expect } from "chai";
import { STLHarvestPoolFixture } from "../fextures/STLHarvestPoolFixture";
import { ethers } from "hardhat";

describe("STLHarvestPool", () => {
  describe("Deployment", () => {
    it("should store stlToken address correct", async () => {
      const { stlHarvestPool, stlToken } = await STLHarvestPoolFixture();
      const stlTokenAddress = await stlHarvestPool.stlToken();
      expect(stlTokenAddress).to.equal(stlToken.target as string);
    });
    it("should HRTeam address is owner", async () => {
      const { stlHarvestPool, HRTeam } = await STLHarvestPoolFixture();
      const owner = await stlHarvestPool.owner();
      expect(owner).to.equal(HRTeam.address);
    });
  });
  describe("Add Rewards", () => {
    it("should only HRTeam add rewards", async () => {
      const { stlHarvestPool, stlToken, HRTeam } =
        await STLHarvestPoolFixture();
      const amount = ethers.parseEther("200");
      await stlToken.approve(stlHarvestPool.target, amount);
      await stlHarvestPool.addRewards(amount);
      const totalRewards = await stlHarvestPool.totalRewards();
      expect(totalRewards).to.equal(amount);
    });

    it("should throw error ERC20InsufficientAllowance if called address stlToken balance is less than amount", async () => {
      const { stlHarvestPool, HRTeam, stlToken } =
        await STLHarvestPoolFixture();
      const hrTeamBalance = await stlToken.balanceOf(HRTeam.address);
      await stlToken.burn(HRTeam.address, hrTeamBalance);

      const amount = ethers.parseEther("200");

      const hrTeamBalanceAfter = await stlToken.balanceOf(HRTeam.address);

      await expect(stlHarvestPool.addRewards(amount))
        .to.revertedWithCustomError(stlToken, "ERC20InsufficientAllowance")
        .withArgs(stlHarvestPool.target, hrTeamBalanceAfter, amount);
    });
    it("should throw error OwnableUnauthorizedAccount if called is different than HRTeam", async () => {
      const { stlHarvestPool, stlToken, accounts } =
        await STLHarvestPoolFixture();
      const [anyUser] = accounts;
      const amount = ethers.parseEther("200");
      await stlToken.approve(stlHarvestPool.target, amount);
      await expect(stlHarvestPool.connect(anyUser).addRewards(amount))
        .to.revertedWithCustomError(
          stlHarvestPool,
          "OwnableUnauthorizedAccount"
        )
        .withArgs(anyUser.address);
    });
  });
  describe("Deposit", () => {
    it("should Ana deposit 100 STL", async () => {
      const { stlHarvestPool, stlToken, Ana } = await STLHarvestPoolFixture();
      const amount = ethers.parseEther("100");

      await stlToken.claimToken(Ana.address);

      await stlToken.connect(Ana).approve(stlHarvestPool.target, amount);

      await stlHarvestPool.connect(Ana).deposit(amount);

      const anaAmount = (await stlHarvestPool.investors(Ana.address)).amount;
      expect(anaAmount).to.equal(amount);
    });
  });
  describe("Scenarios", () => {
    /**
     * This describers is only to cover the scenario tests
     */
    it("Scenario One Ana sends 100 and receive 150 SLT. Bob sends 300 and receive 450", async () => {
      const { stlHarvestPool, stlToken, Ana, Bob, HRTeam } =
        await STLHarvestPoolFixture();
      const anaAmount = ethers.parseEther("100");
      const bobAmount = ethers.parseEther("300");
      const hrAmount = ethers.parseEther("200");

      const approveList = [
        { wallet: Ana, amount: anaAmount },
        { wallet: Bob, amount: bobAmount },
      ];

      for await (const user of approveList) {
        await stlToken.claimToken(user.wallet.address);
        await stlToken
          .connect(user.wallet)
          .approve(stlHarvestPool.target, user.amount);
        await stlHarvestPool.connect(user.wallet).deposit(user.amount);
      }

      await stlToken.approve(stlHarvestPool.target, hrAmount);

      await stlHarvestPool.addRewards(hrAmount);

      const anaRewards = await stlHarvestPool.connect(Ana).getUserRewards();
      const anaWithdrawAmount = anaAmount + anaRewards;
      await expect(stlHarvestPool.connect(Ana).withdraw())
        .to.emit(stlHarvestPool, "Withdrawn")
        .withArgs(stlHarvestPool.target, Ana.address, anaWithdrawAmount);

      const bobRewards = await stlHarvestPool.connect(Bob).getUserRewards();
      const bobWithdrawAmount = bobAmount + bobRewards;
      await expect(stlHarvestPool.connect(Bob).withdraw())
        .to.emit(stlHarvestPool, "Withdrawn")
        .withArgs(stlHarvestPool.target, Bob.address, bobWithdrawAmount);
    });
    it("Scenario One Ana sends and receive 300 SLT. Bob sends 300 after rewards added and receive 300", async () => {
      const { stlHarvestPool, stlToken, Ana, Bob } =
        await STLHarvestPoolFixture();
      const anaAmount = ethers.parseEther("100");
      const bobAmount = ethers.parseEther("300");
      const hrAmount = ethers.parseEther("200");

      const approveList = [
        { wallet: Ana, amount: anaAmount },
        { wallet: Bob, amount: bobAmount },
      ];

      for await (const user of approveList) {
        await stlToken.claimToken(user.wallet.address);
        await stlToken
          .connect(user.wallet)
          .approve(stlHarvestPool.target, user.amount);
      }

      await stlHarvestPool.connect(Ana).deposit(anaAmount);

      await stlToken.approve(stlHarvestPool.target, hrAmount);

      await stlHarvestPool.addRewards(hrAmount);

      await stlHarvestPool.connect(Bob).deposit(bobAmount);

      const anaWithdrawAmount = anaAmount + ethers.parseEther("200");
      await expect(stlHarvestPool.connect(Ana).withdraw())
        .to.emit(stlHarvestPool, "Withdrawn")
        .withArgs(stlHarvestPool.target, Ana.address, anaWithdrawAmount);

      await expect(stlHarvestPool.connect(Bob).withdraw())
        .to.emit(stlHarvestPool, "Withdrawn")
        .withArgs(stlHarvestPool.target, Bob.address, bobAmount);
    });
  });
});
