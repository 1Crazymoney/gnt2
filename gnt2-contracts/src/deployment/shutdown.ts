import {providers, Wallet} from 'ethers';
import {
  MultiSigWalletFactory,
} from 'gnt2-contracts';

import {GNTMigrationAgentFactory} from '../../build/contract-types/GNTMigrationAgentFactory';
import {createMockProvider, getWallets} from 'ethereum-waffle';
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
  const migrationAgent = await new GNTMigrationAgentFactory(deployer).attach(process.env.GNTMigrationAgentAddress!);
  if (!process.env.multisigTxHash) {
    announceStep('Submitting transaction');
    const data = migrationAgent.interface.functions.setTarget.encode(['0x0000000000000000000000000000000000000000']);
    const tx = await multisig.submitTransaction(migrationAgent.address, 0, data, 1);
    const result = await tx.wait();
    const submittedTxHash = multisig.interface.parseLog(result.logs![0]).values.transactionHash;
    console.log(`\nTxHash of setTarget submitted to multisig is 👉  '${submittedTxHash}'  👈\n`);
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
