import {NonceAccount,Transaction} from "@solana/web3.js";
const bs58 = require('bs58');
const bip39 = require('bip39');
import {createAddress, importAddress, verifyAddressEd25519, createNormalWallet} from "../src/solana/address";
import {prepareNonceAccount, signTransaction} from "../src/solana/sign"

describe('solana unit test', () => {

    // dev
    // kitchen stone pattern world ten drum perfect desk company floor advance unfold
    // {"privateKey":"5qPDfLYHNTtscvj6su248VKgMRXNDzMQVjHBedtMpsoL4nCGLiR5vKNLAtc4BfSGzi4JEsCXTmoNSUcKiTqpVU4M",
    // "address":"2XtprBZY44TJZ8Fjdyc2yMrab5ruxNJFdfHA3rm3eiww",
    // "privateKeyHex":"f1caae2960318a9c03fcdfd81d7d4ed5e427db9143c01f55e58465b5bbfbe73c16c5b5ba4173f04b0f19d1589b3a3acf94495ea1d94efa9da7e465c950d208de"}


    //dev2
    // {"privateKey":"4UMPqjhGygCWu4txmAZYFj4pCv86msGJrWKtTd9rEmEXWpMEArAFRCPbKWgFtHpRbns1ZGUSFdgM75kD9MrB5Mkv",
    // "address":"kY3CZheFB1tYnLn3foa4QGreZvnkrXX9qQwxaXMBMLv",
    // "privateKeyHex":"ada3536abbf65d1ba537b5fbd8d269c38674b18b3847a8b33c6f8bbd8508dd830b2711c958e6f077314207e1881cf9e381ea24d92ab825f33abc8b9068467aa3"}


    //seek
    // face defy torch paper dial goddess floor wage nephew floor million belt
    // "privateKey":"2iKjbea4oV3Mb9it4vFMv31RmbJXbQk1ZUK7P3Ui1ffCatqnKgxkcQgVhCQm7Lfo4hyEP7GFCYYv7z1BDw5HnSWM"
    // "address":"4wHd9tf4x4FkQ3JtgsMKyiEofEHSaZH5rYzfFKLvtESD"
    // privateKeyHex:55a70321542da0b6123f37180e61993d5769f0a5d727f9c817151c1270c290963a7b3874ba467be6b81ea361e3d7453af8b81c88aedd24b5031fdda0bc71ad32


    test('create solana address',  () => {

        const mnemonic = "kitchen stone pattern world ten drum perfect desk company floor advance unfold";
        const seedHex = bip39.mnemonicToSeedSync(mnemonic);

        const  account = createAddress(seedHex.toString('hex'),"0");

        console.log("mnemonic create address : ",account);

    })

    test('create normal Wallet ', ()=>{
        const account = createNormalWallet();
        console.log("create normal Wallet", account);
    })

    // {"privateKey":"44qLT7FDzxet7dWDrnkdwRG2oo7uXgFhVCv4fHgMpCLydynxbMnuUC2keh1Byz9bsiGAPj6tXxP8oyu6PdLzY7DS",
    //   "address":"FTHQji5mFYhBZwfkTaySY7ZN7yApHWwfWE9oqq76rpf2"}

    test('import address',  () => {
        const privateKey = "5qPDfLYHNTtscvj6su248VKgMRXNDzMQVjHBedtMpsoL4nCGLiR5vKNLAtc4BfSGzi4JEsCXTmoNSUcKiTqpVU4M";
        const account = importAddress(privateKey);
        console.log("import address : ",account);
    })

    test('verify address ed25519',  () => {
        const address = "4wHd9tf4x4FkQ3JtgsMKyiEofEHSaZH5rYzfFKLvtESD";
        const flg = verifyAddressEd25519(address);
        console.log("flg : ",flg);

    })

    test('prepare Nonce Account',async () =>{
       const params = {
           authorAddress:"4wHd9tf4x4FkQ3JtgsMKyiEofEHSaZH5rYzfFKLvtESD",
           from:"2XtprBZY44TJZ8Fjdyc2yMrab5ruxNJFdfHA3rm3eiww",
           recentBlockhash:"62prFhoGQtukmkmgGMRLnYc9BAfrSp2WHXRdnbC3Z3CL",
           minBalanceForRentExemption:1238880,
           privs:[
               {
                   address: "4wHd9tf4x4FkQ3JtgsMKyiEofEHSaZH5rYzfFKLvtESD",
                   key: "2iKjbea4oV3Mb9it4vFMv31RmbJXbQk1ZUK7P3Ui1ffCatqnKgxkcQgVhCQm7Lfo4hyEP7GFCYYv7z1BDw5HnSWM"
               },
               {
                   address: "2XtprBZY44TJZ8Fjdyc2yMrab5ruxNJFdfHA3rm3eiww",
                   key: "5qPDfLYHNTtscvj6su248VKgMRXNDzMQVjHBedtMpsoL4nCGLiR5vKNLAtc4BfSGzi4JEsCXTmoNSUcKiTqpVU4M"
               }
           ]
       };
       const tx = await prepareNonceAccount(params);
       console.log("prepare Nonce Account tx : ",tx);
    })

    test('get account nonce after prepare Nonce Account finish',  () => {
        // pass
        const base58Data = "";
        const nonceInfo =NonceAccount.fromAccountData(Buffer.from(base58Data));
        console.log("nonce info: ",nonceInfo);
    })

    test('sign transaction',  async () => {

        const params = {
            from:"2XtprBZY44TJZ8Fjdyc2yMrab5ruxNJFdfHA3rm3eiww",
            amount:1000,
            // nonceAccount: "EvPZ8xDKWcTbAuY4v3drWhMGCWw2XmJm4ae1K8T9pwnw",
            to:"3YtQjbiRany4hpsxS3rP2urWT7Z1TyCbShmgdqVQ9oB6",
            nonce:"9JvAmmaSNpt3cbxcjYV6c42cVR1sXsSbMKfzvuQZJVnm",
            // sol 9 //bitnut 9
            decimal:9,
            privateKey:"5qPDfLYHNTtscvj6su248VKgMRXNDzMQVjHBedtMpsoL4nCGLiR5vKNLAtc4BfSGzi4JEsCXTmoNSUcKiTqpVU4M",
            mintAddress:"3LbqbWJQX2GUMdxxEoKd79gwFmzQ4uY2V9PUwBC2XYgF", // token合约地址
            fromMintTokenAccount:"", // 主账户对应的token账户地址
            toMintTokenAccount:"",  // 主账户对应的token账户地址
        }

        const tx = await signTransaction(params);

        console.log("tx : ",tx);
    })

})