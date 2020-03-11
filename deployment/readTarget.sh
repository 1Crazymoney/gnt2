[ -z "$1" ] && (echo "target not specified"; exit -1)

if [ "$1" == "mock" ]; then
  echo "Deploying on $1"
  export pkey="0x"
  export infuraAddress=""
elif [ "$1" == "kovan" ]; then
  export infuraAddress="https://kovan.infura.io/v3/083b9f51fc0944a98426b44f9be6b765"
elif [ "$1" == "rinkeby" ]; then
  export infuraAddress="https://rinkeby.infura.io/v3/e9c991e7745b46908ce2b091a4cf643a"
else
  echo "Target '$1' not supported"
  exit -1
fi
