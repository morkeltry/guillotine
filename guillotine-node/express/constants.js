const constants = {
  
  difficulty: 5000,

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
  ],

  siteCookies: {
    medium: {
      cookie: 'accessToken=1234abc; userId=1234'
    }
  }

}

constants.priceList.default = constants.priceList[0];
constants.availableModules
  .map(x=>x)
  .forEach(el=> constants.availableModules[el]={ some: 'config-data' });

export { constants };