import {providers, Wallet} from 'ethers';
import {
  NewGolemNetworkTokenFactory,
  MultiSigWalletFactory,
} from 'gnt2-contracts';

import {GNTMigrationAgentFactory} from '../../build/contract-types/GNTMigrationAgentFactory';
import {createMockProvider} from 'ethereum-waffle';


let provider: providers.JsonRpcProvider;

if (!process.env.infuraAddress) {
  provider = createMockProvider();
} else {
  provider = new providers.JsonRpcProvider(process.env.infuraAddress);
}

const deployer = Wallet.createRandom().connect(provider);

async function main() {
  const NGNT = await new NewGolemNetworkTokenFactory(deployer).attach(process.env.NGNTAddress!);
  const multisig = await new MultiSigWalletFactory(deployer).attach(process.env.multisigAddress!);
  const migrationAgent = await new GNTMigrationAgentFactory(deployer).attach(process.env.GNTMigrationAgentAddress!);

  const ownerOfMigrationAgent = await migrationAgent.owner();
  if (ownerOfMigrationAgent.toLowerCase() === multisig.address.toLowerCase()) {
    console.log('✅ The owner of migration agent is the multisig (golem migration master)');
  } else throw new Error('The owner of migration agent is incorrect');

  const target = await migrationAgent.target();
  if (target.toLowerCase() === NGNT.address.toLowerCase()) {
    console.log('✅ The target of migration agent is the NGNT');
  } else throw new Error('The target of migration agent is incorrect');
}

main().catch(reason => {
  console.error(reason);
  process.exit(-1);
});
