#BIN=./target/debug/guillotine-chain
BIN=./target/release/guillotine-chain

# ids=(alice bob charlie dave eve ferdie)
# max=6
ids=(alice bob)
max=2

for (( i=0; i < $max; i++ ))
do
	$BIN purge-chain --base-path /tmp/${ids[i]} --chain local -y

	$BIN \
	--base-path /tmp/${ids[i]} \
	--chain local \
	--${ids[i]} \
	--port $((30333 + i)) \
	--unsafe-rpc-external \
	--rpc-port $((9945 + i)) \
	--rpc-methods=Unsafe \
	--rpc-cors=all \
	&
done

# sigkill on exit becasue tokio can go berserk occasionally
trap "trap - SIGTERM && kill -9 -- -$$" SIGINT SIGTERM EXIT

while true; do read; done
