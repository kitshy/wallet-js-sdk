const bip39 = require("bip39");
import {createAddress, importSuiAddress, signTransaction, signTransactionV2} from "../src/sui";

describe('Sui unit test', () => {

    /**
     * 注意 @mysten/sui node 版本 18-22.0.0
     */
    test('create sui address' ,()=>{
        // privateKey:suiprivkey1qqrfp9cd3uapfqaexmclwauh44du25xee0ragd22zkjmcyferrj3g7rm35h
        // address:0x97623b0c8f5f7070ede416a961d7f5685ce3c5184b40eecbf8480755768ccd26

        const mnemonic = "kitchen stone pattern world ten drum perfect desk company floor advance unfold";
        const seedHex = bip39.mnemonicToSeedSync(mnemonic,"");
        const account = createAddress(seedHex.toString('hex'),"0");
        console.log("mnemonic create address : ",account);

    })

    test('import sui address' ,()=>{
        const privateKeyHex= "suiprivkey1qqrfp9cd3uapfqaexmclwauh44du25xee0ragd22zkjmcyferrj3g7rm35h";

        const account = importSuiAddress(privateKeyHex);
        console.log("mnemonic create address : ",account);

    })


    test('sign transaction' ,async ()=>{

        const params = {
            from:"0x97623b0c8f5f7070ede416a961d7f5685ce3c5184b40eecbf8480755768ccd26",
            to:"0x034ef2a880a325bba9ba26f3e30f8a7d976a4701737dc4be6eee0e8820d7c0e5",
            amount:0.01,
            decimal:9,
            privateKeyHex:"suiprivkey1qqrfp9cd3uapfqaexmclwauh44du25xee0ragd22zkjmcyferrj3g7rm35h",
            miniToken:"0x2::sui::SUI",
            objectId:"0xbeef010efb1efb7474d72910438e3938c4d2bdcf7ea253c12fb7375cc8ed705a",
            version:"436792871",
            digest:"2LpKFNHmrXfqQ3i4jm9pnhBBTNUZ9YqrAQVyhCuiTJEK"
        };

        const tx = await signTransactionV2(params);

        console.log("tx : ",tx);

    })

})