const bip39 = require('bip39');
const crypto = require('crypto');
const {createMnemonic,
    mnemonicToEntropy,
    entropyToMnemonic,
    mnemonicToSeed,
    validateMnemonic
} = require('../src/common/bip39');
const wasi = require("node:wasi");


describe('bip39 test', () => {

    /**
     * 助记词生成
     *     1.随机熵生成
     *     首先生成一段随机熵（Entropy）。熵的长度可以是 128 到 256 位，并且是 32 的倍数。常见的熵长度有 128 位（12 个助记词）和 256 位（24 个助记词）。
     *     2.计算校验和
     *     对熵进行 SHA-256 哈希计算，并取哈希值的前几位作为校验和。校验和的长度取决于熵的长度。例如，128 位熵需要 4 位校验和（因为 128 / 32 = 4），256 位熵需要 8 位校验和。
     *     3.组合熵和校验
     *     将校验和附加到熵的末尾，形成一个新的二进制序列。这个序列的总长度为 (熵的长度 + 校验和的长度)。
     *     4.分割为助记词索引
     *     将组合后的二进制序列分割成每组 11 位的片段，每个片段转换为一个数字，这个数字作为助记词列表中的索引。
     *     5.映射为助记词
     *     使用这些索引从预定义的 2048 个助记词列表（BIP-39 词库）中提取相应的助记词。这些助记词就是最终的助记词短语。
     */
    test('generateMnemonic', async () => {
        // 1. 生成 128 位随机熵 12 15 18 21 24
        const entropy = crypto.randomBytes(16); // 128 位是 16 字节

        // 2. 计算校验和 (SHA-256)
        const hash = crypto.createHash('sha256').update(entropy).digest();
        const checksum = hash[0] >> 4; // 取前 4 位

        // 3. 组合熵和校验和
        let bits = '';
        for (let i = 0; i < entropy.length; i++) {
            bits += entropy[i].toString(2).padStart(8, '0');
        }
        bits += checksum.toString(2).padStart(4, '0');

        // 4. 分割为助记词索引
        const indices = [];
        for (let i = 0; i < bits.length; i += 11) {
            const index = parseInt(bits.slice(i, i + 11), 2);
            indices.push(index);
        }

        // 5. 映射为助记词
        const wordlist = bip39.wordlists.english;
        const mnemonic = indices.map(index => wordlist[index]).join(' ');

        console.log(mnemonic);

    });


    /**
     * crypto.getRandomValues must be defined 问题
     * 新版本无需操作 需要修改源码方法为 require('crypto').randomFillSync(new Uint8Array(bytesLength))
     */
    test('test create mnemonic', async one => {

        // 生成助记词
        const english_mnemonic = createMnemonic(12,"english")
        console.log(english_mnemonic);

        // 验证助记词
        const flg = validateMnemonic(english_mnemonic,"english")
        console.log("flg === ",flg)

        // 对助记词进行编码，数据库保存
        const encrpytCode = mnemonicToEntropy(english_mnemonic, "english")
        console.log(encrpytCode);  // 1075d6d2463c34e610adc2b9d8ca29ea

        // 解码助记词
        const decodeCode = entropyToMnemonic(encrpytCode, "english")
        console.log(decodeCode)

        // 生成种子 masterkey 可生成 childkey（由index地址编号生成对应的privitekey） 再由 childkye 生成对应的 publickey 再用publickey自定义去生成地址
        const seed =  await mnemonicToSeed(english_mnemonic, "")
        console.log(seed)  // Bip32 导出 rootKey

    })

})