// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DAOTreasury is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmations;
        mapping(address => bool) isConfirmed;
    }

    struct Expenditure {
        address token;
        uint256 amount;
        address recipient;
        uint256 timestamp;
        string description;
    }

    mapping(uint256 => Transaction) public transactions;
    uint256 public transactionCount;
    uint256 public requiredConfirmations;
    
    Expenditure[] public expenditures;
    
    event Deposit(address indexed sender, uint256 amount, uint256 balance);
    event SubmitTransaction(
        address indexed owner,
        uint256 indexed txIndex,
        address indexed to,
        uint256 value,
        bytes data
    );
    event ConfirmTransaction(address indexed owner, uint256 indexed txIndex);
    event RevokeConfirmation(address indexed owner, uint256 indexed txIndex);
    event ExecuteTransaction(address indexed owner, uint256 indexed txIndex);
    event ExpenditureRecorded(address indexed token, uint256 amount, address indexed recipient, string description);

    modifier txExists(uint256 _txIndex) {
        require(_txIndex < transactionCount, "Transaction does not exist");
        _;
    }

    modifier notExecuted(uint256 _txIndex) {
        require(!transactions[_txIndex].executed, "Transaction already executed");
        _;
    }

    modifier notConfirmed(uint256 _txIndex) {
        require(!transactions[_txIndex].isConfirmed[msg.sender], "Transaction already confirmed");
        _;
    }

    constructor(address[] memory _executors, uint256 _requiredConfirmations) {
        require(_executors.length > 0, "Executors required");
        require(
            _requiredConfirmations > 0 && _requiredConfirmations <= _executors.length,
            "Invalid number of required confirmations"
        );

        for (uint256 i = 0; i < _executors.length; i++) {
            address executor = _executors[i];
            require(executor != address(0), "Invalid executor");
            _grantRole(EXECUTOR_ROLE, executor);
        }

        requiredConfirmations = _requiredConfirmations;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    function submitTransaction(
        address _to,
        uint256 _value,
        bytes memory _data
    ) public onlyRole(EXECUTOR_ROLE) {
        uint256 txIndex = transactionCount;
        
        Transaction storage transaction = transactions[txIndex];
        transaction.to = _to;
        transaction.value = _value;
        transaction.data = _data;
        transaction.executed = false;
        transaction.confirmations = 0;

        transactionCount++;

        emit SubmitTransaction(msg.sender, txIndex, _to, _value, _data);
    }

    function confirmTransaction(uint256 _txIndex)
        public
        onlyRole(EXECUTOR_ROLE)
        txExists(_txIndex)
        notExecuted(_txIndex)
        notConfirmed(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];
        transaction.isConfirmed[msg.sender] = true;
        transaction.confirmations += 1;

        emit ConfirmTransaction(msg.sender, _txIndex);
    }

    function executeTransaction(uint256 _txIndex)
        public
        onlyRole(EXECUTOR_ROLE)
        txExists(_txIndex)
        notExecuted(_txIndex)
        nonReentrant
    {
        Transaction storage transaction = transactions[_txIndex];

        require(
            transaction.confirmations >= requiredConfirmations,
            "Cannot execute: not enough confirmations"
        );

        transaction.executed = true;

        (bool success, ) = transaction.to.call{value: transaction.value}(
            transaction.data
        );
        require(success, "Transaction execution failed");

        emit ExecuteTransaction(msg.sender, _txIndex);
    }

    function revokeConfirmation(uint256 _txIndex)
        public
        onlyRole(EXECUTOR_ROLE)
        txExists(_txIndex)
        notExecuted(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];

        require(transaction.isConfirmed[msg.sender], "Transaction not confirmed");

        transaction.isConfirmed[msg.sender] = false;
        transaction.confirmations -= 1;

        emit RevokeConfirmation(msg.sender, _txIndex);
    }

    function recordExpenditure(
        address _token,
        uint256 _amount,
        address _recipient,
        string memory _description
    ) public onlyRole(EXECUTOR_ROLE) {
        expenditures.push(Expenditure({
            token: _token,
            amount: _amount,
            recipient: _recipient,
            timestamp: block.timestamp,
            description: _description
        }));

        emit ExpenditureRecorded(_token, _amount, _recipient, _description);
    }

    function withdrawERC20(
        address _token,
        address _to,
        uint256 _amount
    ) external onlyRole(EXECUTOR_ROLE) {
        IERC20(_token).safeTransfer(_to, _amount);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getTokenBalance(address _token) public view returns (uint256) {
        return IERC20(_token).balanceOf(address(this));
    }

    function getExpenditureCount() public view returns (uint256) {
        return expenditures.length;
    }

    function getExpenditure(uint256 _index) public view returns (
        address token,
        uint256 amount,
        address recipient,
        uint256 timestamp,
        string memory description
    ) {
        require(_index < expenditures.length, "Invalid index");
        Expenditure memory exp = expenditures[_index];
        return (exp.token, exp.amount, exp.recipient, exp.timestamp, exp.description);
    }

    function isConfirmed(uint256 _txIndex, address _owner) public view returns (bool) {
        return transactions[_txIndex].isConfirmed[_owner];
    }
}
