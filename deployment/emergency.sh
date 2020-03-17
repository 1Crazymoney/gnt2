#!/usr/bin/env bash
cd $(dirname $0)
set -e # exit when any command fails

source ./readTarget.sh "$1"

echo "Provide address of the GNTMigrationAgent contract: "
read GNTMigrationAgentAddress

export GNTMigrationAgentAddress

cd ../gnt2-contracts
yarn ts-node src/deployment/emergency.ts

echo -e "\n\n...::: emergency finished :::..."
exit 0
