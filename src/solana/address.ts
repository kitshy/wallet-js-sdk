const {Keypair,PublicKey,LAMPORTS_PER_SOL} = require('@solana/web3.js');
const bs58 = require('bs58');
const { derivePath, getPublicKey } = require('ed25519-hd-key');
const {isHex,isBase58} = require("../common/utils")

/**
 * native account bip44
 * @param seedHex
 * @param addressIndex
 */
export function createAddress(seedHex:string,addressIndex:string) {

    // 生成私钥、公钥对。m/44/chain/account/change/index。bip44协议推导地址  solana 没有 找零地址
    const { key } = derivePath("m/44'/501'/0'/" + addressIndex + "'", seedHex);

    // 生成对应的公钥
    const publicKey = getPublicKey(new Uint8Array(key), false);
    // 获取 Base58 编码的地址
    const buffer = Buffer.from(publicKey, 'hex');
    const address = bs58.encode(buffer);

    // 将32字节私钥和32字节公钥合并为一个完整的64字节格式
    const secretKey = new Uint8Array([...key, ...publicKey]);
    // 使用完整的 64 字节数组来创建 Keypair
    const keypair = Keypair.fromSecretKey(secretKey);

    return JSON.stringify({
        privateKey: bs58.encode(keypair.secretKey),
        address: address,
        // ed25519格式 hd钱包标准格式
        privateKeyHex: key.toString('hex')+publicKey.toString('hex'),
    })

}

/**
 * native account
 */
export function createNormalWallet(){

    // 生成一个密钥对
    const keypairs = Keypair.generate();
    const secretKey = keypairs.secretKey;
    // 从已有的 secretKey 创建新的 Keypair 实例 keypair，可从私钥推导出对应的公钥和密钥对
    const keypair = Keypair.fromSecretKey(secretKey);
    return JSON.stringify({
        privateKey: bs58.encode(keypair.secretKey),
        address: keypair.publicKey.toBase58('hex'),
    })
}

/**
 * Solana 的 Keypair.fromSecretKey 方法期望的是一个 完整的 64 字节私钥，包含了种子和公钥的组合
 * @param privateKey
 */
export function importAddress(privateKey:string) {
    let keypair = null;
    if (isHex(privateKey)) {
        keypair = Keypair.fromSecretKey(new Uint8Array(Buffer.from(privateKey, "hex")));
    }
    if (isBase58(privateKey)) {
        keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
    }
    if (!keypair){
        throw new Error('keypair Error');
    }
    return JSON.stringify({
        privateKey:privateKey,
        address: keypair.publicKey.toBase58()
    })
}

export function verifyAddressEd25519(publicKey:string) {
    const  offCurveAddress = new PublicKey(publicKey);
    return PublicKey.isOnCurve(offCurveAddress.toBytes())
}