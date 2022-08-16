"use strict";
exports.__esModule = true;
exports.mnemonicToPrivateKey = exports.deriveAddressPrvKey = void 0;
var CardanoWasm = require("@emurgo/cardano-serialization-lib-nodejs");
var bip39_1 = require("bip39");
var harden = function (num) {
    return 0x80000000 + num;
};
var deriveAddressPrvKey = function (bipPrvKey, testnet, addressIndex) {
    var networkId = testnet
        ? CardanoWasm.NetworkInfo.testnet().network_id()
        : CardanoWasm.NetworkInfo.mainnet().network_id();
    var accountIndex = 0;
    //const addressIndex = 0;
    var accountKey = bipPrvKey
        .derive(harden(1852)) // purpose
        .derive(harden(1815)) // coin type
        .derive(harden(accountIndex)); // account #
    var utxoKey = accountKey
        .derive(0) // external
        .derive(addressIndex);
    var stakeKey = accountKey
        .derive(2) // chimeric
        .derive(0)
        .to_public();
    var baseAddress = CardanoWasm.BaseAddress["new"](networkId, CardanoWasm.StakeCredential.from_keyhash(utxoKey.to_public().to_raw_key().hash()), CardanoWasm.StakeCredential.from_keyhash(stakeKey.to_raw_key().hash()));
    var address = baseAddress.to_address().to_bech32();
    return { signKey: utxoKey.to_raw_key(), address: address };
};
exports.deriveAddressPrvKey = deriveAddressPrvKey;
var mnemonicToPrivateKey = function (mnemonic) {
    var entropy = (0, bip39_1.mnemonicToEntropy)(mnemonic);
    var rootKey = CardanoWasm.Bip32PrivateKey.from_bip39_entropy(Buffer.from(entropy, 'hex'), Buffer.from(''));
    return rootKey;
};
exports.mnemonicToPrivateKey = mnemonicToPrivateKey;
