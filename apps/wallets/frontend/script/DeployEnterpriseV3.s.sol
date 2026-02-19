// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/GiftEscrowEnterpriseV3.sol";

/**
 * @title Deploy GiftEscrowEnterpriseV3
 * @dev Deployment script for V3 Escrow with perpetual mode
 * @author mbxarts.com The Moon in a Box property
 * @author Godez22 (Co-Author)
 *
 * Usage:
 *   Base Sepolia:
 *     forge script script/DeployEnterpriseV3.s.sol --rpc-url $BASE_SEPOLIA_RPC --broadcast --verify
 *   Base Mainnet:
 *     forge script script/DeployEnterpriseV3.s.sol --rpc-url $BASE_MAINNET_RPC --broadcast --verify
 */
contract DeployEnterpriseV3 is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY_DEPLOY");
        address deployer = vm.addr(deployerPrivateKey);

        // Trusted forwarder varies by chain
        // Base Sepolia: OpenZeppelin Forwarder
        // Base Mainnet: Biconomy or OpenZeppelin Forwarder
        address trustedForwarder;
        if (block.chainid == 84532) {
            // Base Sepolia - ERC2771 Forwarder
            trustedForwarder = 0xd8253782c45a12053594b9deB72d8e8aB2Fca54c;
        } else if (block.chainid == 8453) {
            // Base Mainnet - Biconomy Trusted Forwarder
            trustedForwarder = 0xd8253782c45a12053594b9deB72d8e8aB2Fca54c;
        } else {
            revert("Unsupported chain");
        }

        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);
        console.log("Trusted Forwarder:", trustedForwarder);

        vm.startBroadcast(deployerPrivateKey);

        GiftEscrowEnterpriseV3 escrow = new GiftEscrowEnterpriseV3(trustedForwarder);

        console.log("GiftEscrowEnterpriseV3 deployed at:", address(escrow));
        console.log("VERSION:", escrow.VERSION());

        // Verify roles
        bytes32 adminRole = escrow.DEFAULT_ADMIN_ROLE();
        bytes32 minterRole = escrow.MINTER_ROLE();
        console.log("Admin role granted:", escrow.hasRole(adminRole, deployer));
        console.log("Minter role granted:", escrow.hasRole(minterRole, deployer));

        vm.stopBroadcast();
    }
}
