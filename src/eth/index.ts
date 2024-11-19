import { Interface } from '@ethersproject/abi';
import { FeeMarketEIP1559Transaction,Transaction } from '@ethereumjs/tx';
import Common from "@ethereumjs/common";

const ethers = require("ethers");
const BigNumber = require("bignumber.js");

export function numberToHex(value: any) {
    const number = BigNumber(value);
    const result = number.toString(16);
    return '0x'+result;
}


/**
 * @param seedHex
 * @param addressIndex
 */
export function createAddress(seedHex:string,addressIndex:string) {
    // seedHex 生成rootkey/masterkey
    const hdNode = ethers.utils.HDNode.fromSeed(Buffer.from(seedHex, 'hex'));
    // m/44/chain/account/change/index。bip44协议推导地址
    const {privateKey,publicKey,address} = hdNode.derivePath("m/44'/60'/0'/0/" + addressIndex + '');
    return JSON.stringify({
        privateKey: privateKey,
        address: address,
        publicKey: publicKey,
    })
}

export function importEthAddress(privateKey:string) {
    const wallet = new ethers.Wallet(Buffer.from(privateKey, 'hex'));
    return JSON.stringify({
        privateKey,
        address: wallet.address,
        publicKey: wallet.publicKey,
    });
}

export function publicKeyToAddress(publicKey:string) {
    return ethers.utils.computeAddress(publicKey);
}

/**
 *  Legacy 交易字段     nonce，gasPrice，gasLimit，to，value，data，v, r, s
 *  EIP1559 交易字段    nonce，maxFeePerGas，maxPriorityFeePerGas，gasLimit，to，value，data，v, r, s
 *  eip4844 Blob交易字段 nonce，gasPrice，gasLimit，to，value，blobData，blobVersion，blobRoot，v, r, s
 *  eip2930 交易字段    chainId，nonce，gasPrice，gasLimit，to，value，data，accessList，v, r, s
 * @param params
 */

export function ethSign(params: any) {

    let { privateKey, nonce, from, to, gasPrice, gasLimit, amount, tokenAddress,
        decimal, maxPriorityFeePerGas, maxFeePerGas, chainId, data } = params;

    let newAmount = BigNumber(amount).times((BigNumber(10).pow(decimal)));

    let txData: any = {
        nonce: numberToHex(nonce),
        gasLimit: numberToHex(gasLimit),
        to: to,
        from: from,
        chainId: numberToHex(chainId),
        value: numberToHex(newAmount),
    }
    if (maxFeePerGas && maxPriorityFeePerGas){
        // eip1559
        txData.maxFeePerGas = numberToHex(maxFeePerGas);
        txData.maxPriorityFeePerGas = numberToHex(maxPriorityFeePerGas);
    }else {
        // leagcy blob eip2930
        txData.gasPrice = numberToHex(gasPrice);
    }

    // 第一不为空或无效地址，表示erc20 转账
    if (tokenAddress && tokenAddress !== "0x00") {
        const ABI = [
            "function transfer(address to, uint amount)"
        ];
        const iface = new Interface(ABI);
        txData.data = iface.encodeFunctionData("transfer",[to,numberToHex(newAmount)]);
        txData.to = tokenAddress;
        txData.value = 0;
    }

    if (data){
        txData.data = data;
    }

    let common:any,tx: any;
    if (txData.maxFeePerGas && txData.maxPriorityFeePerGas){
        common = (Common as any).custom({
            chainId: chainId,
            defaultHardfork: "london",
        });
        tx = FeeMarketEIP1559Transaction.fromTxData(txData,{
            common
        });
    }else {
        common = (Common as any).custom({
            chainId: chainId,
        });
        tx = Transaction.fromTxData(txData,{
            common
        });
    }

    const privateKeyBuffer = Buffer.from(privateKey,"hex");
    const signedTx = tx.sign(privateKeyBuffer);
    const serializedTx = signedTx.serialize();
    if (!serializedTx){
        throw new Error("sign is null or undefined");
    }
    return `0x${serializedTx.toString("hex")}`;

}

