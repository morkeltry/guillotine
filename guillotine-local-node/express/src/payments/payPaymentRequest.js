
import { u8aToHex } from '@polkadot/util';
import { blake2AsHex } from '@polkadot/util-crypto';

import packAndSignVoucher from '../helpers/packAndSignVoucher.js';

// const selfPubkey = "0xac30a749907f44e636a9fd2f46369f1e5af5b5e65ef08484526b47e78e892445";
const selfPrivkey = "0xe5be9a5092b81bca64be81d212e7f2f9eba183bb7a90954f7b76361f6edb5c0a";

const selfPubkey = "0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d";
const remotePubkey = "0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d";
const sesh = (selfPubkey.slice(selfPubkey.length-3)) ^ (remotePubkey.slice(remotePubkey.length-3)) % 1024

const sidecarUrl = 'http://127.0.0.1:8080/';

// const payPaymentRequest = async (session, paymentRequest, cache)=> {
const payPaymentRequest = async (session = {
        selfPubkey:selfPubkey, remotePubkey:remotePubkey, 
        sesh, difficulty:5000, priceListCommit:blake2AsHex(JSON.stringify("[{abc:123}, {def:678}]")) 
    } , paymentRequest, cache)=> {
    const { selfPubkey, remotePubKey, sesh, difficulty, priceListCommit  } = session;
    const valueIfPaid = paymentRequest.amountRequested  || 12345;
    const { url } = cache || {url:'http:/blah.bla'};

    console.log ({ session })

    const sidecarQuery = `blocks/head/header`;  
    console.log(`%cREQUEST: ${sidecarUrl}${sidecarQuery}`, 'color: lightgray');
    let currentBlock = fetch (`${sidecarUrl}${sidecarQuery}`)
        .then(response => response.json())
        .then(json => json.number);
    const nonce = blake2AsHex(blake2AsHex(url));
    currentBlock = await currentBlock;
    console.log ({ currentBlock });

    const era = Math.floor(currentBlock/1024);
    const blockOfEra = currentBlock % 1024;
    const oracleBlock = era*1024 + (sesh ^ (parseInt(nonce, 16) % 1024));
    const noRedeemBeforeBlock = currentBlock+2048;

    const voucherData = {
        oracleBlock,
        difficulty,
        noRedeemBeforeBlock,
        valueIfPaid,
        priceListCommit,
        senderPubKey: selfPubkey, 
        recipientPubKey: remotePubkey, 
        nonce
    };

    const voucher = packAndSignVoucher(voucherData, 'sr25519');
    console.log(u8aToHex(voucher));



    `${session.host}/completePayment/${nonce}/${voucher}`;
}

export { payPaymentRequest };