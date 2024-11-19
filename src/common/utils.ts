const {AES,enc} = require("scrypt-js");

export function isHex(str:string){
    // 检查是否为偶数长度且仅包含十六进制字符
    return /^[0-9a-fA-F]+$/.test(str);
}

export function isBase58(str:string) {
    // 检查是否仅包含 base58 允许的字符
    return /^[A-HJ-NP-Za-km-z1-9]+$/.test(str);
}

export function Encrypt(value: any, key: any) {
    if (typeof (value)=== "string" && typeof (key)== "string") {
        return AES.encrypt(value,key).toString();
    }else {
        throw new Error("not support type value and key");
    }
}

export function Decrypt(value: any, key: any) {
    if (typeof (value)=== "string" && typeof (key)== "string") {
        let bytes =AES.decrypt(value,key);
        return bytes.toString();
    }else {
        throw new Error("not support type value and key");
    }
}