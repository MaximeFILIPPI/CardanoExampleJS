"use strict";
exports.__esModule = true;
exports.signTransaction = void 0;
var CardanoWasm = require("@emurgo/cardano-serialization-lib-nodejs");
var signTransaction = function (txBody, signKey) {
    var txHash = CardanoWasm.hash_transaction(txBody);
    var witnesses = CardanoWasm.TransactionWitnessSet["new"]();
    var vkeyWitnesses = CardanoWasm.Vkeywitnesses["new"]();
    vkeyWitnesses.add(CardanoWasm.make_vkey_witness(txHash, signKey));
    witnesses.set_vkeys(vkeyWitnesses);
    var transaction = CardanoWasm.Transaction["new"](txBody, witnesses);
    // can add metadata after witenesses
    return transaction;
};
exports.signTransaction = signTransaction;
