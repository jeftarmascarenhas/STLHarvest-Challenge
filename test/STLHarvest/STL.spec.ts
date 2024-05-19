import { expect } from "chai";
import { STLFixture } from "../fextures/STLFixture";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";

describe("STL Token", () => {
  describe("Deployment", () => {
    it("should owner has balance greater than 0", async () => {
      const { stlToken, HRTeam } = await STLFixture();
      const ownerBalance = await stlToken.balanceOf(HRTeam.address);
      expect(ownerBalance).to.greaterThan(0);
    });
    it("should owner has balance greater than 0", async () => {
      const { stlToken } = await STLFixture();
      const stlBalance = await stlToken.balanceOf(stlToken.target);
      expect(stlBalance).to.greaterThan(0);
    });
  });

  describe("Claim Token", () => {
    it("should Ana and Bob haves balances greater than 0", async () => {
      const { stlToken, Ana, Bob } = await STLFixture();

      await stlToken.claimToken(Ana.address);

      const anaBalance = await stlToken.balanceOf(Ana.address);
      expect(anaBalance).greaterThan(0);

      await expect(stlToken.claimToken(Bob.address))
        .to.be.emit(stlToken, "Claimed")
        .withArgs(stlToken.target, Bob.address, anyValue);

      const bobBalance = await stlToken.balanceOf(Bob.address);

      expect(bobBalance).greaterThan(0);
    });

    it("should return error MaxAmountExceed if max amount per wallet was exceed", async () => {
      const { stlToken, Ana } = await STLFixture();
      await Promise.all([
        stlToken.claimToken(Ana.address),
        stlToken.claimToken(Ana.address),
      ]);
      await expect(stlToken.claimToken(Ana.address)).to.revertedWithCustomError(
        stlToken,
        "MaxAmountExceed"
      );
    });

    it("should return error AirDropPaused if max amount per wallet was exceed", async () => {
      const { stlToken, Ana } = await STLFixture();
      await stlToken.finishAirDrop();

      await expect(stlToken.claimToken(Ana.address)).to.revertedWithCustomError(
        stlToken,
        "AirDropPaused"
      );
    });
  });

  describe("Finish AirDrop", () => {
    it("should finish airdrop transferring contract balance to owner", async () => {
      const { stlToken } = await STLFixture();

      const contractBalance = await stlToken.balanceOf(stlToken.target);

      expect(contractBalance).to.greaterThan(0);

      await stlToken.finishAirDrop();

      const contractBalanceAfter = await stlToken.balanceOf(stlToken.target);

      expect(contractBalanceAfter).to.equal(0);
    });
    it("should throw error OwnableUnauthorizedAccount if called is not owner", async () => {
      const { stlToken, Ana } = await STLFixture();

      await expect(stlToken.connect(Ana).finishAirDrop())
        .revertedWithCustomError(stlToken, "OwnableUnauthorizedAccount")
        .withArgs(Ana.address);
    });
  });

  describe("Burn STL Token", () => {
    it("", async () => {});
  });
});
