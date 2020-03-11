#!/usr/bin/env bash
cd $(dirname $0)
set -e # exit when any command fails

source ./readTarget.sh "$1"

[ -z "$pkey" ] && (echo "private key not specified"; exit -1)

echo "Provide address of the GNTMigrationAgent contract: "
read GNTMigrationAgentAddress

echo "Provide multisig address: "
read multisigAddress

echo "Provide multisig txHash to sign (empty to submit one): "
read multisigTxHash

export GNTMigrationAgentAddress
export multisigTxHash
export multisigAddress
cd ../gnt2-contracts
yarn ts-node src/deployment/shutdown.ts

echo -e "\n\n...::: shutdown finished :::..."
exit 0
