#!/usr/bin/env bash
cd $(dirname $0)
set -e # exit when any command fails

source ./readTarget.sh "$1"

[ -z "$pkey" ] && (echo "private key not specified"; exit -1)
cd ../gnt2-contracts
yarn ts-node src/deployment/deployAndConfigure.ts

echo -e "\n\n...::: Deployment finished :::..."
exit 0
