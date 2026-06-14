// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Simple ERC721 implementation for the interactive minting demo.
 */
contract Web3NFT {
    string public name = "Astraea Elements";
    string public symbol = "ASTEL";

    uint256 public nextTokenId;
    address public owner;

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => string) private _tokenURIs;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Minted(address indexed to, uint256 indexed tokenId, string uri);

    constructor() {
        owner = msg.sender;
    }

    function mint(address to, string memory uri) public returns (uint256) {
        uint256 tokenId = nextTokenId;
        nextTokenId++;

        _owners[tokenId] = to;
        _balances[to] += 1;
        _tokenURIs[tokenId] = uri;

        emit Transfer(address(0), to, tokenId);
        emit Minted(to, tokenId, uri);

        return tokenId;
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address tokenOwner = _owners[tokenId];
        require(tokenOwner != address(0), "Token does not exist");
        return tokenOwner;
    }

    function balanceOf(address user) public view returns (uint256) {
        require(user != address(0), "Invalid address");
        return _balances[user];
    }

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        require(_owners[tokenId] != address(0), "Token does not exist");
        return _tokenURIs[tokenId];
    }
}
