"use strict";
exports.__esModule = true;
exports.signTransactionNFT = void 0;
var CardanoWasm = require("@emurgo/cardano-serialization-lib-nodejs");
var signTransactionNFT = function (txUnsigned, 
//txBody: CardanoWasm.TransactionBody,
signKey, policy, mintScript) {
    var _a;
    var txHash = CardanoWasm.hash_transaction(txUnsigned.body());
    //const witnesses = CardanoWasm.TransactionWitnessSet.new();
    var witnesses = txUnsigned.witness_set(); // NOTE - getting witnesses from the tx here
    var vkeyWitnesses = (_a = witnesses.vkeys()) !== null && _a !== void 0 ? _a : CardanoWasm.Vkeywitnesses["new"]();
    vkeyWitnesses.add(CardanoWasm.make_vkey_witness(txHash, signKey));
    vkeyWitnesses.add(CardanoWasm.make_vkey_witness(txHash, policy.privateKey));
    witnesses.set_vkeys(vkeyWitnesses);
    //const transactionWitnessSet = txUnsigned.witness_set() // NOTE - getting witnesses from the tx here
    // witnesses.set_native_scripts;
    // const witnessScripts = CardanoWasm.NativeScripts.new();
    // witnessScripts.add(mintScript);
    // witnesses.set_native_scripts(witnessScripts);
    //transactionWitnessSet.set_vkeys(witnesses.vkeys()!)
    //const transaction = CardanoWasm.Transaction.new(txUnsigned.body(), witnesses, txUnsigned.auxiliary_data());
    var transaction = CardanoWasm.Transaction["new"](txUnsigned.body(), witnesses, txUnsigned.auxiliary_data());
    return transaction;
};
exports.signTransactionNFT = signTransactionNFT;
