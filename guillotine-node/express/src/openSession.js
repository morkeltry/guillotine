import numberToBN from 'number-to-bn';
import BN from 'bn';
import { Keyring } from '@polkadot/keyring';
import { u8aToHex } from '@polkadot/util';

import peerCanPay from '../../logic/index.js';

import { constants } from '../../constants.js';

const { priceList, availableModules, rpcProviders } = constants;
const { url }= rpcProviders[0];
const sidecarUrl = 'http://127.0.0.1:8080/';


// (node) constants for guillotine sessions 
const DIFFICULTY = 1000;
const selfPubkey = "0xd254f9eacdeb86b9c317cab95eb742d2fdccc14ce177542ff4c111642aeb862a";
const randomFundedAccount = "5EUZnHD5NcheWyLjpAD1GwvQv7CBELpEsVvCmXyQrhnDkvss";
const AliceAddy = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
const peerPubkey = "0xac30a749907f44e636a9fd2f46369f1e5af5b5e65ef08484526b47e78e892445";

const blockInEra = (parseInt(selfPubkey.slice(6), 16) * parseInt(peerPubkey.slice(6), 16) )% 1024;


// // Needed for session:
//   client peer has sufficient balance reserved for estimated likely payment needs
//   this node has some modules which satisfy those requested
//   this node has price list 

// newSession is called once a client has received this node's info and chosen to (potentially) use it.
// This node will then
const newSession = async (params={}) => {
  // const peerPubkey=params.pubKey;


  // Firstly, decide if we want to serve this client
  //////////////////////////////////////////////////////

  const requestedAvailableModules=
  params.modules? ()=> {
    // if client has specified no modules, we can serve them 
    // but if they have specified one of them, we should be able to serve at least one of those
    requestedAvailableModules = params.modules
      .replace(' ','')
      .split('.')
      .filter(requested => availableModules.contains(requested));
    if (!requestedAvailableModules.length) {
      throw new Error({
        code: 'ECONNREFUSED',
        message: 'Node serves none of the requested modules'
      });
    }
    console.log ('Requested modules that this node can serve: ', requestedAvailableModules);
    return requestedAvailableModules;
    }
  : [];

  // Lookup your potential suitor's financial stability.
  //////////////////////////////////////////////////////

  const keyring = new Keyring();
  const peerAccountId = 
    // || (u8aToHex(keyring.decodeAddress(selfPubkey))) ||
    // randomFundedAccount;
    AliceAddy;

  // NB: This is a placeholder - the correct URL will be a custom RPC method showing balance reserved for paying fees.
  const sidecarQuery = `accounts/${peerAccountId}/balance-info`;
  
  console.log(`%cREQUEST: ${sidecarUrl}${sidecarQuery}`, 'color: lightgray');
  const peerBalance = await fetch (`${sidecarUrl}${sidecarQuery}`)
    .then(response => response.json())
    .then(json => {
      const {free, reserved} = json;

      // // Example to pull out locked balances - change the reasons string ;)
      // const {locks} = json;
      // locks
      //   .filter(lock => lock.reasons.includes("All"))
      //   .forEach(mutEl => { mutEl =m utEl.amount });
      return parseInt(free) * 10**-10;
    });

  // NB: This is a placeholder - the correct check is whether balance reserved for fees is sufficient for some likely amount of work.
  if (peerBalance >0 ) {
    console.log (`Peer balance is ${peerBalance} for ${peerAccountId}. Seems fine, let's serve them`);
  } else {
    throw new Error({
      code: 'ECONNREFUSED',
      message: 'Peer too poor :P'
    });
  }

  // 

  // Negotiate 4-way TLS session keys as per TLS Notary / Deco 
  // TODO: ^^ Future work, I ain't self-rolling no crypto today ;P
  // For today, the workaround will be everything served with this node as host (localhost?)

  


  return { peerBalance, params } ;
}




const openSession = {
  get : async (req, res) => {
    const { params } = req;
    console.log(params, 'params');
    newSession (params)
      .then (results=>{
        res.type('application/json');
        res.status(200);
        res.send(results);
      })
      .catch (err=> {
        if (err.code ==='ECONNREFUSED') {
          // bubble up and send error via http JSON
        }
        console.log('ERROR: ', err)
      }) ;
  }
}

export default openSession;
