const bip39 = require('bip39');
import {createAddress, importAddress, verifyAddress} from "../src/ton/address";
import {signTransaction} from "../src/ton/sign"


describe('ton unit test', () => {


    // {"friendlyAddress":"UQDQBB9M2SwNq1E2iLVY-Nqe_zTtxgstGbv3uPvQjO7D8SVg",
    //     "nonFriendlyAddress":"0:d0041f4cd92c0dab513688b558f8da9eff34edc60b2d19bbf7b8fbd08ceec3f1",
    //     "publicKey":"c2de738bd2140f8e2bba8c7ae20ccc5336944aa008eed87a5978d12a2ae9b175",
    //     "privateKey32":"e328a8fb0db09a517cacef33210e104d0121255cbcaa20e6df43ad79048b7e0a",
    //     "privateKey64":"e328a8fb0db09a517cacef33210e104d0121255cbcaa20e6df43ad79048b7e0ac2de738bd2140f8e2bba8c7ae20ccc5336944aa008eed87a5978d12a2ae9b175"}

    test('create ton address', async () => {

        const mnemonic = "kitchen stone pattern world ten drum perfect desk company floor advance unfold";

        const seedHex = bip39.mnemonicToSeedSync(mnemonic,"");

        const account = await createAddress(seedHex,"0");
        console.log("mnemonic create address : ",account);

    })

    test('import ton address', async () => {
        const privateKey = "b0e4eb37bc5929491899d2a50f52f0a4613d3a48e56245267fdecff392ead89b7e4fdf79bf78566b85b73787e5739ab4306350d7ad1adc50be9c57fe2102bfcc";
        const account = await importAddress(privateKey);
        console.log("import address : ",account);
    })


    test('verify address',async () => {

        const address = "EQDMeSwMyM1buU1EDZeDzAcH6HgACzUHwPC4-aiJ4Eq0k6aF";
        const account = await verifyAddress(address);
        console.log("verify address : ",account);

    })

    test('test ton transaction', async () => {

        const params = {
            from:"UQDQBB9M2SwNq1E2iLVY-Nqe_zTtxgstGbv3uPvQjO7D8SVg",
            to:"UQCUrBQKqvCuj7_bWr7xnlQR7jCWY5qIoMJVHKY7LLFagBG6",
            amount:10,
            decimal:9,
            seqno:12,
            commit:"1111",
            privateKeyHex:"e328a8fb0db09a517cacef33210e104d0121255cbcaa20e6df43ad79048b7e0a",
            // 主钱包地址的对应token的JettonWalletAddress
            fromJettonWalletAddress:"0:555c4e6f31a79a8819a3452eabd9e60dd36ffb3d6d451a7b382d2fccbb09d99d",
        };
        const tx = await signTransaction(params);
        console.log("tx : ",tx);

    })

})