// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { InterestMath } from "./InterestMath.sol";

contract LendingCore is ReentrancyGuard {
    using SafeERC20 for IERC20;
    IERC20 public immutable USDC;
    uint256 public constant TERM = 30 days;
    uint256 public constant GRACE_TO_DEFAULT = 90 days;   // after due
    uint256 public constant PENALTY_BPS_PER_DAY = 50;     // 0.50%/day demo

    uint256 public nextBidId = 1;
    uint256 public nextLoanId = 1;

    struct Bid {
        address borrower;
        uint256 amount;
        uint256 aprBps;
        uint256 recommendedAmount;
        uint256 recommendedAprBps;
        bool open;
    }

    struct Loan {
        address borrower;
        address lender;
        uint256 principal;
        uint256 aprBps;
        uint256 start;
        uint256 due;
        uint256 defaultDate;
        uint256 repaid;     // total sent to lender
        bool settled;
        bool defaulted;
    }

    mapping(uint256 => Bid)  public bids;
    mapping(uint256 => Loan) public loans;

    event BidSubmitted(uint256 indexed bidId, address indexed borrower, uint256 amount, uint256 aprBps, uint256 recommendedAmount, uint256 recommendedApr );
    event BidCancelled(uint256 indexed bidId);
    event BidAccepted(uint256 indexed bidId, uint256 indexed loanId, address indexed lender);
    event Repaid(uint256 indexed loanId, address indexed payer, uint256 amount, uint256 newRepaid, uint256 outstanding);
    event Defaulted(uint256 indexed loanId, uint256 timestamp, uint256 outstanding);

    constructor(address usdc) { require(usdc != address(0), "USDC=0"); USDC = IERC20(usdc); }

    function submitBid(uint256 amount, uint256 aprBps, uint256 recommendedAmount, uint256 recommendedApr) external returns (uint256 bidId) {
        require(amount >= 1_000e6 && amount <= 20_000e6, "amount range");
        require(aprBps >= 500 && aprBps <= 2000, "apr range");

        bidId = nextBidId++;
        bids[bidId] = Bid({ borrower: msg.sender, amount: amount, aprBps: aprBps, recommendedAmount: recommendedAmount, recommendedAprBps: recommendedApr, open: true });
        emit BidSubmitted(bidId, msg.sender, amount, aprBps, recommendedAmount, recommendedApr);
    }

    function cancelBid(uint256 bidId) external {
        Bid storage b = bids[bidId];
        require(b.open, "not open");
        require(b.borrower == msg.sender, "not borrower");
        b.open = false;
        emit BidCancelled(bidId);
    }

    function acceptBid(uint256 bidId) external nonReentrant returns (uint256 loanId) {
        Bid storage b = bids[bidId];
        require(b.open, "not open");
        b.open = false;

        USDC.safeTransferFrom(msg.sender, b.borrower, b.amount);

        loanId = nextLoanId++;
        uint256 start = block.timestamp;
        loans[loanId] = Loan({
            borrower: b.borrower,
            lender: msg.sender,
            principal: b.amount,
            aprBps: b.aprBps,
            start: start,
            due: start + TERM,
            defaultDate: start + TERM + GRACE_TO_DEFAULT,
            repaid: 0,
            settled: false,
            defaulted: false
        });

        emit BidAccepted(bidId, loanId, msg.sender);
    }

    function repay(uint256 loanId, uint256 amount) external nonReentrant {
        Loan storage L = loans[loanId];
        require(L.borrower != address(0), "loan NA");
        require(!L.settled && !L.defaulted, "closed");

        uint256 dueNow = outstanding(loanId);
        require(dueNow > 0, "nothing due");

        uint256 pay = amount > dueNow ? dueNow : amount;

        USDC.safeTransferFrom(msg.sender, address(this), pay);
        USDC.safeTransfer(L.lender, pay);

        L.repaid += pay;
        uint256 remain = outstanding(loanId);
        if (remain == 0) L.settled = true;

        emit Repaid(loanId, msg.sender, pay, L.repaid, remain);
    }

    function markDefault(uint256 loanId) external {
        Loan storage L = loans[loanId];
        require(!L.settled && !L.defaulted, "closed");
        require(block.timestamp > L.defaultDate, "not past default");

        uint256 remain = outstanding(loanId);
        require(remain > 0, "no debt");
        L.defaulted = true;

        emit Defaulted(loanId, block.timestamp, remain);
    }

    function outstanding(uint256 loanId) public view returns (uint256) {
        Loan storage L = loans[loanId];
        if (L.borrower == address(0)) return 0;

        uint256 t = block.timestamp;
        uint256 elapsedToDue = t <= L.due ? (t - L.start) : (L.due - L.start);
        uint256 baseInterest = InterestMath.calcBaseInterest(L.principal, L.aprBps, elapsedToDue);

        uint256 penalty = 0;
        if (t > L.due) {
            uint256 capped = t <= L.defaultDate ? t : L.defaultDate;
            if (capped > L.due) {
                uint256 daysLate = (capped - L.due) / 1 days;
                penalty = InterestMath.calcPenaltyPerDays(L.principal, PENALTY_BPS_PER_DAY, daysLate);
            }
        }

        uint256 gross = L.principal + baseInterest + penalty;
        return L.repaid >= gross ? 0 : (gross - L.repaid);
    }

    function status(uint256 loanId) external view returns (uint8) {
        Loan storage L = loans[loanId];
        if (L.settled) return 2;
        if (L.defaulted) return 3;
        if (block.timestamp > L.due && outstanding(loanId) > 0) return 1;
        return 0;
    }
}
