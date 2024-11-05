const bip39 = require('bip39');
const ethers = require('ethers');
import {createAddress,publicKeyToAddress,importEthAddress,ethSign} from "../src/eth/index";

describe('eth unit test', () => {

    test('mnemonic create address',  () => {

        const mnemonic = "champion junior low analyst plug jump entire barrel slight swim hidden remove";
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const account = createAddress(seed.toString("hex"), "0");
        console.log("mnemonic create address index 0 : ",account);
        const account1 = createAddress(seed.toString("hex"), "1");
        console.log("mnemonic create address index 1 : ",account1);
    })

    test('import private address',  () => {

        // 0xdc2d6117326e9953bc997045df045ea87ebb1c974b49580fafa92fe9a7336ef9
        const privateKey = "dc2d6117326e9953bc997045df045ea87ebb1c974b49580fafa92fe9a7336ef9";
        const account = importEthAddress(privateKey);
        console.log("import private address : ",account);
    })

    test('public key to address',  () => {
        const publickey = "0x0292f95b732a3085a0bd08c6bbadb8a04a32da974d4094d2fd9ee3ba2db175f8b5";
        const account = publicKeyToAddress(publickey);
        console.log("public Key To Address : ",account);
    })

    test('sign eth leagcy gasPrice ',  async () => {

        const rawHex = ethSign({
            "privateKey" : "8191d4626b096f3b7dcf90d71931011de7750f7bbf1684792f3d91d93c5926e3",
            "nonce": 1,
            "from":"0xDDA22000e1bCC0c70C8b1947CE7074df1DC5B80B",
            "to":"0xf196274C3DE2A5cA8bd123D144ACbB81B66a6E91",
            "gasPrice":60520000000,
            "gasLimit":21000,
            "amount":"0.0001",
            "decimal":18,
            "chainId":1,
        });

        console.log("signGasPrice : ",rawHex);

    })

    test('sign eth eip1559',  async () => {

        const rawHex = ethSign({
            "privateKey" : "57feada39917d84f1acad3cbe878b4289c6dce3c242c8e64968944818ef77408",
            "nonce": 7,
            "from":"0x923b516430619a70f3b29E9643dBFb4e4Ce5dC7D",
            "to":"0xF60Eb3263C138525b6a324aFC9b93c610F60E833",
            "gasLimit":21000,
            "amount":"0.0001",
            "decimal":18,
            "maxFeePerGas":"20520000000",
            "maxPriorityFeePerGas":"2600000000",
            "chainId":1,
        });

        console.log("sign Eip1559 : ",rawHex);
    })

    test('sign usdt eip1559',  async () => {
        const rawHex = ethSign({
            "privateKey" : "57feada39917d84f1acad3cbe878b4289c6dce3c242c8e64968944818ef77408",
            "nonce": 7,
            "from":"0x923b516430619a70f3b29E9643dBFb4e4Ce5dC7D",
            "to":"0xF60Eb3263C138525b6a324aFC9b93c610F60E833",
            "gasLimit":21000,
            "amount":"1",
            "decimal":6,
            "maxFeePerGas":"20520000000",
            "maxPriorityFeePerGas":"2600000000",
            "tokenAddress":"0xdAC17F958D2ee523a2206206994597C13D831ec7",
            "chainId":1,
        });
        console.log("sign usdt eip1559 : ",rawHex);
    })

})