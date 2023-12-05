
import { Keyring } from '@polkadot/keyring';
import { u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';

import { constants } from '../constants.js';

const { rpcProviders, siteCookies } = constants;
const { url }= rpcProviders[0];
const sidecarUrl = 'http://127.0.0.1:8080/';

// (node) constants for guillotine sessions 
const selfPubkey = "0xac30a749907f44e636a9fd2f46369f1e5af5b5e65ef08484526b47e78e892445";
const randomFundedAccount = "5EUZnHD5NcheWyLjpAD1GwvQv7CBELpEsVvCmXyQrhnDkvss";
const AliceAddy = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";



/// modifyResponse and fetchModifier are where all the cool page and cookie modificaiton happens.
/// It's currently hardcoded, due to running out of time,
/// but eventually would run a scripting language with page and cookie modifcations
/// and the ability to run extra services, for example cahcing, downloading youtube vids to IPFS, etc.

const modifyResponse = response=> {
  return response
}

const processRequest = async (req, res) => {
  const { url, from } = req;
  console.log({ url });
  console.log({ res });
 
  const clientPubkey = decodeAddress(from);
  const hexClientPubkey = u8aToHex(clientPubkey);

  let session = {};
  const sesh = session.sesh || (parseInt(selfPubkey.slice(6), 16) ^ parseInt(hexClientPubkey.slice(6), 16) )% 1024;
  const blockInEra = sesh

  const fetchModifier = url=> {
    if (url.indexOf('medium.com')>-1) {
      return {
        headers: {
          cookie: siteCookies.medium
        }
      }
    }

    if (url.indexOf('twitter.com')>-1) {
      return {
        headers: {
          cookie: siteCookies.twitter
        }
      }
    }

  }

  const fullResponse = await fetch (url, fetchModifier(url))
    .then(modifyResponse)
    .then(response => {
      console.log ({res});
      console.log (response);
      // console.log (response.cookies);
      // console.log (response.cookies());
      // if (response.headersList && response.headersList.cookies)
      //   response.headersList.cookies.forEach (cookie=> {
      //     res.cookie(cookie);
      //   });
      res.status(200);
      response.body.stream.pipe(res);
    });
  



  // Negotiate 4-way TLS session keys as per TLS Notary / Deco 
  // TODO: ^^ Future work, I ain't self-rolling no crypto today ;P
  // For today, the workaround will be everything served with this node as host (localhost?)

  
  return { params } ;
}

const acceptPageRequest = {
  get : async (req, clientResponse) => {
    const { params, url } = req;
    console.log({ params, url });
    processRequest (params, clientResponse)
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

export default acceptPageRequest;
