import {providers, Wallet} from 'ethers';
import {NewGolemNetworkTokenFactory} from 'gnt2-contracts';

import {GNTMigrationAgentFactory} from '../../build/contract-types/GNTMigrationAgentFactory';
import {createMockProvider} from 'ethereum-waffle';
import {CorrectedGolemNetworkTokenFactory} from 'gnt2-contracts/build/contract-types/CorrectedGolemNetworkTokenFactory';


let provider: providers.JsonRpcProvider;

if (!process.env.infuraAddress) {
  provider = createMockProvider();
} else {
  provider = new providers.JsonRpcProvider(process.env.infuraAddress);
}

const deployer = Wallet.createRandom().connect(provider);

async function main() {
  const migrationAgent = await new GNTMigrationAgentFactory(deployer).attach(process.env.GNTMigrationAgentAddress!);
  const NGNT = await new NewGolemNetworkTokenFactory(deployer).attach(process.env.NGNTAddress!);
  const CGNT = await new CorrectedGolemNetworkTokenFactory(deployer).attach(process.env.CGNTAddress!);

  // - Check balanceOf between new token and saved state on each migrated addresses.
  const migrationParticipants = (await provider.getLogs({
    fromBlock: 1,
    address: migrationAgent.address,
    topics: migrationAgent.filters.Migrated(null, null, null).topics
  }))
    .map(e => migrationAgent.interface.parseLog(e))
    .map(e => e.values)
    .map(e => e.from);

  const uniqueParticipants = [...new Set(migrationParticipants)];

  for (let i = 0; i < uniqueParticipants.length; i++) {
    console.log(`Checking participant ${i + 1}/${uniqueParticipants.length} (${uniqueParticipants[i]})`);
    const migrationBalance = await migrationAgent.migratedForHolder(uniqueParticipants[i]);
    const mintedBalance = await CGNT.balanceOf(uniqueParticipants[i]);
    if (migrationBalance.eq(mintedBalance)) {
      console.log('✅ Balance OK');
    } else throw new Error('Balance is incorrect');
  }


  // - Check total supply after creation of new token.
  const NGNTSupply = await NGNT.totalSupply();
  const CGNTSupply = await CGNT.totalSupply();
  console.log(`NGNT Supply is ${NGNTSupply.toString()}`);
  console.log(`CGNT Supply is ${CGNTSupply.toString()}`);
  if (NGNTSupply.eq(CGNTSupply)) {
    console.log('✅ Total supply of NGNT and CGNT is the same');
  } else throw new Error('Total supply is incorrect');
}

main().catch(reason => {
  console.error(reason);
  process.exit(-1);
});
