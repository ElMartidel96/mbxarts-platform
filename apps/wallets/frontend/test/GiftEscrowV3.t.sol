// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/GiftEscrowEnterpriseV3.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title GiftEscrowV3 Tests
 * @dev Comprehensive tests for V3 features: perpetual mode, extended timeframes
 * @author mbxarts.com The Moon in a Box property
 * @author Godez22 (Co-Author)
 */

// Mock NFT for testing
contract MockNFT is ERC721 {
    uint256 private _tokenCounter;

    constructor() ERC721("MockNFT", "MNFT") {}

    function mint(address to) external returns (uint256) {
        _tokenCounter++;
        _mint(to, _tokenCounter);
        return _tokenCounter;
    }

    function mintTo(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }
}

contract GiftEscrowV3Test is Test {
    GiftEscrowEnterpriseV3 public escrow;
    MockNFT public nft;

    address public deployer = address(0x1);
    address public creator = address(0x2);
    address public claimer = address(0x3);
    address public minter = address(0x4);
    address public trustedForwarder = address(0xF);

    string constant PASSWORD = "securepass123";
    bytes32 constant SALT = bytes32(uint256(12345));
    string constant MESSAGE = "Happy Birthday!";

    function setUp() public {
        vm.startPrank(deployer);
        escrow = new GiftEscrowEnterpriseV3(trustedForwarder);
        nft = new MockNFT();

        // Grant MINTER_ROLE to minter address
        escrow.grantRole(escrow.MINTER_ROLE(), minter);
        vm.stopPrank();
    }

    // =========================================================================
    // VERSION & CONSTANTS
    // =========================================================================

    function test_Version() public view {
        assertEq(escrow.VERSION(), "3.0.0");
    }

    function test_Constants() public view {
        assertEq(escrow.FIFTEEN_MINUTES(), 900);
        assertEq(escrow.SEVEN_DAYS(), 604800);
        assertEq(escrow.FIFTEEN_DAYS(), 1296000);
        assertEq(escrow.THIRTY_DAYS(), 2592000);
        assertEq(escrow.NINETY_DAYS(), 7776000);
        assertEq(escrow.ONE_YEAR(), 31536000);
        assertEq(escrow.PERPETUAL_EXPIRY(), type(uint40).max);
        assertEq(escrow.PERPETUAL_MIN_WAIT(), 7776000);
    }

    // =========================================================================
    // ORIGINAL TIMEFRAMES (V2 COMPAT)
    // =========================================================================

    function test_CreateGift_15Minutes() public {
        uint256 tokenId = _mintAndApproveNFT(creator);

        vm.prank(creator);
        escrow.createGift(tokenId, address(nft), PASSWORD, SALT, 0, MESSAGE, address(0));

        (, uint96 expiresAt,,,,) = escrow.getGift(1);
        assertApproxEqAbs(uint256(expiresAt), block.timestamp + 900, 1);
    }

    function test_CreateGift_7Days() public {
        uint256 tokenId = _mintAndApproveNFT(creator);

        vm.prank(creator);
        escrow.createGift(tokenId, address(nft), PASSWORD, SALT, 1, MESSAGE, address(0));

        (, uint96 expiresAt,,,,) = escrow.getGift(1);
        assertApproxEqAbs(uint256(expiresAt), block.timestamp + 604800, 1);
    }

    // =========================================================================
    // V3 EXTENDED TIMEFRAMES
    // =========================================================================

    function test_CreateGift_90Days() public {
        uint256 tokenId = _mintAndApproveNFT(creator);

        vm.prank(creator);
        escrow.createGift(tokenId, address(nft), PASSWORD, SALT, 4, MESSAGE, address(0));

        (, uint96 expiresAt,,,,) = escrow.getGift(1);
        assertApproxEqAbs(uint256(expiresAt), block.timestamp + 7776000, 1);
    }

    function test_CreateGift_1Year() public {
        uint256 tokenId = _mintAndApproveNFT(creator);

        vm.prank(creator);
        escrow.createGift(tokenId, address(nft), PASSWORD, SALT, 5, MESSAGE, address(0));

        (, uint96 expiresAt,,,,) = escrow.getGift(1);
        assertApproxEqAbs(uint256(expiresAt), block.timestamp + 31536000, 1);
    }

    function test_InvalidTimeframe_Reverts() public {
        uint256 tokenId = _mintAndApproveNFT(creator);

        vm.prank(creator);
        vm.expectRevert(abi.encodeWithSelector(
            GiftEscrowEnterpriseV3.InvalidTimeframe.selector, 7
        ));
        escrow.createGift(tokenId, address(nft), PASSWORD, SALT, 7, MESSAGE, address(0));
    }

    // =========================================================================
    // PERPETUAL MODE
    // =========================================================================

    function test_CreateGift_Perpetual() public {
        uint256 tokenId = _mintAndApproveNFT(creator);

        vm.prank(creator);
        escrow.createGift(tokenId, address(nft), PASSWORD, SALT, 6, MESSAGE, address(0));

        (, uint96 expiresAt,,,,) = escrow.getGift(1);
        assertEq(uint256(expiresAt), type(uint40).max);
        assertTrue(escrow.isGiftPerpetual(1));
        assertFalse(escrow.isGiftExpired(1));
    }

    function test_PerpetualGift_ClaimableAtAnyTime() public {
        uint256 tokenId = _mintAndApproveNFT(creator);

        vm.prank(creator);
        escrow.createGift(tokenId, address(nft), PASSWORD, SALT, 6, MESSAGE, address(0));

        // Warp 10 years into the future
        vm.warp(block.timestamp + 365 days * 10);

        (bool canClaim, uint256 timeRemaining) = escrow.canClaimGift(1);
        assertTrue(canClaim);
        assertEq(timeRemaining, type(uint256).max);
        assertFalse(escrow.isGiftExpired(1));

        // Actually claim it
        vm.prank(claimer);
        escrow.claimGift(1, PASSWORD, SALT, "");

        assertEq(nft.ownerOf(tokenId), claimer);
    }

    function test_PerpetualGift_CannotReturnViaReturnExpired() public {
        uint256 tokenId = _mintAndApproveNFT(creator);

        vm.prank(creator);
        escrow.createGift(tokenId, address(nft), PASSWORD, SALT, 6, MESSAGE, address(0));

        // Even after a long time, returnExpiredGift should revert
        vm.warp(block.timestamp + 365 days * 10);

        vm.prank(creator);
        vm.expectRevert(abi.encodeWithSelector(
            GiftEscrowEnterpriseV3.NotPerpetualGift.selector, 1
        ));
        escrow.returnExpiredGift(1);
    }

    function test_PerpetualGift_CancelAfter90Days() public {
        uint256 tokenId = _mintAndApproveNFT(creator);

        vm.prank(creator);
        escrow.createGift(tokenId, address(nft), PASSWORD, SALT, 6, MESSAGE, address(0));

        uint40 createdAt = escrow.giftCreatedAt(1);

        // Try to cancel before 90 days - should fail
        vm.warp(block.timestamp + 89 days);
        vm.prank(creator);
        vm.expectRevert(abi.encodeWithSelector(
            GiftEscrowEnterpriseV3.PerpetualWaitNotMet.selector,
            1,
            createdAt,
            uint256(createdAt) + 7776000
        ));
        escrow.cancelPerpetualGift(1);

        // Warp past 90 days - should succeed
        vm.warp(uint256(createdAt) + 7776001);
        vm.prank(creator);
        escrow.cancelPerpetualGift(1);

        assertEq(nft.ownerOf(tokenId), creator);
        (,,,,, uint8 status) = escrow.getGift(1);
        assertEq(status, 2); // returned
    }

    function test_PerpetualGift_NonCreatorCannotCancel() public {
        uint256 tokenId = _mintAndApproveNFT(creator);

        vm.prank(creator);
        escrow.createGift(tokenId, address(nft), PASSWORD, SALT, 6, MESSAGE, address(0));

        vm.warp(block.timestamp + 91 days);

        vm.prank(claimer);
        vm.expectRevert(abi.encodeWithSelector(
            GiftEscrowEnterpriseV3.NotGiftCreator.selector, claimer, creator
        ));
        escrow.cancelPerpetualGift(1);
    }

    function test_CancelNonPerpetualGift_Reverts() public {
        uint256 tokenId = _mintAndApproveNFT(creator);

        vm.prank(creator);
        escrow.createGift(tokenId, address(nft), PASSWORD, SALT, 3, MESSAGE, address(0)); // 30 days

        vm.prank(creator);
        vm.expectRevert(abi.encodeWithSelector(
            GiftEscrowEnterpriseV3.NotPerpetualGift.selector, 1
        ));
        escrow.cancelPerpetualGift(1);
    }

    // =========================================================================
    // REGISTER GIFT MINTED (V2 COMPAT + V3 TIMEFRAMES)
    // =========================================================================

    function test_RegisterGiftMinted_Perpetual() public {
        // Mint NFT directly to escrow
        vm.prank(deployer);
        nft.mintTo(address(escrow), 100);

        vm.prank(minter);
        escrow.registerGiftMinted(
            100,
            address(nft),
            creator,
            PASSWORD,
            SALT,
            6, // perpetual
            MESSAGE,
            address(0)
        );

        assertTrue(escrow.isGiftPerpetual(1));
        assertEq(escrow.giftCreatedAt(1), uint40(block.timestamp));
    }

    function test_RegisterGiftMinted_90Days() public {
        vm.prank(deployer);
        nft.mintTo(address(escrow), 101);

        vm.prank(minter);
        escrow.registerGiftMinted(
            101,
            address(nft),
            creator,
            PASSWORD,
            SALT,
            4, // 90 days
            MESSAGE,
            address(0)
        );

        (, uint96 expiresAt,,,,) = escrow.getGift(1);
        assertApproxEqAbs(uint256(expiresAt), block.timestamp + 7776000, 1);
    }

    // =========================================================================
    // EMERGENCY CANCEL
    // =========================================================================

    function test_EmergencyCancel_PerpetualGift() public {
        uint256 tokenId = _mintAndApproveNFT(creator);

        vm.prank(creator);
        escrow.createGift(tokenId, address(nft), PASSWORD, SALT, 6, MESSAGE, address(0));

        // Emergency role can cancel immediately without waiting
        vm.prank(deployer);
        escrow.emergencyCancelGift(1);

        assertEq(nft.ownerOf(tokenId), creator);
    }

    // =========================================================================
    // GIFT CREATED AT TRACKING
    // =========================================================================

    function test_GiftCreatedAt_TrackedForAllGifts() public {
        uint256 tokenId = _mintAndApproveNFT(creator);

        uint256 createTime = block.timestamp;
        vm.prank(creator);
        escrow.createGift(tokenId, address(nft), PASSWORD, SALT, 1, MESSAGE, address(0));

        assertEq(escrow.giftCreatedAt(1), uint40(createTime));
    }

    // =========================================================================
    // HELPERS
    // =========================================================================

    function _mintAndApproveNFT(address to) internal returns (uint256) {
        vm.startPrank(deployer);
        uint256 tokenId = nft.mint(to);
        vm.stopPrank();

        vm.prank(to);
        nft.approve(address(escrow), tokenId);

        return tokenId;
    }
}
