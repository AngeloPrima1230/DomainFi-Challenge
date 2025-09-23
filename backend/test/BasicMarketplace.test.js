const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TaghausMarketplace Basic Test", function () {
  let marketplace;
  let owner;

  before(async function () {
    [owner] = await ethers.getSigners();
    
    const TaghausMarketplace = await ethers.getContractFactory("TaghausMarketplace");
    marketplace = await TaghausMarketplace.deploy();
    await marketplace.waitForDeployment();
  });

  it("Should deploy successfully", async function () {
    expect(await marketplace.getAddress()).to.not.equal("0x0000000000000000000000000000000000000000");
  });

  it("Should have correct initial platform fee", async function () {
    expect(await marketplace.platformFee()).to.equal(250); // 2.5%
  });

  it("Should have correct owner", async function () {
    expect(await marketplace.owner()).to.equal(owner.address);
  });
});
