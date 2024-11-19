const {Keypair,SystemProgram,Transaction,PublicKey,NONCE_ACCOUNT_LENGTH,Connection,clusterApiUrl} = require('@solana/web3.js');
import * as SPLToken from '@solana/spl-token';
const BigNumber = require('bignumber.js');
const bs58 = require('bs58');
import {isBase58,isHex} from "../common/utils";

export  async function signTransaction(params:any){

    const { from, amount, nonceAccount, to, nonce, decimal, privateKey,mintAddress,fromMintTokenAccount, toMintTokenAccount} = params;

    const calcAmount = BigNumber(amount).times(Math.pow(10, decimal)).toString();

    let fromKeyPair;
    if (isBase58(privateKey)){
        fromKeyPair = Keypair.fromSecretKey(bs58.decode(privateKey));
    }else if (isHex(privateKey)){
        fromKeyPair = Keypair.fromSecretKey(new Uint8Array(Buffer.from(privateKey, "hex")));
    }else {
        throw new Error("privateKey 格式不支持");
    }
    if (calcAmount.indexOf('.') !== -1) throw new Error('decimal 无效');

    // 创建转账信息
    const tx = new Transaction();
    tx.recentBlockhash = nonce;

    if (mintAddress){
        let fromTokenAccount, toTokenAccount;
        const token = new PublicKey(mintAddress);
        // SPL Token 转账
        if (!fromMintTokenAccount){
            fromTokenAccount = await SPLToken.Token.getAssociatedTokenAddress(
                SPLToken.ASSOCIATED_TOKEN_PROGRAM_ID,
                SPLToken.TOKEN_PROGRAM_ID,
                token ,
                new PublicKey(from)
            );
        }else {
            fromTokenAccount = new PublicKey(fromMintTokenAccount)
        }
        if (!toTokenAccount){
            toTokenAccount = await SPLToken.Token.getAssociatedTokenAddress(
                SPLToken.ASSOCIATED_TOKEN_PROGRAM_ID,
                SPLToken.TOKEN_PROGRAM_ID,
                token,
                new PublicKey(to)
            );
        }else {
            toTokenAccount = new PublicKey(toMintTokenAccount)
        }

        // 检查并创建 `fromTokenAccount` 和 `toTokenAccount` 关联账户（如未初始化）
        // await splTokenAccount(tx,fromTokenAccount,toTokenAccount,mintAddress,from,to);

        if (nonceAccount){
            // 使用 nonceaccount 作为nonce 生成转账交易 ，移除后也是可以的
            tx.add(
                SystemProgram.nonceAdvance({
                    noncePubkey: new PublicKey(nonceAccount),
                    authorizedPubkey: new PublicKey(from),
                }),
                SPLToken.Token.createTransferInstruction(
                    SPLToken.TOKEN_PROGRAM_ID,
                    fromTokenAccount,
                    toTokenAccount,
                    new PublicKey(from),
                    [fromKeyPair],
                    calcAmount,
                )
            )
        }else {
            tx.add(
                SPLToken.Token.createTransferInstruction(
                    SPLToken.TOKEN_PROGRAM_ID,
                    fromTokenAccount,
                    toTokenAccount,
                    new PublicKey(from),
                    [fromKeyPair],
                    calcAmount,
                )
            )
        }

    }else {
        // sol 转账
        if (nonceAccount){
            // 使用 nonceaccount 作为nonce 生成转账交易 ，移除后也是可以的
            tx.add(
                SystemProgram.nonceAdvance({
                    noncePubkey: new PublicKey(nonceAccount),
                    authorizedPubkey: new PublicKey(from),
                }),
                SystemProgram.transfer({
                    fromPubkey: new PublicKey(from),
                    toPubkey: new PublicKey(to),
                    // 转账金额
                    lamports: calcAmount,
                })
            );
        }else {
            tx.add(
                SystemProgram.transfer({
                    fromPubkey: new PublicKey(from),
                    toPubkey: new PublicKey(to),
                    // 转账金额
                    lamports: calcAmount,
                })
            );
        }
    }

    // 使用私钥签名交易
    tx.sign(fromKeyPair);

    const txsign = tx.serialize().toString('base64');

    return txsign;

}

// 检查并创建 `fromTokenAccount` 和 `toTokenAccount` 关联账户（如未初始化）
async function splTokenAccount(tx:any,fromTokenAccount:any,toTokenAccount:any,mintAddress:string,from:string,to:string){

    const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

    // 检查并创建 `fromTokenAccount` 和 `toTokenAccount` 关联账户（如未初始化）
    const fromTokenAccountInfo = await connection.getAccountInfo(fromTokenAccount);
    const toTokenAccountInfo = await connection.getAccountInfo(toTokenAccount);

    if (!fromTokenAccountInfo){
        tx.add(
            SPLToken.Token.createAssociatedTokenAccountInstruction(
                SPLToken.ASSOCIATED_TOKEN_PROGRAM_ID,
                SPLToken.TOKEN_PROGRAM_ID,
                new PublicKey(mintAddress),
                fromTokenAccount,
                new PublicKey(from),
                new PublicKey(from),
            )
        )
    }

    if (!toTokenAccountInfo){
        tx.add(
            SPLToken.Token.createAssociatedTokenAccountInstruction(
                SPLToken.ASSOCIATED_TOKEN_PROGRAM_ID,
                SPLToken.TOKEN_PROGRAM_ID,
                new PublicKey(mintAddress),
                toTokenAccount,
                new PublicKey(to),
                new PublicKey(from),
            )
        )
    }

}

/**
 * @param params
 */
export async function prepareNonceAccount(params:any) {

    const {authorAddress, from, recentBlockhash, minBalanceForRentExemption, privs} = params;

    // 找到 authorAddress 对应的私钥 authorPrivateKey。若未找到，则抛出错误提示私钥为空。
    const authorPrivateKey = (privs?.find((ele: { address: any; })=>ele.address===authorAddress))?.key;
    if(!authorPrivateKey) throw new Error("authorPrivateKey 为空");

    // 找到 from（即 nonce 账户地址）对应的私钥 nonceAcctPrivateKey。若未找到，则抛出错误。
    const nonceAcctPrivateKey = (privs?.find((ele: { address: any; })=>ele.address===from))?.key;
    if(!nonceAcctPrivateKey) throw new Error("nonceAcctPrivateKey 为空");

    let authorKeypair, nonceKeypair;
    if (isBase58(authorPrivateKey)) {
        authorKeypair = Keypair.fromSecretKey(bs58.decode(authorPrivateKey));
    } else if (isHex(authorPrivateKey)) {
        authorKeypair = Keypair.fromSecretKey(new Uint8Array(Buffer.from(authorPrivateKey, "hex")));
    } else {
        throw new Error("authorPrivateKey 格式不支持");
    }

    if (isBase58(nonceAcctPrivateKey)) {
        nonceKeypair = Keypair.fromSecretKey(bs58.decode(nonceAcctPrivateKey));
    } else if (isHex(nonceAcctPrivateKey)) {
        nonceKeypair = Keypair.fromSecretKey(new Uint8Array(Buffer.from(nonceAcctPrivateKey, "hex")));
    } else {
        throw new Error("nonceAcctPrivateKey 格式不支持");
    }

    const tx = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: authorKeypair.publicKey,
            newAccountPubkey: nonceKeypair.publicKey,
            // 最低余额标准
            lamports: minBalanceForRentExemption,
            space: NONCE_ACCOUNT_LENGTH,
            programId: SystemProgram.programId,
        }),
        SystemProgram.nonceInitialize({
            noncePubkey: authorKeypair.publicKey,
            authorizedPubkey: nonceKeypair.publicKey,
        })
    );
    tx.recentBlockhash = recentBlockhash;

    tx.sign(authorKeypair,nonceKeypair);

    return tx.serialize().toString('base64');
}

