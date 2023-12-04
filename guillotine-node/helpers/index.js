import '@polkadot/api-augment';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/keyring';
import { u8aToHex } from '@polkadot/util';

const SS58ToHex = async (SS58) => {
    await cryptoWaitReady();

    const keyring = new Keyring();
    keyring.addFromAddress(SS58);

     return u8aToHex(keyring.publicKeys[0])

    // // OR

    // const keyring2 = new Keyring();
    // console.log(u8aToHex(keyring.decodeAddress(SS58)))
};

main().finally(() => process.exit());