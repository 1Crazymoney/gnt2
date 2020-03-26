export interface ContractAddresses {
  oldGolemToken: string;
  newGolemToken: string;
  batchingGolemToken: string;
  gntDeposit: string;
  migrationAgent: string;
}

export type NetworkName = 'mainnet' | 'ropsten' | 'rinkeby' | 'kovan' | 'local';
export type ContractAddressesByNetwork = Partial<Record<NetworkName, ContractAddresses>>;
