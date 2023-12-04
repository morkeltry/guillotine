# Guillotine


#### [hackmd](https://hackmd.io/jewLA-GkQQGFD5wEQX3vFA?both)



Payments:

All payments are made as probablistic micropayments using 160 byte 'lottery vouchers', containing, in order:
|offset|size|    Rust type  |    content    |
|------|----|---------------| ------------- |
|  0   | 4  |      u32      |  oracleBlock  |
|  4   | 4  |      u32      |  difficulty   |
|  8   | 4  |      u32      | noRedeemBeforeBlock |
| 12   | 4  |      u32      | valueIfPaid   |
| 16   | 16 |      u128     | priceListCommit = Hash(stringification) % 2^128 |
| 32   | 96 | bytes[32] [3] | [senderPubKey, recipientPubKey, nonce = Hash(Hash(url))]  |
| 128  | 32 |   bytes[32]   | Sr25519Sig( ^bytes 0-127^ )  |

A difficulty of 1 implies P(payment) = 1
A difficulty of 5000 means that, on average, only 1 in every 5000 vouchers can be paid out.
