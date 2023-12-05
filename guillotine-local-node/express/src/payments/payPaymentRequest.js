
import { u8aToHex } from '@polkadot/util';
import packAndSignVoucher from '../helpers/packAndSignVoucher.js';

const selfPubkey = "0xac30a749907f44e636a9fd2f46369f1e5af5b5e65ef08484526b47e78e892445";
const selfPrivkey = "0xac30a749907f44e636a9fd2f46369f1e5af5b5e65ef08484526b47e78e892445";
const sidecarUrl = 'http://127.0.0.1:8080/';

const payPaymentRequest = async (session, paymentRequest, cache)=> {
    const { selfPubkey, remotePubKey, sesh, difficulty, priceListCommit  } = session;
    const valueIfPaid = paymentRequest.amountRequested;
    const { _ } = cache;

    const sidecarQuery = `/blocks/head/header`;  
    console.log(`%cREQUEST: ${sidecarUrl}${sidecarQuery}`, 'color: lightgray');
    const currentBlock = fetch (`${sidecarUrl}${sidecarQuery}`)
        .then(response => response.json())
        .then(json => json.number);
    const nonce = blake2AsHex(blake2AsHex(cache.url));
    await currentBlock;

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
        recipientPubKey: remotePubKey, 
        nonce
    };

    const voucher = packAndSignVoucher(voucherData, 'sr25519');
    console.log(u8aToHex(voucher));



    `${session.host}/completePayment/${nonce}/${voucher}`;
}

export { payPaymentRequest };