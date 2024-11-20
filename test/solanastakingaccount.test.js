import {NonceAccount,Transaction} from "@solana/web3.js";
const bs58 = require('bs58');
const bip39 = require('bip39');
import {createAddress, importAddress, verifyAddressEd25519, createNormalWallet} from "../src/solana/address";
import {prepareNonceAccount, signTransaction} from "../src/solana/sign"

describe('solana staking account unit test', () => {

})