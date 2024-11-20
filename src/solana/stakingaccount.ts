import {Authorized, Transaction, Keypair, StakeProgram, PublicKey, Lockup} from "@solana/web3.js";
import {isBase58, isHex} from "@/common/utils";
const bs58 = require('bs58');

// 创建质押账户
export async function createAccount(params: any) {
    const {authorPrivateKey,stakeAccountPrivateKey,lamportsForStakeAccount,votePubkeyStr,recentBlockhash} = params;

    let tx = new Transaction();

    let fromAccount,stakeAccount;
    if (isBase58(authorPrivateKey)){
        fromAccount = Keypair.fromSecretKey(bs58.decode(authorPrivateKey));
    }else if (isHex(authorPrivateKey)){
        fromAccount = Keypair.fromSecretKey(new Uint8Array(Buffer.from(authorPrivateKey,"hex")));
    }else {
        throw new Error("privateKey 格式不支持");
    }
    if (isBase58(stakeAccountPrivateKey)){
        stakeAccount = Keypair.fromSecretKey(bs58.decode(stakeAccountPrivateKey));
    }else if (isHex(stakeAccountPrivateKey)){
        stakeAccount = Keypair.fromSecretKey(new Uint8Array(Buffer.from(stakeAccountPrivateKey,"hex")));
    }else {
        throw new Error("privateKey 格式不支持");
    }

    // 初始化质押账户
    const createAccountTransaction = StakeProgram.createAccount({
        fromPubkey: fromAccount.publicKey,
        /** Address of the new stake account */
        stakePubkey: stakeAccount.publicKey,
        /** Authorities of the new stake account 授权信息，表示谁可以对质押账户执行操作*/
        authorized: new Authorized(fromAccount.publicKey,fromAccount.publicKey),
        /** Lockup of the new stake account 控制质押账户的锁定期。 (0, 0, fromAccount.publicKey)，即无锁定期。 */
        lockup: new Lockup(0,0,fromAccount.publicKey),
        /** Funding amount 为质押账户提供的初始资金 Solana 中的 lamports 单位）*/
        lamports: lamportsForStakeAccount,
    })
    tx.add(createAccountTransaction);

    // 指定给委托质押账户的投票账户（通常由验证者节点拥有）
    const votePubkey = new PublicKey(votePubkeyStr);
    // 创建委托交易 stakeAccount 账户的投票权委托给 votePubkey 所指的验证者，从而支持该验证者节点。
    const delegateTransaction = StakeProgram.delegate({
        authorizedPubkey: fromAccount.publicKey,
        stakePubkey: stakeAccount.publicKey,
        votePubkey: votePubkey,
    })
    tx.add(delegateTransaction);

    tx.recentBlockhash = recentBlockhash;
    tx.sign(fromAccount,stakeAccount);
    return tx.serialize().toString('base64');

}

// 转移投票权
export async function delegateStake(params: any) {
    const {authorPrivateKey,stakeAccountPrivateKey,votePubkeyStr,recentBlockhash} = params;
    let tx = new Transaction();

    let authorAccount,stakeAccount;
    if (isBase58(authorPrivateKey)){
        authorAccount = Keypair.fromSecretKey(bs58.decode(authorPrivateKey));
    }else if (isHex(authorPrivateKey)){
        authorAccount = Keypair.fromSecretKey(new Uint8Array(Buffer.from(authorPrivateKey,"hex")));
    }else {
        throw new Error("privateKey 格式不支持");
    }
    if (isBase58(stakeAccountPrivateKey)){
        stakeAccount = Keypair.fromSecretKey(bs58.decode(stakeAccountPrivateKey));
    }else if (isHex(stakeAccountPrivateKey)){
        stakeAccount = Keypair.fromSecretKey(new Uint8Array(Buffer.from(stakeAccountPrivateKey,"hex")));
    }else {
        throw new Error("privateKey 格式不支持");
    }

    // 指定给委托质押账户的投票账户（通常由验证者节点拥有）此处为新的委托节点
    const votePubkey = new PublicKey(votePubkeyStr);

    const delegateTransaction = StakeProgram.delegate({
        authorizedPubkey: authorAccount.publicKey,
        stakePubkey: stakeAccount.publicKey,
        votePubkey: votePubkey,
    })

    tx.add(delegateTransaction);
    tx.recentBlockhash = recentBlockhash;
    tx.sign(authorAccount,stakeAccount);
    return tx.serialize().toString('base64');
}

// 停用质押账户
export function deactivateStakeAccount(params: any) {

    const {authorPrivateKey, stakeAccountPrivateKey, recentBlockhash } = params
    let tx = new Transaction()
    const stakeAccount = Keypair.fromSecretKey(new Uint8Array(Buffer.from(stakeAccountPrivateKey, 'hex')), { skipValidation: true });

    const authorizedAccount = Keypair.fromSecretKey(new Uint8Array(Buffer.from(authorPrivateKey, 'hex')), { skipValidation: true });

    let deactivateTransaction = StakeProgram.deactivate({
        stakePubkey: stakeAccount.publicKey,
        authorizedPubkey: authorizedAccount.publicKey,
    });

    tx.add(deactivateTransaction)
    tx.recentBlockhash = recentBlockhash;
    tx.sign(authorizedAccount, stakeAccount);
    return tx.serialize().toString("base64");

}

// 质押账户（stake account）的提现交易
export function withdrawStakeAccount(params: any) {

    const {authorPrivateKey, stakeAccountPrivateKey, stakeBalance, recentBlockhash } = params
    let tx = new Transaction()
    const authorizedAccount = Keypair.fromSecretKey(new Uint8Array(Buffer.from(authorPrivateKey, "hex")));

    const stakeAccount = Keypair.fromSecretKey(new Uint8Array(Buffer.from(stakeAccountPrivateKey, "hex")));

    const fromPublicKey = Keypair.fromSecretKey(new Uint8Array(Buffer.from(authorPrivateKey, "hex")));

    let withdrawTransaction = StakeProgram.withdraw({
        stakePubkey: stakeAccount.publicKey,
        authorizedPubkey: authorizedAccount.publicKey,
        toPubkey: fromPublicKey.publicKey,
        lamports: stakeBalance,
    });

    tx.add(withdrawTransaction)
    tx.recentBlockhash = recentBlockhash;
    tx.sign(authorizedAccount, stakeAccount);

}

