pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VoteEscrow is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    struct LockedBalance {
        uint256 amount;
        uint256 end;
    }

    IERC20 public token;
    
    mapping(address => LockedBalance) public locked;
    mapping(address => uint256) public delegatedTo;
    mapping(address => uint256) public receivedDelegations;
    
    uint256 public constant MAXTIME = 4 * 365 * 86400;
    uint256 public constant WEEK = 7 * 86400;
    
    uint256 public totalLocked;

    event Deposit(
        address indexed provider,
        uint256 value,
        uint256 locktime,
        uint256 timestamp
    );
    
    event Withdraw(address indexed provider, uint256 value, uint256 timestamp);
    
    event DelegateChanged(
        address indexed delegator,
        address indexed fromDelegate,
        address indexed toDelegate,
        uint256 amount
    );

    constructor(address _token) Ownable(msg.sender) {
        token = IERC20(_token);
    }

    function createLock(uint256 _value, uint256 _unlockTime) external nonReentrant {
        require(_value > 0, "Need non-zero value");
        require(locked[msg.sender].amount == 0, "Withdraw old tokens first");
        require(_unlockTime > block.timestamp, "Can only lock until future");
        require(_unlockTime <= block.timestamp + MAXTIME, "Voting lock can be 4 years max");

        _unlockTime = (_unlockTime / WEEK) * WEEK;

        locked[msg.sender] = LockedBalance({
            amount: _value,
            end: _unlockTime
        });

        totalLocked += _value;

        token.safeTransferFrom(msg.sender, address(this), _value);

        emit Deposit(msg.sender, _value, _unlockTime, block.timestamp);
    }

    function increaseAmount(uint256 _value) external nonReentrant {
        LockedBalance storage _locked = locked[msg.sender];
        
        require(_value > 0, "Need non-zero value");
        require(_locked.amount > 0, "No existing lock found");
        require(_locked.end > block.timestamp, "Cannot add to expired lock");

        _locked.amount += _value;
        totalLocked += _value;

        token.safeTransferFrom(msg.sender, address(this), _value);

        emit Deposit(msg.sender, _value, _locked.end, block.timestamp);
    }

    function increaseUnlockTime(uint256 _unlockTime) external nonReentrant {
        LockedBalance storage _locked = locked[msg.sender];
        
        require(_locked.end > block.timestamp, "Lock expired");
        require(_unlockTime > _locked.end, "Can only increase lock duration");
        require(_unlockTime <= block.timestamp + MAXTIME, "Voting lock can be 4 years max");

        _unlockTime = (_unlockTime / WEEK) * WEEK;
        _locked.end = _unlockTime;

        emit Deposit(msg.sender, 0, _unlockTime, block.timestamp);
    }

    function withdraw() external nonReentrant {
        LockedBalance storage _locked = locked[msg.sender];
        
        require(block.timestamp >= _locked.end, "Lock not expired");
        uint256 value = _locked.amount;

        _locked.amount = 0;
        _locked.end = 0;
        totalLocked -= value;

        token.safeTransfer(msg.sender, value);

        emit Withdraw(msg.sender, value, block.timestamp);
    }

    function balanceOf(address _addr) external view returns (uint256) {
        LockedBalance memory _locked = locked[_addr];
        if (_locked.end <= block.timestamp) {
            return 0;
        }
        return _locked.amount;
    }

    function balanceOfAt(address _addr, uint256 _timestamp) external view returns (uint256) {
        LockedBalance memory _locked = locked[_addr];
        if (_locked.end <= _timestamp) {
            return 0;
        }
        return _locked.amount;
    }

    function totalSupply() external view returns (uint256) {
        return totalLocked;
    }

    function getVotingPower(address _addr) public view returns (uint256) {
        LockedBalance memory _locked = locked[_addr];
        
        if (_locked.end <= block.timestamp || _locked.amount == 0) {
            return 0;
        }

        uint256 timeLeft = _locked.end - block.timestamp;
        return (_locked.amount * timeLeft) / MAXTIME;
    }

    function delegate(address _delegatee) external {
        require(_delegatee != address(0), "Cannot delegate to zero address");
        require(_delegatee != msg.sender, "Cannot delegate to self");
        
        LockedBalance memory _locked = locked[msg.sender];
        require(_locked.amount > 0, "No tokens locked");
        require(_locked.end > block.timestamp, "Lock expired");

        address currentDelegate = address(uint160(delegatedTo[msg.sender]));
        
        if (currentDelegate != address(0)) {
            receivedDelegations[currentDelegate] -= _locked.amount;
        }

        delegatedTo[msg.sender] = uint256(uint160(_delegatee));
        receivedDelegations[_delegatee] += _locked.amount;

        emit DelegateChanged(msg.sender, currentDelegate, _delegatee, _locked.amount);
    }

    function getTotalVotingPower(address _addr) external view returns (uint256) {
        uint256 ownVotingPower = getVotingPower(_addr);
        uint256 delegatedPower = receivedDelegations[_addr];
        return ownVotingPower + delegatedPower;
    }
}
