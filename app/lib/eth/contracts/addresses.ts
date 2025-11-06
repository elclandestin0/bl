export type ChainId = 31337;

type Addresses = {
  LendingCore: string;
  USDC: string;
};

export const ADDRESSES: Record<ChainId, Addresses> = {
  31337: {
    LendingCore: process.env.NEXT_PUBLIC_CORE_31337 || "",
    USDC: process.env.NEXT_PUBLIC_USDC_31337 || "",
  },
};