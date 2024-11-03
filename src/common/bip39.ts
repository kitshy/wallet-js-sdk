const bip39 = require('bip39');
const bip32 = require('bip32');

/**
 * 生成助记词
 * @param num
 * @param language
 */
export function createMnemonic (num: number, language: string) {
    switch (language) {
        case 'chinese_simplified':
            if (num === 12) {
                return bip39.generateMnemonic(128, null, bip39.wordlists.chinese_simplified);
            } else if (num === 15) {
                return bip39.generateMnemonic(160, null, bip39.wordlists.chinese_simplified);
            } else if (num === 18) {
                return bip39.generateMnemonic(192, null, bip39.wordlists.chinese_simplified);
            } else if (num === 21) {
                return bip39.generateMnemonic(224, null, bip39.wordlists.chinese_simplified);
            } else if (num === 24) {
                return bip39.generateMnemonic(256, null, bip39.wordlists.chinese_simplified);
            } else {
                return 'unsupported';
            }
        case 'chinese_traditional':
            if (num === 12) {
                return bip39.generateMnemonic(128, null, bip39.wordlists.chinese_traditional);
            } else if (num === 15) {
                return bip39.generateMnemonic(160, null, bip39.wordlists.chinese_traditional);
            } else if (num === 18) {
                return bip39.generateMnemonic(192, null, bip39.wordlists.chinese_traditional);
            } else if (num === 21) {
                return bip39.generateMnemonic(224, null, bip39.wordlists.chinese_traditional);
            } else if (num === 24) {
                return bip39.generateMnemonic(256, null, bip39.wordlists.chinese_traditional);
            } else {
                return 'unsupported';
            }
        case 'english':
            if (num === 12) {
                return bip39.generateMnemonic(128, null, bip39.wordlists.english);
            } else if (num === 15) {
                return bip39.generateMnemonic(160, null, bip39.wordlists.english);
            } else if (num === 18) {
                return bip39.generateMnemonic(192, null, bip39.wordlists.english);
            } else if (num === 21) {
                return bip39.generateMnemonic(224, null, bip39.wordlists.english);
            } else if (num === 24) {
                return bip39.generateMnemonic(256, null, bip39.wordlists.english);
            } else {
                return 'unsupported';
            }
        case 'french':
            if (num === 12) {
                return bip39.generateMnemonic(128, null, bip39.wordlists.french);
            } else if (num === 15) {
                return bip39.generateMnemonic(160, null, bip39.wordlists.french);
            } else if (num === 18) {
                return bip39.generateMnemonic(192, null, bip39.wordlists.french);
            } else if (num === 21) {
                return bip39.generateMnemonic(224, null, bip39.wordlists.french);
            } else if (num === 24) {
                return bip39.generateMnemonic(256, null, bip39.wordlists.french);
            } else {
                return 'unsupported';
            }
        case 'italian':
            if (num === 12) {
                return bip39.generateMnemonic(128, null, bip39.wordlists.italian);
            } else if (num === 15) {
                return bip39.generateMnemonic(160, null, bip39.wordlists.italian);
            } else if (num === 18) {
                return bip39.generateMnemonic(192, null, bip39.wordlists.italian);
            } else if (num === 21) {
                return bip39.generateMnemonic(224, null, bip39.wordlists.italian);
            } else if (num === 24) {
                return bip39.generateMnemonic(256, null, bip39.wordlists.italian);
            } else {
                return 'unsupported';
            }
        case 'japanese':
            if (num === 12) {
                return bip39.generateMnemonic(128, null, bip39.wordlists.japanese);
            } else if (num === 15) {
                return bip39.generateMnemonic(160, null, bip39.wordlists.japanese);
            } else if (num === 18) {
                return bip39.generateMnemonic(192, null, bip39.wordlists.japanese);
            } else if (num === 21) {
                return bip39.generateMnemonic(224, null, bip39.wordlists.japanese);
            } else if (num === 24) {
                return bip39.generateMnemonic(256, null, bip39.wordlists.japanese);
            } else {
                return 'unsupported';
            }
        case 'korean':
            if (num === 12) {
                return bip39.generateMnemonic(128, null, bip39.wordlists.korean);
            } else if (num === 15) {
                return bip39.generateMnemonic(160, null, bip39.wordlists.korean);
            } else if (num === 18) {
                return bip39.generateMnemonic(192, null, bip39.wordlists.korean);
            } else if (num === 21) {
                return bip39.generateMnemonic(224, null, bip39.wordlists.korean);
            } else if (num === 24) {
                return bip39.generateMnemonic(256, null, bip39.wordlists.korean);
            } else {
                return 'unsupported';
            }
        case 'spanish':
            if (num === 12) {
                return bip39.generateMnemonic(128, null, bip39.wordlists.spanish);
            } else if (num === 15) {
                return bip39.generateMnemonic(160, null, bip39.wordlists.spanish);
            } else if (num === 18) {
                return bip39.generateMnemonic(192, null, bip39.wordlists.spanish);
            } else if (num === 21) {
                return bip39.generateMnemonic(224, null, bip39.wordlists.spanish);
            } else if (num === 24) {
                return bip39.generateMnemonic(256, null, bip39.wordlists.spanish);
            } else {
                return 'unsupported';
            }
        default:
            return 'unsupported';
    }
}

/**
 * 助记词编码
 * @param mnemonic
 * @param language
 */
export function mnemonicToEntropy (mnemonic: string, language: string) {
    switch (language) {
        case 'chinese_simplified':
            return bip39.mnemonicToEntropy(mnemonic, bip39.wordlists.chinese_simplified);
        case 'chinese_traditional':
            return bip39.mnemonicToEntropy(mnemonic, bip39.wordlists.chinese_traditional);
        case 'english':
            return bip39.mnemonicToEntropy(mnemonic, bip39.wordlists.english);
        case 'french':
            return bip39.mnemonicToEntropy(mnemonic, bip39.wordlists.french);
        case 'italian':
            return bip39.mnemonicToEntropy(mnemonic, bip39.wordlists.italian);
        case 'japanese':
            return bip39.mnemonicToEntropy(mnemonic, bip39.wordlists.japanese);
        case 'korean':
            return bip39.mnemonicToEntropy(mnemonic, bip39.wordlists.korean);
        case 'spanish':
            return bip39.mnemonicToEntropy(mnemonic, bip39.wordlists.spanish);
        default:
            return 'unsupported';
    }
}

/**
 * 助记词解码
 * @param encrytMnemonic
 * @param language
 */
export function entropyToMnemonic (encrytMnemonic:string, language:string) {
    switch (language) {
        case 'chinese_simplified':
            return bip39.entropyToMnemonic(encrytMnemonic, bip39.wordlists.chinese_simplified);
        case 'chinese_traditional':
            return bip39.entropyToMnemonic(encrytMnemonic, bip39.wordlists.chinese_traditional);
        case 'english':
            return bip39.entropyToMnemonic(encrytMnemonic, bip39.wordlists.english);
        case 'french':
            return bip39.entropyToMnemonic(encrytMnemonic, bip39.wordlists.french);
        case 'italian':
            return bip39.entropyToMnemonic(encrytMnemonic, bip39.wordlists.italian);
        case 'japanese':
            return bip39.entropyToMnemonic(encrytMnemonic, bip39.wordlists.japanese);
        case 'korean':
            return bip39.entropyToMnemonic(encrytMnemonic, bip39.wordlists.korean);
        case 'spanish':
            return bip39.entropyToMnemonic(encrytMnemonic, bip39.wordlists.spanish);
        default:
            return 'unsupported';
    }
}

/**
 * 生成种子私钥 masterKey
 * @param mnemonic
 * @param password
 */
export function mnemonicToSeed (mnemonic:any, password:string) {
    return bip39.mnemonicToSeed(mnemonic, password);
}

export function mnemonicToSeedSync (mnemonic:any, password:string) {
    return bip39.mnemonicToSeedSync(mnemonic, password);
}

/**
 * 验证助记词
 * @param mnemonic
 * @param language
 */
export function validateMnemonic (mnemonic:any, language:string) {
    switch (language) {
        case 'chinese_simplified':
            return bip39.validateMnemonic(mnemonic, bip39.wordlists.chinese_simplified);
        case 'chinese_traditional':
            return bip39.validateMnemonic(mnemonic, bip39.wordlists.chinese_traditional);
        case 'english':
            return bip39.validateMnemonic(mnemonic, bip39.wordlists.english);
        case 'french':
            return bip39.validateMnemonic(mnemonic, bip39.wordlists.french);
        case 'italian':
            return bip39.validateMnemonic(mnemonic, bip39.wordlists.italian);
        case 'japanese':
            return bip39.validateMnemonic(mnemonic, bip39.wordlists.japanese);
        case 'korean':
            return bip39.validateMnemonic(mnemonic, bip39.wordlists.korean);
        case 'spanish':
            return bip39.validateMnemonic(mnemonic, bip39.wordlists.spanish);
        default:
            return 'unsupported';
    }
}