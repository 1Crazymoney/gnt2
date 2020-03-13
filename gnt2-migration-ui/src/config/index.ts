import {getEnv} from './getEnv';

export interface ContractAddresses {
  oldGolemToken: string;
  newGolemToken: string;
  batchingGolemToken: string;
  gntDeposit: string;
}

export type NetworkName = 'rinkeby' | 'kovan';

export type ContractAddressesByNetwork = Record<NetworkName, ContractAddresses>;

export const contractAddressesConfig: ContractAddressesByNetwork = Object.freeze({
  rinkeby: {
    oldGolemToken: getEnv('OLD_GNT_TOKEN_CONTRACT_ADDRESS_RINKEBY', ''),
    newGolemToken: getEnv('NEW_GNT_TOKEN_CONTRACT_ADDRESS_RINKEBY', ''),
    batchingGolemToken: getEnv('BATCHING_GNT_TOKEN_CONTRACT_ADDRESS_RINKEBY', ''),
    gntDeposit: getEnv('GNT_DEPOSIT_CONTRACT_ADDRESS_RINKEBY', '')
  },
  kovan: {
    oldGolemToken: getEnv('OLD_GNT_TOKEN_CONTRACT_ADDRESS_KOVAN', ''),
    newGolemToken: getEnv('NEW_GNT_TOKEN_CONTRACT_ADDRESS_KOVAN', ''),
    batchingGolemToken: getEnv('BATCHING_GNT_TOKEN_CONTRACT_ADDRESS_KOVAN', ''),
    gntDeposit: getEnv('GNT_DEPOSIT_CONTRACT_ADDRESS_KOVAN', '')
  }
});

export const gasLimit = 750000;
