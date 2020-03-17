import {providers, Wallet} from 'ethers';
import {writeFileSync} from 'fs';
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
  const migrationAgent = await new GNTMigrationAgentFactory(deployer).attach(process.env.GNTMigrationAgentAddress!);

  const migrationEvents = (await provider.getLogs({
    fromBlock: 1,
    address: migrationAgent.address,
    topics: migrationAgent.filters.Migrated(null, null, null).topics
  }))
    .map(e => migrationAgent.interface.parseLog(e))
    .map(e => e.values);

  console.log(`There are ${migrationEvents.length} migration events.`);

  const data = migrationEvents.map(e => ({from: e.from, target: e.target, value: e.value.toString()}));

  await writeFileSync('emergency.json', JSON.stringify(data, null, 2));
  console.log('Data written to emergency.json');
}

main().catch(reason => {
  console.error(reason);
  process.exit(-1);
});
