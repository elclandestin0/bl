import type { LendingCore } from "@/typechain-types";

export type Bid = Awaited<ReturnType<LendingCore["bids"]>>;
export type Loan = Awaited<ReturnType<LendingCore["loans"]>>;