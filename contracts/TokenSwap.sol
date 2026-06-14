// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Simple ERC20 implementation with basic staking features.
 */
contract TokenSwap {
    string public name = "Astraea Token";
    string public symbol = "ASTRA";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // Staking tracking
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public stakeTimestamp;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);

    constructor(uint256 initialSupply) {
        totalSupply = initialSupply * 10**uint256(decimals);
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    function transfer(address to, uint256 value) public returns (bool success) {
        require(to != address(0), "Invalid address");
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        
        emit Transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) public returns (bool success) {
        require(spender != address(0), "Invalid spender");
        
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) public returns (bool success) {
        require(from != address(0), "Invalid from address");
        require(to != address(0), "Invalid to address");
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Insufficient allowance");

        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;

        emit Transfer(from, to, value);
        return true;
    }

    // Staking logic
    function stake(uint256 amount) public {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");

        balanceOf[msg.sender] -= amount;
        stakedBalance[msg.sender] += amount;
        stakeTimestamp[msg.sender] = block.timestamp;

        emit Staked(msg.sender, amount);
    }

    function unstake() public {
        uint256 amount = stakedBalance[msg.sender];
        require(amount > 0, "No staked balance");

        uint256 duration = block.timestamp - stakeTimestamp[msg.sender];
        // 10% APY simulation: reward = amount * (10 / 100) * (duration / 365 days)
        uint256 reward = (amount * 10 * duration) / (100 * 365 days);

        stakedBalance[msg.sender] = 0;
        stakeTimestamp[msg.sender] = 0;

        balanceOf[msg.sender] += amount + reward;
        totalSupply += reward; // Mint the reward

        emit Unstaked(msg.sender, amount, reward);
        emit Transfer(address(0), msg.sender, reward);
    }
}
