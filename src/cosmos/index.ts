import {BIP32Factory} from "bip32";
import * as ecc from 'tiny-secp256k1';
const bip32 = BIP32Factory(ecc);
const {fromHex,toBase64} = require('@cosmjs/encoding');
const {Secp256k1Wallet,pubkeyToAddress:atomPubkeyToAddress} = require('@cosmjs/amino');
const BigNumber = require('bignumber.js');
const {createSendMessage, createTxBody, createTxRawBytes }  = require("./lib/proto-tx-service")
const { getSignDoc, getAuthInfo, getDirectSignature } = require("./lib/post-ibc-signer");
const { isValidAddress, verifyChecksum } = require("./lib/validator");


// 将公钥-->base64 编码--> 根据编码判断是 secp256k1 还是 ed25519 的公钥---> sha256---->ripemd160---> bech32 编码
export function createAtomAddress(seedHex:string,addressIndex:string,network:string){
    const node = bip32.fromSeed(Buffer.from(seedHex, 'hex'));
    // m/44/chain/account/change/index。bip44协议推导地址
    const child = node.derivePath("m/44'/118'/0'/0/"+addressIndex+'');
    // @ts-ignore
    const publicKey = Buffer.from(child.publicKey,'hex');
    const prefix = 'cosmos';
    const pubkey = {
        type:'tendermint/PubKeySecp256k1',
        value: toBase64(fromHex(publicKey.toString('hex')))
    }
    const address = atomPubkeyToAddress(pubkey,prefix);

    return {
        // @ts-ignore
        privateKey: Buffer.from(child.privateKey).toString('hex'),
        publicKey: Buffer.from(child.publicKey).toString('hex'),
        address
    };
}

/**
 * import atom address by private key
 * @param params
 */
export async function importAtomAddress(params: any) {
    const {privateKey} = params;
    const account = await Secp256k1Wallet.fromKey(new Uint8Array(Buffer.from(privateKey, 'hex')),'cosmos');
    const accountList = await account.getAccounts();
    const address = accountList[0].address;
    return {
        privateKey: privateKey,
        address: address,
    }
}


export function publicKeyToAddress(publicKey:string){
    const prefix = 'cosmos';
    const pubkey = {
        type:'tendermint/PubKeySecp256k1',
        // @ts-ignore
        value: toBase64(fromHex(publicKey)),
    }
    const address = atomPubkeyToAddress(pubkey,prefix);
    return {
        address
    }
}


export function verifyAtomAddress(address:string){
    const regex = new RegExp('^cosmos[a-zA-Z0-9]{39}$');
    return regex.test(address);
}

/**
 * 老版本，目前开发文档未找到restapi支持，第三方可能支持格式
 * https://docs.cosmos.network/api#tag/Service/operation/GetTxsEvent
 * @param params
 */
export async function signAtomTransaction(params: any) {
    const {privateKey, chainId, from, to, memo, amount, fee, gas, accountNumber, sequence, decimal} = params;

    const calcAmount = BigNumber(amount).times(Math.pow(10, decimal)).toString();
    const calcFee = BigNumber(fee).times(Math.pow(10, decimal)).toString();

    if (calcAmount.toString().indexOf(".") !== -1) {
        throw new Error('input amount value invalid.');
    }
    if (calcFee.toString().indexOf(".") !== -1) {
        throw new Error('input fee value invalid.');
    }

    const signDoc = {
        msgs:[
            {
                type: 'cosmos-sdk/MsgSend',
                value: {
                    from_address: from,
                    to_address: to,
                    amount: [
                        {
                            amount: calcAmount,
                            denom: 'uatom',
                        }
                    ]
                }
            }
        ],
        fee:{
            amount: [
                {
                    amount: calcFee,
                    denom: 'uatom',
                }
            ],
            gas: String(gas)
        },
        chain_id:chainId,
        memo:memo || '',
        account_number:accountNumber.toString(),
        sequence:sequence.toString(),
    }

    const siger = await Secp256k1Wallet.fromKey(new Uint8Array(Buffer.from(privateKey, 'hex')),'cosmos');
    const { signature } = await siger.signAmino(from,signDoc);
    const tx = {
        tx: {
            msg:signDoc.msgs,
            fee:signDoc.fee,
            signature:signature,
            memo:memo,
        },
        mode: 'sync'
    };
    return JSON.stringify(tx);

}

/**
 * 新版本 基于 cosmos-js lib包里面的
 * @param params
 */
export async function signV2Transaction(params: any) {
    const {  chainId, from, to, memo, amount_in, fee, gas, accountNumber, sequence, decimal, privateKey } = params;

    const amount = BigNumber(amount_in).times(Math.pow(10, decimal)).toString();
    const feeAmount = BigNumber(fee).times(Math.pow(10, decimal)).toString();
    const denom = "uatom";
    if (amount.toString().indexOf(".") !== -1) {
        throw new Error('input amount value invalid.');
    }
    if (feeAmount.toString().indexOf(".") !== -1) {
        throw new Error('input amount value invalid.');
    }
    if (!verifyAddress(from) || !verifyAddress(to)) {
        throw new Error('input address value invalid.');
    }
    const sendMessage = createSendMessage(
        from,
        to,
        amount,
        denom
    );
    const messages = [sendMessage];
    const txBody = createTxBody(messages, memo);
    const { pubkey } = await Secp256k1Wallet.fromKey(
        fromHex(privateKey),
        "cosmos"
    );
    const authInfo = await getAuthInfo(
        pubkey,
        sequence.toString(),
        feeAmount,
        denom,
        gas
    );
    const signDoc = getSignDoc(chainId, txBody, authInfo, accountNumber);
    const signature = getDirectSignature(signDoc, fromHex(privateKey));
    const txRawBytes = createTxRawBytes(
        txBody,
        authInfo,
        signature
    );
    const txBytesBase64 = Buffer.from(txRawBytes, 'binary').toString('base64');
    const txRaw = { tx_bytes: txBytesBase64, mode: "BROADCAST_MODE_SYNC" };
    return JSON.stringify(txRaw);

}


function verifyAddress(address:string){
    try {
        if (!isValidAddress(address) || !verifyChecksum(address)){
            return false;
        }else {
            return true;
        }
    }catch(e){
        return false;
    }
}
