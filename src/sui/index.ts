import { Ed25519Keypair} from '@mysten/sui/keypairs/ed25519';
import { Transaction ,Inputs} from '@mysten/sui/transactions';
import {bcs} from '@mysten/sui/bcs';
import { fromBase64 } from '@mysten/sui/utils';
import BigNumber from "bignumber.js";

export function createAddress(seedHex:string,addressIndex:string){
    try {
        const path = `m/44'/784'/0'/0'/${addressIndex}'`;
        const keypair = Ed25519Keypair.deriveKeypairFromSeed(seedHex, path);
        const address = keypair.getPublicKey().toSuiAddress();
        return JSON.stringify({
            address: address,
            privateKeyHex: keypair.getSecretKey(),
        });
    }catch (e){
        console.log(e)
    }
}

export function importSuiAddress(privateKeyHex:string) {

    const keypair =Ed25519Keypair.fromSecretKey(privateKeyHex);
    const address = keypair.getPublicKey().toSuiAddress();
    return JSON.stringify({
        address: address,
        privateKey: keypair.getSecretKey(),
    });
}

export async function signTransaction(params:any) {

    const {from, to, amount, decimal, privateKeyHex, miniToken,objectId,version,digest} = params;

    const calcAmount = BigNumber(amount).times(Math.pow(10, decimal)).toString();

    //  构建转账交易
    const tx = new Transaction();
    const [coin] = tx.splitCoins(tx.gas, [calcAmount]);
    tx.transferObjects([coin], to);

    //构建转账逻辑，传入转账的对象和目标地址。
    tx.transferObjects([miniToken], to);

    // 设置发送者地址
    tx.setSender(from);

    // 设置 Gas 预算 以 MIST 为单位，1 SUI = 1,000,000,000 MIST
    tx.setGasBudget(100000);
    // 设置用于支付 Gas 的对象（必须是 SUI Token 对象，包含 objectId, version, digest）。
    tx.setGasPayment([
        {
            objectId: objectId,
            version: version,
            digest: digest
        }
    ]);

    // // 调用 Move 合约函数
    // tx.moveCall({
    //     target: '0xPackageAddress::ModuleName::FunctionName',
    //     arguments: [tx.pure('arg1'), tx.pure('arg2')],
    //     typeArguments: ['0xType1']
    // });


    const keypair =Ed25519Keypair.fromSecretKey(privateKeyHex);

    const signedTx = keypair.signTransaction(tx);

    return signedTx;

}


export async function signTransactionV2(params:any) {

    const {from, to, amount, decimal, privateKeyHex, miniToken,objectId,version,digest} = params;
    // 创建一个新的交易块
    const txb = new Transaction();

    // 示例：转账SUI币
    const calcAmount = BigNumber(amount).times(Math.pow(10, decimal)).toNumber();

    // 显式使用BCS序列化
    const amountBytes = bcs.u64().serialize(calcAmount);
    const [coin] = txb.splitCoins(txb.gas, [
        txb.pure(amountBytes)  // 使用BCS序列化的字节
    ]);

    // 设置转账目标地址（替换为实际地址）
    const recipientAddress = to;

    // 地址也使用BCS序列化
    const addressBytes = bcs.ADDRESS.serialize(recipientAddress);
    txb.transferObjects([coin], txb.pure(addressBytes));

    // 创建一个临时的Provider和Signer用于序列化
    const provider = new JsonRpcProvider();
    const keypair =Ed25519Keypair.fromSecretKey(privateKeyHex);
    const signer = new RawSigner(keypair, provider);

    // 准备交易字节码
    const txBytes = await txb.build({
        provider,
        onlyTransactionKind: false
    });

    // 使用密钥对签名
    const signerBytes = await signer.signTransactionBlock(txBytes);

    // 将交易字节码和签名转换为base64
    const txBase64 = toB64(txBytes);
    const signatureBase64 = toB64(signerBytes.signature);

    return {
        transactionBytes: txBase64,
        signature: signatureBase64,
        sender: keypair.getPublicKey().toSuiAddress()
    };

}
