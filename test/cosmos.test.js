import {publicKey} from "@solana/web3.js/src/layout";

const bip39 = require('bip39');
import {
    createAtomAddress,
    importAtomAddress,
    publicKeyToAddress,
    signAtomTransaction, signV2Transaction,
    verifyAtomAddress
} from "../src/cosmos";

describe('cosmos unit test', () => {

    /**
     * "champion junior glimpse analyst plug jump entire barrel slight swim hidden remove"
     * mnemonic create Atom address index 0 :  {
     *       privateKey: 'b7837cb25cec44b068f1e189bdc94203a814141404d3441bef3c3c8dc016dfe7',
     *       publicKey: '036e8f01c6e68d9c5c66ab172ff0898234c7a889997802437bce6e7d1f89161fc1',
     *       address: 'cosmos1z79jxnsw64c20upyfu8rfe89pdsel48kfmzjgu'
     *     }
     */
    test('create Atom Address', () => {
        const mnemonic = "kitchen stone pattern world ten drum perfect desk company floor advance unfold";
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const account = createAtomAddress(seed.toString('hex'),"1","mainnet")
        console.log("mnemonic create Atom address index 0 : ",account);
    })

    test('import Atom privateKey', async () => {

        const privateKey = "b7837cb25cec44b068f1e189bdc94203a814141404d3441bef3c3c8dc016dfe7";
        const account = await importAtomAddress({privateKey});
        console.log("import Atom Address : ",account);

    })


    test('public key to address',  () => {
        const publicKey = "036e8f01c6e68d9c5c66ab172ff0898234c7a889997802437bce6e7d1f89161fc1";
        const account = publicKeyToAddress(publicKey);
        console.log("import Atom Address : ",account);
    })

    test('verify atom address',  () => {
        const address ="cosmos1z79jxnsw64c20upyfu8rfe89pdsel48kfmzjgu";
        const account = verifyAtomAddress(address);
        console.log("verify atom address : ",account);
    })

    test('atom transaction signature',  async () => {

        const privateKey = "b7837cb25cec44b068f1e189bdc94203a814141404d3441bef3c3c8dc016dfe7";
        const params = {
            privateKey: privateKey,
            chainId:"cosmoshub-4",
            from:"cosmos1z79jxnsw64c20upyfu8rfe89pdsel48kfmzjgu",
            to:"cosmos1lqhpkswskqvgd4tkuwmwqum4qgpjg2g8cztu5l",
            memo:"777",
            amount:"0.1",
            fee:"0.01",
            gas:"117674",
            accountNumber:2782398,
            sequence:21,
            decimal:6
        };

        const txSign = await signAtomTransaction(params);
        console.log("atom sign txSign: ",txSign);

    })


    test('atom transaction signature v2',  async () => {

        const privateKey = "b7837cb25cec44b068f1e189bdc94203a814141404d3441bef3c3c8dc016dfe7";
        const params = {
            privateKey: privateKey,
            chainId:"cosmoshub-4",
            from:"cosmos1z79jxnsw64c20upyfu8rfe89pdsel48kfmzjgu",
            to:"cosmos1lqhpkswskqvgd4tkuwmwqum4qgpjg2g8cztu5l",
            memo:"777",
            amount_in:0.1,
            fee:1,
            gas:1,
            accountNumber:2782398,
            sequence:21,
            decimal:6
        };

        const txSign = await signV2Transaction(params);
        console.log("atom sign txSign: ",txSign);

    })


})