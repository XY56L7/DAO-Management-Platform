// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GovernanceToken is ERC20, ERC20Burnable, ERC20Votes, ERC20Permit, Ownable {
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18;
    
    mapping(address => uint256) public vestingSchedules;
    mapping(address => uint256) public vestedAmount;
    mapping(address => uint256) public vestingStart;
    
    event VestingScheduleCreated(address indexed beneficiary, uint256 amount, uint256 duration);
    event TokensVested(address indexed beneficiary, uint256 amount);

    constructor() 
        ERC20("DAO Governance Token", "DGOV") 
        ERC20Permit("DAO Governance Token")
        Ownable(msg.sender)
    {
        _mint(msg.sender, 100000000 * 10**18);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    function createVestingSchedule(
        address beneficiary,
        uint256 amount,
        uint256 duration
    ) external onlyOwner {
        require(vestingSchedules[beneficiary] == 0, "Vesting schedule already exists");
        require(amount > 0, "Amount must be greater than 0");
        
        vestingSchedules[beneficiary] = duration;
        vestingStart[beneficiary] = block.timestamp;
        
        _mint(address(this), amount);
        
        emit VestingScheduleCreated(beneficiary, amount, duration);
    }

    function claimVestedTokens() external {
        uint256 vested = getVestedAmount(msg.sender);
        require(vested > 0, "No tokens to claim");
        
        vestedAmount[msg.sender] += vested;
        _transfer(address(this), msg.sender, vested);
        
        emit TokensVested(msg.sender, vested);
    }

    function getVestedAmount(address beneficiary) public view returns (uint256) {
        uint256 vestingDuration = vestingSchedules[beneficiary];
        if (vestingDuration == 0) return 0;
        
        uint256 elapsed = block.timestamp - vestingStart[beneficiary];
        uint256 totalAllocation = balanceOf(address(this));
        
        if (elapsed >= vestingDuration) {
            return totalAllocation - vestedAmount[beneficiary];
        }
        
        uint256 vestedTotal = (totalAllocation * elapsed) / vestingDuration;
        return vestedTotal - vestedAmount[beneficiary];
    }

    // The following functions are overrides required by Solidity.
    function _update(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, amount);
    }

    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}
