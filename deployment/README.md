# Deployment

This page is about the deployment script and procedures.
There are the following scripts here:

Script | Purpose | Details
--- | --- | ---
`deploy.sh` | Deploy and configure all necessary Smart Contracts, excluding last step of starting the migration. | Executed by **3rd party**
`precheck.sh`  | Make assertions about the deployment to make sure everything is correct. | **Read-only** mode
`setMigrationAgent.sh` | Perform the last step, effectively starting the migration. | Executed by **Golem**
`shutdown.sh` | First step of Emergency Recovery mode. | Executed by **Golem**
`emergency.sh` | Second step of Emergency Recovery mode - read migrated balances and deploy corrected token. | Executed by **3rd party**
`verify.sh` | Verify a corrected token to make sure it was properly configured. | **Read-only** mode

# Usage

## Targets

There are the following targets of the scripts:

Target | Description
--- | ---
mock | Execute the deployment procedure targeting a mock blockchain locally
kovan | Kovan testnet
rinkeby | Rinkeby testnet

## Script: `deploy.sh`

```bash
[pkey=0x..] ./deploy.sh <target>

... provide contract addresses when prompted
```

Results:

- `NGNT=0x..`
- `GNTMigrationAgent=0x..`

## Script: `precheck.sh`

```bash
./precheck.sh <target>

... provide contract addresses when prompted
```

Results: OK or not OK indication.

## Script: `setMigrationAgent.sh`

```bash
[pkey=0x..] ./setMigrationAgent.sh <target> [txHash]

... provide contract addresses when prompted
```

- If `txHash` is provided, the keyholder confirms the transaction in the Multisig
- Otherwise, a transaction is submitted to the Multisig

## Script: `shutdown.sh`

```bash
[pkey=0x..] ./shutdown.sh <target> [txHash]

... provide contract addresses when prompted
```

## Script: `emergency.sh`

- Deploys a Corrected NGNT based on the state of Migration Agent

```bash
[pkey=0x..] ./emergency.sh <target>

... provide contract addresses when prompted
```

Results:

- `CGNT=0x..`

## Script: `verify.sh`

Checks:

- If the total supply of NGNT matches total supply of Corrected NGNT
- If the balances of Corrected NGNT match the records of the Migration Agent

```bash
./verify.sh <target>

... provide contract addresses when prompted
```

Results: OK or not OK indication.

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

## Artifacts of the test procedures

The artifacts are the links to Etherscan for every step of the test procedure.
