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


  // - The owner of `GNTMigrationAgent` is `golemMigrationMaster`
  const ownerOfMigrationAgent = await migrationAgent.owner();
  if (ownerOfMigrationAgent.toLowerCase() === multisig.address.toLowerCase()) {
    console.log('✅ The owner of migration agent is the multisig (golem migration master)');
  } else throw new Error('The owner of migration agent is incorrect');


  // - The target of `GNTMigrationAgent` is `NGNT`
  const target = await migrationAgent.target();
  if (target.toLowerCase() === NGNT.address.toLowerCase()) {
    console.log('✅ The target of migration agent is the NGNT');
  } else throw new Error('The target of migration agent is incorrect');


  // - The owner of `GNTMigrationAgent` is the multisig
  const owner = await migrationAgent.owner();
  if (owner.toLowerCase() === multisig.address.toLowerCase()) {
    console.log('✅ The owner of migration agent is multisig');
  } else throw new Error('The owner of migration agent is incorrect');


  // - The **only** minter of `NGNT` is `GNTMigrationAgent`
  const logsMinterAdded = await provider.getLogs({
    fromBlock: 1,
    address: NGNT.address,
    topics: NGNT.filters.MinterAdded(null).topics
  });
  // 2 events - constructor minter and GNTMigrationAgent
  if (logsMinterAdded.length === 2 && await NGNT.isMinter(migrationAgent.address)) {
    console.log('✅ The only minter of NGNT is GNTMigrationAgent');
  } else throw new Error('Incorrect minters of NGNT');
}

main().catch(reason => {
  console.error(reason);
  process.exit(-1);
});
