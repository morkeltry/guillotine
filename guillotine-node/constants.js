const constants = {
  
  priceList: [
    { 
      service: 'default',
      unit: 'byte',
      price: 1
    }
  ],

  availableModules: [
    'youtube-dl'
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
}

priceList.default = priceList[0];
availableModules
  .map(x=>x)
  .forEach(el=> availableModules[el]={ some: 'config-data' });

export { constants };