// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Axiom
 * @notice Minimal ERC721 that stores IPFS metadata strings + revocation support.
 */
contract Axiom is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    // Added: Revocation mapping
    mapping(uint256 => bool) public revoked;

    constructor(address initialOwner) ERC721("Axiom", "AXM") Ownable(initialOwner) {}

    function mint(address recipient, string memory metadata) public returns (uint256) {
        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _mint(recipient, newTokenId);
        _setTokenURI(newTokenId, metadata);

        return newTokenId;
    }

    // Added: revoke function (open to everyone as requested)
    function revoke(uint256 tokenId) public {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        revoked[tokenId] = true;
    }

    function getMetaData(uint256 id) public view returns (string memory data) {
        return tokenURI(id);
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds;
    }
}
