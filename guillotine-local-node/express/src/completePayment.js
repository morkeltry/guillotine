import numberToBN from 'number-to-bn';
import BN from 'bn.js';
import { Keyring } from '@polkadot/keyring';
import { u8aToHex } from '@polkadot/util';

import { payPaymentRequest } from './payments/payPaymentRequest.js';

import { constants } from '../constants.js';

const { priceList, availableModules, rpcProviders } = constants;
const { url }= rpcProviders[0];
const sidecarUrl = 'http://127.0.0.1:8080/';


// (node) constants for guillotine sessions 
const DIFFICULTY = 1000;
const selfPubkey = "0xd254f9eacdeb86b9c317cab95eb742d2fdccc14ce177542ff4c111642aeb862a";
const randomFundedAccount = "5EUZnHD5NcheWyLjpAD1GwvQv7CBELpEsVvCmXyQrhnDkvss";
const AliceAddy = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
const peerPubkey = "0x8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48"


const completePayment = {
  get : async (req, res) => {
    const { sesh, voucher } = req.params;
    
    // arbitary params V to get it running through..
    payPaymentRequest (undefined, sesh)
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

export default completePayment;
