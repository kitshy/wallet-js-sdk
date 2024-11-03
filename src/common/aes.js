const {AES,enc} = require("crypto-js")

export function Encrypt(value, key) {
    if (typeof (value)=== "string" && typeof (key)== "string") {
        return AES.encrypt(value,key).toString();
    }else {
        throw new Error("not support type value and key");
    }
}

export function Decrypt(value, key) {
    if (typeof (value)=== "string" && typeof (key)== "string") {
        let bytes =AES.decrypt(value,key);
        return bytes.toString();
    }else {
        throw new Error("not support type value and key");
    }
}