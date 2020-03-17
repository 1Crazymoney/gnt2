# Deployment

This page is about the deployment script and procedures.
There are the following scripts here:

Script | Purpose | Details
--- | --- | ---
`deploy.sh` | Deploy and configure all necessary Smart Contracts, excluding last step of starting the migration. | Can be executed by 3rd party.
`precheck.sh`  | Make assertions about the deployment to make sure everything is correct. | Interact with blockchain in read-only mode.
`setMigrationAgent.sh` | Perform the last step, effectively starting the migration. | Executed by Golem Migration Master
`shutdown.sh` | First step of Emergency Recovery mode. | Executed by Golem Migration Master
`emergency.sh` | Second step of Emergency Recovery mode - read migrated balances. | Executed by Golem Migration Master

# Usage

## Targets

There are the following targets of the scripts:

Target | Description
--- | ---
mock | Execute the deployment procedure targeting a mock blockchain locally
kovan | Kovan testnet
rinkeby | Rinkeby testnet
mainnet | Mainnet

## Script: `deploy.sh`

```bash
[pkey=0x..] [golemMigrationMaster=0x..] ./deploy.sh <target>
```

Results:

- `NGNT=0x..`
- `GNTMigrationAgent=0x..`

## Script: `precheck.sh`

```bash
[golemMigrationAgent=0x..] [NGNT=0x..] ./precheck.sh <target>
```

Results: OK or not OK indication.

## Script: `setMigrationAgent.sh`

```bash
[pkey=0x..] [NGNT=0x..] ./setMigrationAgent.sh <target> [txHash]
```

- If `txHash` is provided, the keyholder confirms the transaction in the Multisig
- Otherwise, a transaction is submitted to the Multisig

## Script: `shutdown.sh`

```bash
[pkey=0x..] [GNTMigrationAgent=0x..] ./shutdown.sh <target> [txHash]
```

---

# Test procedure in exact steps on Rinkeby

Prerequisites:

- A deployed Multisig, named thereafter `golemMigrationMaster`

Command | Actor | Parameters
--- | --- | ---
`./deploy.sh rinkeby` | `3rdPartyDeployer` | `golemMigrationMaster=0x..`
`./precheck.sh rinkeby` | `golemMigrationMaster` | `NGNT=0x..`, `GNTMigrationAgent=0x..`
`./shutdown.sh rinkeby` | one keyholder of `golemMigrationMaster` | `GNTMigrationAgent=0x`
`./shutdown.sh rinkeby txHash` | K-1 keyholders of `golemMigrationMaster` | The shutdown txHash
`./setMigrationAgent.sh rinkeby` | one keyholder of `golemMigrationMaster` | `NGNT=0x..`
`./setMigrationAgent.sh rinkeby` | K keyholders of `golemMigrationMaster` | The setMigrationAgent txHash
`./shutdown.sh rinkeby txHash` | last keyholder of `golemMigrationMaster` | The shutdown txHash

- Core procedure is without first and last step - it can be used for real deployment.
    - First step must be changed to not deploy old `GNT` etc.

# Test procedure in exact steps on Mainnet

Same as on Rinkeby, except:

- Substitute `rinkeby` for `mainnet`
- Provide private keys when necessary

## Artifacts of the test procedures

The artifacts are the links to Etherscan for every step of the test procedure.
