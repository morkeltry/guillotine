
const constants = {
  guillotineNodes: [
    { 
        nodeUrl: '127.0.0.1:7000',
        nodePubkey : "0xd254f9eacdeb86b9c317cab95eb742d2fdccc14ce177542ff4c111642aeb862a"
    }
  ],

  rpcProviders: [
    {
      name: 'onFinality',
      url: 'wss://rpc.ibp.network/polkadot'
    },
    {
      name: 'onFinality',
      url: 'polkadot.api.onfinality.io/public-ws/'
    }
  ]
};

export { constants };