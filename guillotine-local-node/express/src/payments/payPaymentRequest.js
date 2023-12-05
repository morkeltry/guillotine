
import { u8aToHex } from '@polkadot/util';
import { blake2AsHex } from '@polkadot/util-crypto';

import packAndSignVoucher from '../helpers/packAndSignVoucher.js';

// const selfPubkey = "0xac30a749907f44e636a9fd2f46369f1e5af5b5e65ef08484526b47e78e892445";
const selfPrivkey = "0xac30a749907f44e636a9fd2f46369f1e5af5b5e65ef08484526b47e78e892445";

const selfPubkey = "0xac30a749907f44e636a9fd2f46369f1e5af5b5e65ef08484526b47e78e892445";
const remotePubkey = "0xd254f9eacdeb86b9c317cab95eb742d2fdccc14ce177542ff4c111642aeb862a";
const sesh = (selfPubkey.slice(selfPubkey.length-3)) ^ (remotePubkey.slice(remotePubkey.length-3)) % 1024

const sidecarUrl = 'http://127.0.0.1:8080/';

// const payPaymentRequest = async (session, paymentRequest, cache)=> {
const payPaymentRequest = async (session = {selfPubkey:selfPubkey, remotePubkey:remotePubkey, sesh, difficulty:5000, priceListCommit:"0x88888888"} , paymentRequest, cache)=> {
    const { selfPubkey, remotePubKey, sesh, difficulty, priceListCommit  } = session;
    const valueIfPaid = paymentRequest.amountRequested   ||12345;
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