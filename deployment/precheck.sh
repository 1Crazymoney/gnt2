#!/usr/bin/env bash
cd $(dirname $0)
set -e # exit when any command fails

source ./readTarget.sh "$1"

echo "Provide address of the GNTMigrationAgent contract: "
read GNTMigrationAgentAddress

echo "Provide multisig address: "
read multisigAddress

echo "Provide NGNT address: "
read NGNTAddress

export GNTMigrationAgentAddress
export NGNTAddress
export multisigAddress

cd ../gnt2-contracts
yarn ts-node src/deployment/precheck.ts

echo -e "\n\n...::: precheck finished :::..."
exit 0
