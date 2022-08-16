"use strict";
var _a;
exports.__esModule = true;
exports.getKeyDetails = exports.getPolicyAddress = exports.getAddressOne = exports.getBaseAddress = exports.getUtxoPrivateKey = exports.getUtxoPublicKey = exports.getPrivateKey = exports.getPublicKey = exports.getRootKey = void 0;
var bip39_1 = require("bip39");
var CardanoWASM = require("@emurgo/cardano-serialization-lib-nodejs");
var axiosSDK = require("axios");
var axios = axiosSDK["default"];
var entropy = (0, bip39_1.mnemonicToEntropy)(["crouch", "sister", "metal", "holiday", "cricket", "credit", "system", "short", "cry", "muscle", "artist", "skill", "drop", "box", "spice"].join(' '));
var getRootKey = function () {
    var rootKey = CardanoWASM.Bip32PrivateKey.from_bip39_entropy(Buffer.from(entropy, 'hex'), Buffer.from(''));
    return rootKey;
};
exports.getRootKey = getRootKey;
var getPublicKey = function () {
    var keyDetails = (0, exports.getKeyDetails)();
    return keyDetails.publicKey;
};
exports.getPublicKey = getPublicKey;
var getPrivateKey = function () {
    var keyDetails = (0, exports.getKeyDetails)();
    return keyDetails.privateKey;
};
exports.getPrivateKey = getPrivateKey;
var getUtxoPublicKey = function () {
    var keyDetails = (0, exports.getKeyDetails)();
    return keyDetails.utxoPubKey;
};
exports.getUtxoPublicKey = getUtxoPublicKey;
var getUtxoPrivateKey = function () {
    var keyDetails = (0, exports.getKeyDetails)();
    return keyDetails.utxoPrivateKey;
};
exports.getUtxoPrivateKey = getUtxoPrivateKey;
var getBaseAddress = function () {
    var keyDetails = (0, exports.getKeyDetails)();
    var baseAddr = CardanoWASM.BaseAddress["new"](CardanoWASM.NetworkInfo.testnet().network_id(), CardanoWASM.StakeCredential.from_keyhash(keyDetails.utxoPubKey.to_raw_key().hash()), CardanoWASM.StakeCredential.from_keyhash(keyDetails.stakeKey.to_raw_key().hash()));
    return baseAddr;
};
exports.getBaseAddress = getBaseAddress;
var getAddressOne = function () {
    var keyDetails = (0, exports.getKeyDetails)();
    var baseAddr = CardanoWASM.BaseAddress["new"](CardanoWASM.NetworkInfo.testnet().network_id(), CardanoWASM.StakeCredential.from_keyhash(keyDetails.utxoPubKey1.to_raw_key().hash()), CardanoWASM.StakeCredential.from_keyhash(keyDetails.stakeKey.to_raw_key().hash()));
    return baseAddr;
};
exports.getAddressOne = getAddressOne;
var getPolicyAddress = function () {
    var keyDetails = (0, exports.getKeyDetails)();
    var policyAddress = CardanoWASM.BaseAddress["new"](CardanoWASM.NetworkInfo.testnet().network_id(), CardanoWASM.StakeCredential.from_keyhash(keyDetails.utxoPrivateKey.to_public().hash()), CardanoWASM.StakeCredential.from_keyhash(keyDetails.utxoPrivateKey.to_public().hash()));
    return policyAddress;
};
exports.getPolicyAddress = getPolicyAddress;
// const testPriveAddress = CardanoWASM.Bip32PrivateKey.from_bech32("ed25519e_sk16rl5fqqf4mg27syjzjrq8h3vq44jnnv52mvyzdttldszjj7a64xtmjwgjtfy25lu0xmv40306lj9pcqpa6slry9eh3mtlqvfjz93vuq0grl80")
// export const getSpecialExampleAddress = () => {
//     const specialAddress = CardanoWASM.BaseAddress.new(
//         CardanoWASM.NetworkInfo.testnet().network_id(),
//         CardanoWASM.StakeCredential.from_keyhash(testPriveAddress.to_public().to_raw_key().hash()),
//         CardanoWASM.StakeCredential.from_keyhash(testPriveAddress.to_public().to_raw_key().hash()),
//     );
//     return specialAddress;
// }
var getKeyDetails = function () {
    var rootKey = (0, exports.getRootKey)();
    var privateKey = rootKey.to_raw_key();
    //const publicKey = rootKey.to_public().to_raw_key();
    var publicKey = rootKey.to_public();
    var accountKey = rootKey
        .derive(harden(1852)) // purpose -> 1852 = Ecosystem Cardano (Shelley)
        .derive(harden(1815)) // coin type -> 1815 = ADA
        .derive(harden(0)); // account #0 -> change to different account
    var utxoPubKey = accountKey
        .derive(0) // external always 0
        .derive(0) // address index: 0
        .to_public();
    var utxoPrivateKey = accountKey
        .derive(0) // external always 0
        .derive(0)
        .to_raw_key();
    var utxoPubKey1 = accountKey
        .derive(0) // external always 0
        .derive(1) // address index: 1 
        .to_public();
    var stakeKey = accountKey
        .derive(2) // chimeric
        .derive(0)
        .to_public();
    return { privateKey: privateKey, publicKey: publicKey, utxoPrivateKey: utxoPrivateKey, utxoPubKey: utxoPubKey, utxoPubKey1: utxoPubKey1, stakeKey: stakeKey };
};
exports.getKeyDetails = getKeyDetails;
function harden(num) {
    return 0x80000000 + num;
}
var policyKeyHash = (_a = CardanoWASM.BaseAddress.from_address((0, exports.getPolicyAddress)().to_address())) === null || _a === void 0 ? void 0 : _a.payment_cred().to_keyhash();
console.log("message = " + entropy);
console.log("address 0 = " + (0, exports.getBaseAddress)().to_address().to_bech32());
console.log("private key = " + (0, exports.getKeyDetails)().privateKey.to_bech32());
console.log("public key = " + (0, exports.getKeyDetails)().publicKey.to_bech32());
console.log("utxo address public 0 = " + (0, exports.getKeyDetails)().utxoPubKey.to_bech32());
console.log("utxo address private 0 = " + (0, exports.getKeyDetails)().utxoPrivateKey.to_bech32());
console.log("utxo address private to public 0 = " + (0, exports.getKeyDetails)().utxoPrivateKey.to_public().to_bech32());
console.log("policy key hash = " + Buffer.from(policyKeyHash.to_bytes()).toString("hex"));
