const TonWeb = require('tonweb');
const { derivePath } = require('ed25519-hd-key');


export async function createAddress(seedHex:string,addressIndex:string){

    try {
        // 使用种子生成 HD 钱包派生密钥
        // const {key} = derivePath("m/44'/607'/0'/0'/"+addressIndex+"'", seedHex);
        const {key} = derivePath("m/44'/607'/"+addressIndex+"'", seedHex);
        // m/44/chain/account/change/index。bip44协议推导地址 ton钱包 change 后无需 ‘ 硬化派生，表示使用私钥推导，ton使用公钥推导

        // 使用Ed25519生成公钥,此方法生成的是 32私钥和32公钥的拼接
        const keyPair = TonWeb.utils.nacl.sign.keyPair.fromSeed(key);

        // 明确指定主网配置
        const tonweb = new TonWeb({
            network: 'mainnet'
        });
        // 从子密钥生成地址 , 可选择不同类型地址
        const WalletClass =  tonweb.wallet.all.v4R2;
        const wallet = new WalletClass(tonweb.provider,{
            publicKey: keyPair.publicKey,
            wc: 0 // 工作链 ID，0 表示主链
        })

        const address = await wallet.getAddress();
        return JSON.stringify({
            friendlyAddress: address.toString(true,true,false,false),
            nonFriendlyAddress: address.toString(false,true,false,false),
            publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
            privateKey32:Buffer.from(keyPair.secretKey.slice(0,32)).toString('hex'),
            privateKey64: Buffer.from(keyPair.secretKey).toString('hex'),
        })
    }catch (error){
        console.log(error)
    }

}

export async function importAddress(privateKeyHex:string){

    const  privateKeyArray = new Uint8Array(Buffer.from(privateKeyHex, 'hex'));

    let privateKey ;
    if (privateKeyArray.length === 32){
        privateKey = privateKeyArray;
    }else if (privateKeyArray.length === 64){
        privateKey = privateKeyArray.slice(0,32);
    }else {
        throw new Error('privateKey length Error');
    }

    const privateKeyBytes = TonWeb.utils.hexToBytes(Buffer.from(privateKey).toString('hex'));
    // 使用Ed25519生成公钥,此方法生成的是 32私钥和32公钥的拼接
    const keyPair = TonWeb.utils.nacl.sign.keyPair.fromSeed(privateKeyBytes);

    // 明确指定主网配置
    const tonweb = new TonWeb({
        network: 'mainnet'
    });
    const WalletClass = tonweb.wallet.all['v4R2'];
    const wallet = new WalletClass(tonweb.provider, {
        publicKey: keyPair.publicKey,
        wc: 0
    });

    const address = await wallet.getAddress();

    return JSON.stringify({
        privateKey32:Buffer.from(keyPair.secretKey.slice(0,32)).toString('hex'),
        privateKey64: Buffer.from(keyPair.secretKey).toString('hex'),
        friendlyAddress: address.toString(true,true,false,false),
        nonFriendlyAddress: address.toString(false,true,false,false),
        publicKey: Buffer.from(keyPair.publicKey).toString('hex'),
    })

}


export function verifyAddress(address:string){

    const regex = new RegExp("^[a-zA-Z0-9\+\-\_\*\/\%\=]{48}$");
    if (!regex.test(address)) return false;
    const dAddress = new TonWeb.utils.Address(address);
    const nfAddr = dAddress.toString(false);
    const fnsnbntAddr = dAddress.toString(true, false, false, false);
    const fsnbntAddr = dAddress.toString(true, true, false, false);
    const fnsnbtAddr = dAddress.toString(true, false, false, true);
    const fsnbtAddr = dAddress.toString(true, true, false, true);
    const fnsbntAddr = dAddress.toString(true, false, true, false);
    const fsbntAddr = dAddress.toString(true, true, true, false);
    const fnsbtAddr = dAddress.toString(true, false, true, true);
    const fsbtAddr = dAddress.toString(true, true, true, true);
    return address === nfAddr || address === fnsnbntAddr
        || address === fsnbntAddr || address === fnsnbtAddr
        || address === fsnbtAddr || address === fnsbntAddr || address === fsbntAddr
        || address === fnsbtAddr || address === fsbtAddr;

}