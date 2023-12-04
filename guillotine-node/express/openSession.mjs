import numberToBN from 'number-to-bn';
import BN from 'bn';

import peerCanPay from '../logic/index.mjs';

import * as constants from '../constants.mjs';

const { priceList, availableModules } = constants;

const newSession = input=> 
  [ {dataType : 'result', params: input} ];


// (node) constants for guillotine sessions 
const DIFFICULTY = 1000;
const selfPubkey = "0xd254f9eacdeb86b9c317cab95eb742d2fdccc14ce177542ff4c111642aeb862a";
const peerPubkey = "0xac30a749907f44e636a9fd2f46369f1e5af5b5e65ef08484526b47e78e892445";

const blockInEra = (parseInt(selfPubkey.slice(6), 16) * parseInt(peerPubkey.slice(6), 16) )% 512;


// // Needed for session:
//   client peer has sufficient balance reserved for estimated likely payment needs
//   this node has some modules which satisfy those requested
//   this node has price list 


const openSession = {
  get : async (req, res) => {
    const { params } = req.params;
    console.log(params, 'params');
    newSession (params)
      .then (results=>{
        res.type('application/json');
        res.status(200);
        res.send(results);
        // res.render(results);
      })
      .catch (e=> {
        console.log('ERROR: ', err)
      }) ;
  }
}

export default openSession;
