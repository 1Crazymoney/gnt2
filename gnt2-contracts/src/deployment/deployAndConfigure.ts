import {providers, Wallet} from 'ethers';
import {deployOldToken} from './deployDevGolemContracts';
import {
  GolemNetworkTokenBatchingFactory,
  NewGolemNetworkTokenFactory,
  MultiSigWalletFactory,
} from 'gnt2-contracts';

import {GNTMigrationAgentFactory} from '../../build/contract-types/GNTMigrationAgentFactory';
import {getChainId} from '../utils/network';
import {createMockProvider, getWallets} from 'ethereum-waffle';
import {BigNumber} from 'ethers/utils';
import {BatchingSidecarFactory} from 'gnt2-contracts/build/contract-types/BatchingSidecarFactory';
import {announceStep} from './utils';

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
  if (await getChainId(provider) === 42) {
    // cheaper gas price on Kovan
    provider.getGasPrice = async () => new BigNumber('10000000000');
  }

  announceStep('Deploy MultiSigWallet');
  const multiSigOwners = [
    '0xB1974E1F44EAD2d22bB995167A709b89Fc466B6c',
    '0xc0AcC46ea12692Cd5aEf85f417A005D730793c6b',
    '0x71557AeC00Aa7f1b7DD86e24938F4c50a3F2f52a',
    '0xfd5599AAd899B7c413318d19e85c08263283Ff5C',
  ];
  const multisig = await new MultiSigWalletFactory(deployer).deploy(multiSigOwners, 2);
  await multisig.deployed();
  console.log(`MultiSigWallet deployed at address: ${multisig.address}`);

  announceStep('Deploy GNT');
  const {token: oldGNT} = await deployOldToken(provider, deployer, deployer);
  await oldGNT.deployed();
  await (await oldGNT.setMigrationMaster(multisig.address)).wait();
  console.log(`GNT deployed at address: ${oldGNT.address}`);


  announceStep('Deploy GNTB');
  const GNTB = await new GolemNetworkTokenBatchingFactory(deployer).deploy(oldGNT.address);
  await GNTB.deployed();
  console.log(`GNTB deployed at address: ${GNTB.address}`);


  announceStep('Deploy GNTMigrationAgent');
  const migrationAgent = await new GNTMigrationAgentFactory(deployer).deploy(oldGNT.address);
  await migrationAgent.deployed();
  console.log(`Migration Agent deployed at address: ${migrationAgent.address}`);


  announceStep('Deploy NGNT');
  const NGNT = await new NewGolemNetworkTokenFactory(deployer).deploy(migrationAgent.address, await getChainId(provider));
  await NGNT.deployed();
  console.log(`NGNT deployed at address: ${NGNT.address}`);


  announceStep('Configure GNTMigrationAgent');
  let tx = await migrationAgent.setTarget(NGNT.address);
  await tx.wait();
  console.log(`done. tx hash: ${tx.hash}`);


  announceStep('Change ownership of GNTMigrationAgent');
  tx = await migrationAgent.transferOwnership(multisig.address);
  await tx.wait();
  console.log(`done. tx hash: ${tx.hash}`);


  announceStep('Deploying Batching sidecar');
  const batchingSidecar = await new BatchingSidecarFactory(deployer).deploy(NGNT.address);
  await batchingSidecar.deployed();
  console.log(`BatchingSidecar deployed at ${batchingSidecar.address}`);


  console.log('\nLast step is excluded from this procedure\n');
}

main().catch(reason => {
  console.error(reason);
  process.exit(-1);
});
