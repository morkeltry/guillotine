# Guillotine


#### [hackmd](https://hackmd.io/jewLA-GkQQGFD5wEQX3vFA?both)

#### __Request flow:__

After sessions are initiated, a local client node chooses between sessions, or initiates (a) new session/s for the request.

The request is sent to the chosen guillotine node, with any script or service choice information.

The guillotine node receives the request and checks that the request is one which it can perform and wishes to accept.

The web request is made and immediately modified uopn receipt.

A mid-response request for payment is calculated

If the result is over 14Kb, it is split in two and the first half sent to the client (or else sent whole), along with the mid-response request for payment.

The client node checks this, adds the value into a voucher, signs it and sends it.

The guillotine node serves the rest of the request result.

Loginwall circumvented. Services provided. The people laugh and cry with joy.





#### Payments:

All payments are made as probablistic micropayments using 192 byte 'lottery vouchers', containing, in order:
|offset|size|    Rust type  |    content    |
|------|----|---------------| ------------- |
|  0   | 4  |      u32      |  oracleBlock  |
|  4   | 4  |      u32      |  difficulty   |
|  8   | 4  |      u32      | noRedeemBeforeBlock |
| 12   | 4  |      u32      | valueIfPaid   |
| 16   | 16 |      u128     | priceListCommit = Hash(stringification) % 2^128 |
| 32   | 96 | bytes[32] [3] | [senderPubKey, recipientPubKey, nonce = Hash(Hash(url))]  |
| 128  | 64 |   bytes[64]   | Sr25519Sig( ^bytes 0-127^ )  |

A difficulty of 1 implies P(payment) = 1
A difficulty of 5000 means that, on average, only 1 in every 5000 vouchers can be paid out.


The values `priceListCommit`, `difficulty` and `sesh = XOR(senderPubKey, recipientPubKey) % 2^10` are stored by the two nodes in a session for the duration of the session.

`nonce` is deterministically derived from the url of a given request

`oracleBlock` and `noRedeemBeforeBlock` are generated by the requesting client, based on the block height at the time of the request. It is anticipated that mismatches in block height between the nodes will be unimportant, except where they cause a mismatch of eras (see later). These will be sent by the client to the guillotine node at the time of request, and agreed by the node in its mid-response request for payment.

`valueIfPaid` is set by the guillotine node according to the session's priceList and will be communicated to the client node in the mid-response request for payment.

`oracleBlock % 2^10` gives the block number _within_ that 1024-block era, and `XOR(sesh, nonce%2^10, oracleBlock%2^10) = 0`

`Math.floor(oracleBlock/ 2^10)` gives the era in which the oracle block falls, which will be in the next era.

`noRedeemBeforeBlock`is two eras on from the current block, giving hobby users approximately 1 hour 40 minutes to arrange to claim first in case of competing claims on limited funds.


