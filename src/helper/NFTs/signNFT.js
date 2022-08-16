"use strict";
exports.__esModule = true;
exports.signTransactionNFT = void 0;
var CardanoWasm = require("@emurgo/cardano-serialization-lib-nodejs");
var signTransactionNFT = function (txUnsigned, signKey, policy) {
    var _a, _b;
    var txHash = CardanoWasm.hash_transaction(txUnsigned.body());
    var witnesses = (_a = txUnsigned.witness_set()) !== null && _a !== void 0 ? _a : CardanoWasm.TransactionWitnessSet["new"](); // NOTE - getting witnesses from the tx here
    var vkeyWitnesses = (_b = witnesses.vkeys()) !== null && _b !== void 0 ? _b : CardanoWasm.Vkeywitnesses["new"]();
    vkeyWitnesses.add(CardanoWasm.make_vkey_witness(txHash, signKey));
    vkeyWitnesses.add(CardanoWasm.make_vkey_witness(txHash, policy.privateKey));
    witnesses.set_vkeys(vkeyWitnesses);
    var transaction = CardanoWasm.Transaction["new"](txUnsigned.body(), witnesses, txUnsigned.auxiliary_data());
    return transaction;
};
exports.signTransactionNFT = signTransactionNFT;
