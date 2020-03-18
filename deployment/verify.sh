#!/usr/bin/env bash
cd $(dirname $0)
set -e # exit when any command fails

source ./readTarget.sh "$1"

echo "Provide address of the GNTMigrationAgent contract: "
read GNTMigrationAgentAddress

echo "Provide NGNT address: "
read NGNTAddress

echo "Provide CorrectedGNT address: "
read CGNTAddress

export GNTMigrationAgentAddress
export NGNTAddress
export CGNTAddress

cd ../gnt2-contracts
yarn ts-node src/deployment/verify.ts

echo -e "\n\n...::: verify finished :::..."
exit 0
