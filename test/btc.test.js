const bip39 = require('bip39');
const { createSchnorrAddress, createBtcAddress, createBIP44Address,createMultiSignAddress} = require("../src/btc/address");
const {buildAndSignTx,buildUnSignTxAndSign} = require("../src/btc/sign")

describe('btc unit test', () => {

    test('create btc address mainnet',  () => {
        const mnemonic = "around dumb spend sample oil crane plug embrace outdoor panel rhythm salon";
        const seed = bip39.mnemonicToSeedSync(mnemonic, "")
        const param = {
            seedHex: seed.toString("hex"),
            receiveOrChange: "0",
            addressIndex: "0",
            network: "mainnet",
            method: "p2pkh"
        }
        const account0 = createBIP44Address(param);
        console.log("p2pkh  以1开头 ",account0.address);

        param.method = "p2sh";
        const account1 = createBIP44Address(param);
        console.log("p2sh  以3开头 ",account1.address);

        param.method = "p2wpkh";
        const account2 = createBIP44Address(param);
        console.log("Bech32（SegWit）地址 以 bc1 开头 ",account2.address);

    })

    test('create taproot address mainnet',  () => {
        const mnemonic = "around dumb spend sample oil crane plug embrace outdoor panel rhythm salon";
        const seed = bip39.mnemonicToSeedSync(mnemonic, "")
        const param = {
            seedHex: seed.toString("hex"),
            receiveOrChange: "0",
            addressIndex: "0",
            network: "mainnet",
        }

        const account = createSchnorrAddress(param);
        console.log("taproot  以1开头 ",account.address);
        console.log("taproot  以1开头 privia ",account.privateKey);

    })


    test('create multi sign 3-2 address mainnet',  () => {
        const param = {
            pubkeys: [
                '026477115981fe981a6918a6297d9803c4dc04f328f22041bedff886bbc2962e01',
                '02c96db2302d19b43d4c69368babace7854cc84eb9e061cde51cfa77ca4a22b8b9',
                '03c6103b3b83e4a24a0e33a4df246ef11772f9992663db0c35759a5e2ebf68d8e9',
            ].map(hex => Buffer.from(hex, 'hex')),
            netWork: "mainnet",
            method: "p2pkh", // p2wpkh p2sh
            threshold: 2
        }
        const address = createMultiSignAddress(param)
        console.log(" p2pkh type multi sign address ： ",address);
    })


    test('build btc tx sign',async ()=>{
        const data = {
            inputs: [
                {
                    address: "1H7AcqzvVQunYftUcJMxF9KUrFayEnf83T",
                    txid: "368dc2eba45bcbaf6533ccf119edf2342aeb4d503cdecfb269049c353b02c1c3",
                    amount: 546,
                    vout: 1,
                }, {
                    address: "1H7AcqzvVQunYftUcJMxF9KUrFayEnf83T",
                    txid: "209706b97a9aed047df158bf57cfbdad94a5e9bd9ac5261034448ec4590bab8f",
                    amount: 546,
                    vout: 12,
                }, {
                    address: "1H7AcqzvVQunYftUcJMxF9KUrFayEnf83T",
                    txid: "209706b97a9aed047df158bf57cfbdad94a5e9bd9ac5261034448ec4590bab8f",
                    amount: 546,
                    vout: 13,
                },
            ],
            // 手续费：138 stashi
            outputs: [
                {
                    amount: 1638,
                    address: "1H1oAqmdfTNECrrHFAJ4AhbTUyPcQjrf72",
                },
                // {
                //     amount: 500,
                //     address: "1H1oAqmdfTNECrrHFAJ4AhbTUyPcQjrf79",
                // },
                // {
                //     amount: 500,
                //     address: "1H1oAqmdfTNECrrHFAJ4AhbTUyPcQjrf78",
                // },
            ],
        };
        const rawHex = buildAndSignTx({
            privateKey: "60164bec9512d004af7f71e7ed868c8e9ac2cc6234d8b682037ec80547595f2e",
            signObj: data,
            network: "mainnet",
        });

        console.log("btc tx sign",rawHex);

    })

})