// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/CryptoGiftNFT.sol";
import "../contracts/SimpleApprovalGate.sol";
import "../contracts/GiftEscrowEnterpriseV3.sol";

/**
 * @title Deploy All Contracts to Base Mainnet
 * @dev Deploys CryptoGiftNFT, SimpleApprovalGate, and GiftEscrowEnterpriseV3
 * @author mbxarts.com The Moon in a Box property
 * @author Godez22 (Co-Author)
 *
 * Usage:
 *   forge script script/DeployAllMainnet.s.sol \
 *     --rpc-url https://mainnet.base.org \
 *     --broadcast \
 *     --slow
 */
contract DeployAllMainnet is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY_DEPLOY");
        address deployer = vm.addr(deployerPrivateKey);

        require(block.chainid == 8453, "Must deploy on Base Mainnet (8453)");

        // Biconomy Trusted Forwarder on Base Mainnet
        address trustedForwarder = 0xd8253782c45a12053594b9deB72d8e8aB2Fca54c;

        console.log("=== DEPLOY ALL CONTRACTS - BASE MAINNET ===");
        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);
        console.log("Trusted Forwarder:", trustedForwarder);
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy CryptoGiftNFT
        console.log("--- 1/3: Deploying CryptoGiftNFT ---");
        CryptoGiftNFT nft = new CryptoGiftNFT(deployer);
        console.log("CryptoGiftNFT deployed at:", address(nft));
        console.log("  Owner:", nft.owner());
        console.log("  Name:", nft.name());
        console.log("  Symbol:", nft.symbol());

        // 2. Deploy SimpleApprovalGate (deployer = approver for EIP-712 signing)
        console.log("--- 2/3: Deploying SimpleApprovalGate ---");
        SimpleApprovalGate gate = new SimpleApprovalGate(deployer);
        console.log("SimpleApprovalGate deployed at:", address(gate));
        console.log("  Approver:", gate.approver());
        console.log("  Active:", gate.isActive());

        // 3. Deploy GiftEscrowEnterpriseV3
        console.log("--- 3/3: Deploying GiftEscrowEnterpriseV3 ---");
        GiftEscrowEnterpriseV3 escrow = new GiftEscrowEnterpriseV3(trustedForwarder);
        console.log("GiftEscrowEnterpriseV3 deployed at:", address(escrow));
        console.log("  VERSION:", escrow.VERSION());

        // Verify roles on Escrow
        bytes32 adminRole = escrow.DEFAULT_ADMIN_ROLE();
        bytes32 minterRole = escrow.MINTER_ROLE();
        bytes32 pauserRole = escrow.PAUSER_ROLE();
        console.log("  Admin role granted:", escrow.hasRole(adminRole, deployer));
        console.log("  Minter role granted:", escrow.hasRole(minterRole, deployer));
        console.log("  Pauser role granted:", escrow.hasRole(pauserRole, deployer));

        vm.stopBroadcast();

        // Summary
        console.log("");
        console.log("========== DEPLOYMENT SUMMARY ==========");
        console.log("CryptoGiftNFT:            ", address(nft));
        console.log("SimpleApprovalGate:       ", address(gate));
        console.log("GiftEscrowEnterpriseV3:   ", address(escrow));
        console.log("=========================================");
    }
}
