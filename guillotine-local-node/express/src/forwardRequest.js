
import { Keyring } from '@polkadot/keyring';
import { u8aToHex } from '@polkadot/util';

import { constants } from '../constants.js';

const { rpcProviders } = constants;
const { url }= rpcProviders[0];
const sidecarUrl = 'http://127.0.0.1:8080/';

// hardcoded favoured node - in future, nodes will compeete and be intelligently chosen in real time.
const currentNode = constants.guillotineNodes[0];
const { nodePubkey, nodeUrl } = currentNode;

// (node) constants for guillotine sessions 
const selfPubkey = "0xac30a749907f44e636a9fd2f46369f1e5af5b5e65ef08484526b47e78e892445";
const randomFundedAccount = "5EUZnHD5NcheWyLjpAD1GwvQv7CBELpEsVvCmXyQrhnDkvss";
const AliceAddy = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";

// const sesh = session.sesh || (parseInt(selfPubkey.slice(6), 16) ^ parseInt(nodePubkey.slice(6), 16) )% 1024;
const sesh = (parseInt(selfPubkey.slice(6), 16) ^ parseInt(nodePubkey.slice(6), 16) )% 1024;
const blockInEra = sesh

const processRequest = async (req, res) => {
  const { url, query } = req;
  console.log({ url, query });
  const hgfewuhuh = await fetch (`${nodeUrl}/${query}`)
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


  // Negotiate 4-way TLS session keys as per TLS Notary / Deco 
  // TODO: ^^ Future work, I ain't self-rolling no crypto today ;P
  // For today, the workaround will be everything served with this node as host (localhost?)

  
  return { params } ;
}

const forwardRequest = {
  get : async (req, clientResponse) => {
    const { params, url } = req;
    console.log({ params, url });
    processRequest (params)
      .then (async response=>{
        console.log(response.headers, response.type, response.status);
        if ((response.headers._headers.paymentRequest)) {
          const resPart2 = await payPaymentRequest(session, response.headers._headers.paymentRequest);
          responseConcat (response, resPart2);
        }
        clientResponse.type('application/json');
        clientResponse.status(200);
        clientResponse.send(results);
      })
      .catch (err=> {
        if (err.code ==='ECONNREFUSED') {
          // bubble up and send error via http JSON
        }
        console.log('ERROR: ', err)
      }) ;
  }
}

export default forwardRequest;
