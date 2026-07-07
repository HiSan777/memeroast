// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title MemeRoastHistory
/// @notice Minimal event-only history contract for MemeRoast final generations.
/// @dev The app stores the full metadata JSON on IPFS/Cloudinary and writes only
/// the metadata URI on-chain. Wallet history can be rebuilt by reading events.
contract MemeRoastHistory {
    event RoastRecorded(address indexed user, string metadataUri);

    function recordRoast(string memory _metadataUri) public {
        emit RoastRecorded(msg.sender, _metadataUri);
    }
}
