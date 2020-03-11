#!/usr/bin/env bash
cd $(dirname $0)
set -e # exit when any command fails

source ./readTarget.sh "$1"

[ -z "$pkey" ] && (echo "private key not specified"; exit -1)

echo "Provide address of the old GNT contract: "
read oldGNTAddress

echo "Provide address of the GNTMigrationAgent contract: "
read GNTMigrationAgentAddress

echo "Provide multisig address: "
read multisigAddress

echo "Provide multisig txHash to sign (empty to submit one): "
read multisigTxHash

export oldGNTAddress
export GNTMigrationAgentAddress
export multisigAddress
export multisigTxHash

cd ../gnt2-contracts
yarn ts-node src/deployment/setMigrationAgent.ts

echo -e "\n\n...::: setMigrationAgent finished :::..."
exit 0
