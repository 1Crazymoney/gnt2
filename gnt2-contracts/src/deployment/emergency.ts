import {providers, Wallet} from 'ethers';
import {writeFileSync} from 'fs';
import {GNTMigrationAgentFactory} from '../../build/contract-types/GNTMigrationAgentFactory';
import {CorrectedGolemNetworkTokenFactory} from '../../build/contract-types/CorrectedGolemNetworkTokenFactory';
import {createMockProvider, getWallets} from 'ethereum-waffle';
import {announceStep} from './utils';
import {getChainId} from '../utils/network';


let provider: providers.JsonRpcProvider;
let deployer: Wallet;

if (!process.env.infuraAddress) {
  provider = createMockProvider();
  deployer = getWallets(provider)[0];
} else {
  if (!process.env.pkey) throw new Error('private key not provided');
  provider = new providers.JsonRpcProvider(process.env.infuraAddress);
  deployer = new Wallet(process.env.pkey, provider);
}

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

  announceStep('Deploy CGNT');
  const CGNT = await new CorrectedGolemNetworkTokenFactory(deployer).deploy(migrationAgent.address, await getChainId(provider));
  await CGNT.deployed();
  console.log(`CGNT deployed at address: ${CGNT.address}`);

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    announceStep(`Minting ${i + 1}/${data.length}`);
    (await CGNT.mint(item.from, item.value)).wait();
    console.log('Minted.');
  }

  announceStep('Renounce minter');
  (await CGNT.renounceMinter()).wait();
  console.log('Renounced');

  console.log('Emergency finished');
}

main().catch(reason => {
  console.error(reason);
  process.exit(-1);
});
