const ecc = require('tiny-secp256k1');
const { BIP32Factory } = require('bip32');
BIP32Factory(ecc);
const bitcoin = require('bitcoinjs-lib');
const bitcore = require('bitcore-lib');

export function buildAndSignTx(params: {
                                    privateKey: string;
                                    signObj: any;
                                    network: string;
    }): string{

    const { privateKey, signObj, network } = params;
    const net = bitcore.Networks[network];
    const inputs = signObj.inputs.map((input: { address: any; txid: any; vout: any; amount: any; }) => {
        return {
            // 输入的比特币地址
            address: input.address,
            // UTXO 的交易 ID
            txId: input.txid,
            // UTXO 在该交易中的输出索引
            outputIndex: input.vout,
            // eslint-disable-next-line new-cap // 地址的锁定脚本
            script: new bitcore.Script.fromAddress(input.address).toHex(),
            // 金额（聪）
            satoshis: input.amount
        };
    });
    const outputs = signObj.outputs.map((output: { address: any; amount: any; }) => {
        return {
            address: output.address,
            satoshis: output.amount
        };
    });
    const transaction = new bitcore.Transaction(net).from(inputs).to(outputs);
    transaction.version = 2;
    transaction.sign(privateKey);
    return transaction.toString();
}


export function buildUnSignTxAndSign(params:any){
    const { keyPair, signObj, network } = params;
    const psbt = new bitcoin.Psbt({ network });
    const inputs = signObj.inputs.map((input: { address: any; txid: any; vout: any; amount: any; }) => {
        return {
            address: input.address,
            txId: input.txid,
            outputIndex: input.vout,
            // eslint-disable-next-line new-cap
            script: new bitcore.Script.fromAddress(input.address).toHex(),
            satoshis: input.amount
        };
    });
    psbt.addInput(inputs);

    const outputs = signObj.outputs.map((output: { address: any; amount: any; }) => {
        return {
            address: output.address,
            satoshis: output.amount
        };
    });
    psbt.addOutput(outputs);
    psbt.toBase64();

    psbt.signInput(0, keyPair);
    psbt.finalizeAllInputs();

    const signedTransaction = psbt.extractTransaction().toHex();

    return signedTransaction.toString();

}