import { Keyring } from '@polkadot/keyring';
import { BN } from 'bn.js';
import { numberToU8a, bnToU8a, u8aToHex, hexToU8a } from '@polkadot/util';
import { blake2AsHex } from '@polkadot/util-crypto';

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

    console.log({ voucherData });

    const keyring = new Keyring({ type: 'sr25519' });
    keyring.addFromUri('0x3cffa91e3c1e6a1e900d6f9e44bc35b5c99a3a427f267c39cf91a57b359e1e66' || privKey);
    
    let voucherDataU8a = new Uint8Array(192);
    voucherDataU8a.set(hexToU8a(
        [oracleBlock, difficulty, noRedeemBeforeBlock, valueIfPaid]
            .map(num=> num.toString(16)
                .padStart(8, '0'))
            .join('')
    ));
    voucherDataU8a.set(hexToU8a(priceListCommit), 16) 
    voucherDataU8a.set(hexToU8a(senderPubKey), 32) 
    voucherDataU8a.set(hexToU8a(recipientPubKey), 64) 
    voucherDataU8a.set(hexToU8a(nonce), 96) ;
    console.log(voucherDataU8a);

    const sig = keyring.sign(voucherDataU8a);
    voucherDataU8a = voucherDataU8a.concat(sig);

    return voucherDataU8a;
};

export default packAndSignVoucher;