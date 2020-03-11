import {providers, Wallet} from 'ethers';
import {
  MultiSigWalletFactory,
} from 'gnt2-contracts';

import {createMockProvider, getWallets} from 'ethereum-waffle';
import {GolemNetworkTokenFactory} from '../contractsWrappers';
import {BigNumber} from 'ethers/utils';

let stepCounter = 0;
const announceStep = (step: string) =>
  console.log('\n\n\n', `...::: 👇 Step ${stepCounter++} - ${step} 👇 :::...`, '\n');

let provider: providers.JsonRpcProvider;
let deployer: Wallet;


if (!process.env.infuraAddress) {
  provider = createMockProvider();
  deployer = getWallets(provider)[0];
} else {
  if (!process.env.pkey) throw new Error('private key not provided');
  provider = new providers.JsonRpcProvider(process.env.infuraAddress);
  provider.getGasPrice = async () => new BigNumber('10000000000');
  deployer = new Wallet(process.env.pkey, provider);
}


async function main() {
  const multisig = await new MultiSigWalletFactory(deployer).attach(process.env.multisigAddress!);
  const oldGnt = await new GolemNetworkTokenFactory(deployer).attach(process.env.oldGNTAddress!);
  if (!process.env.multisigTxHash) {
    announceStep('Submitting transaction');
    const data = oldGnt.interface.functions.setMigrationAgent.encode([process.env.GNTMigrationAgentAddress!]);
    const tx = await multisig.submitTransaction(oldGnt.address, 0, data, 1);
    const result = await tx.wait();
    const submittedTxHash = multisig.interface.parseLog(result.logs![0]).values.transactionHash;
    console.log(`\nTxHash of setMigrationAgent submitted to multisig is 👉  '${submittedTxHash}'  👈\n`);
  } else {
    announceStep('Confirming transaction');
    const tx = await multisig.confirmTransaction(process.env.multisigTxHash);
    await tx.wait();
  }
}

main().catch(reason => {
  console.error(reason);
  process.exit(-1);
});
