const BigNumber = require('bignumber.js');
const TonWeb = require('tonweb');

// 明确指定主网配置
const tonweb = new TonWeb({
    network: 'mainnet'
});

export async function signTransaction(params:any){

    try {
        const {from,to,amount, decimal,seqno,commit,privateKeyHex,fromJettonWalletAddress} = params;

        const calcAmount = BigNumber(amount).times(Math.pow(10, decimal)).toNumber();

        // 兼容私钥或者私钥和公钥拼接的
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


        const WalletClass = tonweb.wallet.all['v4R2'];
        const wallet = new WalletClass(tonweb.provider, {
            publicKey: keyPair.publicKey,
            wc: 0
        });

        // 判断地址from地址是否正确
        const fromAddress = await wallet.getAddress();
        const friendlyAddress =  fromAddress.toString(true,true,false,false);
        const nonFriendlyAddress = fromAddress.toString(false,true,false,false);
        if (from !== friendlyAddress && from !== nonFriendlyAddress) {
            throw new Error("from address invalid");
        }

        const toAddress = new TonWeb.utils.Address(to);

        let tx_msg;
        if (fromJettonWalletAddress){

            // 构建jetton转账消息
            const  transferBody = await createJettonTransferBody(fromJettonWalletAddress,fromAddress,toAddress,calcAmount,commit);

            // 构建 token 转账交易
            tx_msg = await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: fromJettonWalletAddress,
                // 直接支付到主目标地址（toAddress），用于支付交易费用或满足合约的调用要求。
                amount: TonWeb.utils.toNano('0.05'),
                // amount: calcAmount,
                seqno: seqno,
                // 0 不需要确认 1 确认交易并返回结果 3 立即发送
                sendMode: 3,
                payload: transferBody,
            });
        }else {
            // ton 转账
            tx_msg = await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: toAddress,
                amount: TonWeb.utils.toNano(amount+''),
                // amount: calcAmount,
                seqno: seqno,
                // 0 不需要确认 1 确认交易并返回结果 3 立即发送
                sendMode: 3,
                payload: commit || "",
            });
        }

        const queryData = await tx_msg.getQuery()
        const hash = await queryData.hash()
        const toBoc = await queryData.toBoc(false);

        return JSON.stringify({
            hash:tonweb.utils.bytesToBase64(hash),
            toBoc:tonweb.utils.bytesToBase64(toBoc)
        })

    }catch (error){
        console.log(error)
    }
}


async function createJettonTransferBody(fromJettonWalletAddress:any,fromAddress:any,toAddress:any,calcAmount:any ,commit:any){

    const {JettonWallet} = TonWeb.token.jetton;
    const jettonWallet = new JettonWallet(tonweb.provider, {
        address: fromJettonWalletAddress,
    })

    const transferBody = await jettonWallet.createTransferBody({
        jettonAmount: calcAmount,
        toAddress: toAddress,
        // 附加的转账 ton 在 Jetton 合约执行过程中，从 Jetton 合约转发给接收方，可能包括用户指定的额外金额或合约间交互费用。
        forwardAmount: TonWeb.utils.toNano('0.01'),
        forwardPayload: commit || "",
        responseAddress: fromAddress
    })

    return transferBody;

}