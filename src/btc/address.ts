import {address} from "bitcoinjs-lib";

const ecc = require('tiny-secp256k1');
const { BIP32Factory } = require('bip32');
const bip32 = BIP32Factory(ecc);
const bitcoin = require('bitcoinjs-lib');

/**
 * 使用 eip44 协议 的 path 来生成地址
 * 通用的多币种、多账户管理，适用于生成多种类型的地址（P2PKH, P2SH, P2WPKH）
 * @param params
 */
export function createBIP44Address(params: any): any {

    const { seedHex, receiveOrChange, addressIndex, network, method } = params;
    // 私钥生成种子
    const root = bip32.fromSeed(Buffer.from(seedHex, 'hex'));
    // m/44/chain/account/change/index
    let path = "m/44'/0'/0'/0/" + addressIndex + '';
    if (receiveOrChange === '1') {
        path = "m/44'/0'/0'/1/" + addressIndex + '';
    }
    // 从根密钥（或根节点）生成特定子密钥
    const childKey = root.derivePath(path);
    let address : string;
    switch (method){
        // 以1开头
        case 'p2pkh':
            const p2pkhAddress = bitcoin.payments.p2pkh({
                pubkey: childKey.publicKey,
                network: bitcoin.networks[network]
            });
            address = p2pkhAddress.address;
            break;
        // 以3开头
        case 'p2sh':
            const p2shAddress = bitcoin.payments.p2sh({
                redeem: bitcoin.payments.p2wpkh({
                    pubkey: childKey.publicKey,
                    network: bitcoin.networks[network],
                })
            });
            address = p2shAddress.address;
            break;
        // Bech32（SegWit）地址 以 bc1 开头
        case 'p2wpkh':
            const p2wpkhAddress = bitcoin.payments.p2wpkh({
                pubkey: childKey.publicKey,
                network: bitcoin.networks[network],
            });
            address = p2wpkhAddress.address;
            break;
        default:
            console.log(`Invalid method not exist: ${method}`);
            address = ""
    }
    // @ts-ignore
    return {
        privateKey: Buffer.from(childKey.privateKey).toString("hex"),
        publicKey: Buffer.from(childKey.publicKey).toString("hex"),
        address
    }

}

/**
 * 使用 各自协议的 path 来生成不同格式地址 与unisat地址能够对应
 * @param params
 */
export function createBtcAddress(params: any): any {

    const { seedHex, receiveOrChange, addressIndex, network, method } = params;
    // 私钥生成种子
    const root = bip32.fromSeed(Buffer.from(seedHex, 'hex'));

    // 以1开头
    if (method === 'p2pkh') {
        // m/44/chain/account/change/index
        let path = "m/44'/0'/0'/0/" + addressIndex + '';
        if (receiveOrChange === '1') {
            path = "m/44'/0'/0'/1/" + addressIndex + '';
        }
        // 从根密钥（或根节点）生成特定子密钥
        const childKey = root.derivePath(path);

        const p2pkhAddress = bitcoin.payments.p2pkh({
            pubkey: childKey.publicKey,
            network: bitcoin.networks[network]
        });
        return {
            privateKey: Buffer.from(childKey.privateKey).toString("hex"),
            publicKey: Buffer.from(childKey.publicKey).toString("hex"),
            address: p2pkhAddress.address,
        }
    }
    // 以3开头
    else if (method === 'p2sh') {
        // m/44/chain/account/change/index
        let path = "m/49'/0'/0'/0/" + addressIndex + '';
        if (receiveOrChange === '1') {
            path = "m/49'/0'/0'/1/" + addressIndex + '';
        }
        // 从根密钥（或根节点）生成特定子密钥
        const childKey = root.derivePath(path);

        const p2shAddress = bitcoin.payments.p2sh({
            redeem: bitcoin.payments.p2wpkh({
                pubkey: childKey.publicKey,
                network: bitcoin.networks[network],
            })
        });
        return {
            privateKey: Buffer.from(childKey.privateKey).toString("hex"),
            publicKey: Buffer.from(childKey.publicKey).toString("hex"),
            address: p2shAddress.address,
        }
    }
    // Bech32（SegWit）地址 以 bc1 开头
    else if (method === 'p2wpkh') {
        // m/44/chain/account/change/index
        let path = "m/84'/0'/0'/0/" + addressIndex + '';
        if (receiveOrChange === '1') {
            path = "m/84'/0'/0'/1/" + addressIndex + '';
        }
        // 从根密钥（或根节点）生成特定子密钥
        const childKey = root.derivePath(path);

        const p2wpkhAddress = bitcoin.payments.p2wpkh({
            pubkey: childKey.publicKey,
            network: bitcoin.networks[network],
        });
        return {
            privateKey: Buffer.from(childKey.privateKey).toString("hex"),
            publicKey: Buffer.from(childKey.publicKey).toString("hex"),
            address: p2wpkhAddress.address,
        }
    }
    return null;

}

/**
 * 生成taproot地址
 * @param params
 */
export function createSchnorrAddress(params: any): any {

    bitcoin.initEccLib(ecc);
    const { seedHex, receiveOrChange, addressIndex, network } = params;
    // 私钥生成种子
    const root  = bip32.fromSeed(Buffer.from(seedHex, 'hex'));
    // m/44/chain/account/change/index
    let path = "m/86'/0'/0'/0/" + addressIndex + '';
    if (receiveOrChange === '1') {
        path = "m/86'/0'/0'/1/" + addressIndex + '';
    }
    const childKey = root.derivePath(path);
    const privateKey = childKey.privateKey;
    if (!privateKey) {
        throw new Error("Invalid method not exist");
    }

    const p2trAddress = bitcoin.payments.p2tr({
        network: bitcoin.networks[network],
        internalPubkey: childKey.publicKey.length===32 ? childKey.publicKey : childKey.publicKey.slice(1,33),
    })

    return {
        privateKey: Buffer.from(childKey.privateKey).toString("hex"),
        publicKey: Buffer.from(childKey.publicKey).toString("hex"),
        address: p2trAddress.address,
    }

}

/**
 * 多签地址生成
 * 多签地址是m-of-n结构，表示有 n 个密钥，其中至少需要 m 个密钥签名才能进行交易。
 * 最常用的多签地址类型是P2SH（Pay-to-Script-Hash）地址
 * @param params
 */
export function createMultiSignAddress(params: any): any {
    const { pubkeys, network, method, threshold } = params;
    switch (method) {
        case 'p2pkh':
            return bitcoin.payments.p2sh({
                redeem: bitcoin.payments.p2ms({
                    m: threshold,
                    network: bitcoin.networks[network],
                    pubkeys: pubkeys
                })
            }).address;
        case 'p2pwpkh':
            return bitcoin.payments.p2wsh({
                redeem: bitcoin.payments.p2ms({
                    m: threshold,
                    network: bitcoin.networks[network],
                    pubkeys: pubkeys
                })
            }).address;
        case 'p2sh':
            return bitcoin.payments.p2sh({
                redeem: bitcoin.payments.p2wsh({
                    redeem: bitcoin.payments.p2ms({
                        m: threshold,
                        network: bitcoin.networks[network],
                        pubkeys: pubkeys
                    })
                })
            }).address;
        default:
            console.error("Invalid method not exist");
            return '0x00';
    }

}