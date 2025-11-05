// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library InterestMath {
    uint256 internal constant YEAR_SECONDS = 365 days;

    function calcBaseInterest(uint256 principal, uint256 aprBps, uint256 elapsedSeconds)
        internal pure returns (uint256)
    {
        return (principal * aprBps * elapsedSeconds) / (10_000 * YEAR_SECONDS);
    }

    function calcPenaltyPerDays(uint256 principal, uint256 penaltyBpsPerDay, uint256 daysLate)
        internal pure returns (uint256)
    {
        return (principal * penaltyBpsPerDay * daysLate) / 10_000;
    }
}
