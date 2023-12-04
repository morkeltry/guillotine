import { Keyring } from '@polkadot/keyring';
import { Uint8Array, toU8a, u8aToHex } from '@polkadot/util';

const packAndSignVoucher = (voucherData, scheme)=> {
    if (scheme !== 'sr25519')
        throw new Error('Expected scheme to be sr25519');
    const {
        oracleBlock,
        difficulty,
        noRedeemBeforeBlock,
        valueIfPaid,
        priceListCommit,
        senderPubKey, 
        recipientPubKey, 
        nonce
    } = voucherData;

    const keyring = new Keyring({ type: 'sr25519' });
    keyring.addFromUri(privKey);
    voucherDataU8a = (oracleBlock<<12 + difficulty<<8 + noRedeemBeforeBlock<<4 + valueIfPaid).toU8a();
    voucherDataU8a.concat(priceListCommit.toU8a()) ;
    voucherDataU8a.concat(senderPubKey.toU8a()) ;
    voucherDataU8a.concat(recipientPubKey.toU8a()) ;
    voucherDataU8a.concat(nonce.toU8a()) ;

    const sig = keyring.sign(voucherDataU8a);
    voucherDataU8a.concat(sig);
    

};

export default packAndSignVoucher;