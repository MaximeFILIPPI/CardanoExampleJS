"use strict";
exports.__esModule = true;
exports.composeTransaction = void 0;
var CardanoWasm = require("@emurgo/cardano-serialization-lib-nodejs");
var composeTransaction = function (address, outputAddress, outputAmount, utxos, ttl, protocolParameters) {
    var _a, _b, _c;
    if (!utxos || utxos.length === 0) {
        throw Error('No utxo on address ' + address);
    }
    var txBuilder = CardanoWasm.TransactionBuilder["new"](CardanoWasm.TransactionBuilderConfigBuilder["new"]()
        .fee_algo(CardanoWasm.LinearFee["new"](CardanoWasm.BigNum.from_str(protocolParameters.min_fee_a.toString()), CardanoWasm.BigNum.from_str(protocolParameters.min_fee_b.toString())))
        .pool_deposit(CardanoWasm.BigNum.from_str(protocolParameters.pool_deposit.toString()))
        .key_deposit(CardanoWasm.BigNum.from_str(protocolParameters.key_deposit.toString()))
        .coins_per_utxo_byte(CardanoWasm.BigNum.from_str(((_a = protocolParameters.coins_per_utxo_size) !== null && _a !== void 0 ? _a : 34482).toString()))
        .coins_per_utxo_word(CardanoWasm.BigNum.from_str(((_b = protocolParameters.coins_per_utxo_word) !== null && _b !== void 0 ? _b : 34482).toString()))
        .max_value_size(Number(protocolParameters.max_val_size))
        .max_tx_size(protocolParameters.max_tx_size)
        .build());
    var outputAddr = CardanoWasm.Address.from_bech32(outputAddress);
    var changeAddr = CardanoWasm.Address.from_bech32(address);
    txBuilder.set_ttl(ttl);
    // Add output to the tx
    txBuilder.add_output(CardanoWasm.TransactionOutput["new"](outputAddr, CardanoWasm.Value["new"](CardanoWasm.BigNum.from_str(outputAmount))));
    // Filter out multi asset utxo to keep this simple
    var lovelaceUtxos = utxos.filter(function (u) { return !u.amount.find(function (a) { return a.unit !== 'lovelace'; }); });
    // Create TransactionUnspentOutputs from utxos fetched from Blockfrost
    var unspentOutputs = CardanoWasm.TransactionUnspentOutputs["new"]();
    for (var _i = 0, lovelaceUtxos_1 = lovelaceUtxos; _i < lovelaceUtxos_1.length; _i++) {
        var utxo = lovelaceUtxos_1[_i];
        var amount = (_c = utxo.amount.find(function (a) { return a.unit === 'lovelace'; })) === null || _c === void 0 ? void 0 : _c.quantity;
        if (!amount)
            continue;
        var inputValue = CardanoWasm.Value["new"](CardanoWasm.BigNum.from_str(amount.toString()));
        var input = CardanoWasm.TransactionInput["new"](CardanoWasm.TransactionHash.from_bytes(Buffer.from(utxo.tx_hash, 'hex')), utxo.output_index);
        var output = CardanoWasm.TransactionOutput["new"](changeAddr, inputValue);
        unspentOutputs.add(CardanoWasm.TransactionUnspentOutput["new"](input, output));
    }
    txBuilder.add_inputs_from(unspentOutputs, CardanoWasm.CoinSelectionStrategyCIP2.LargestFirst);
    // Adds a change output if there are more ADA in utxo than we need for the transaction,
    // these coins will be returned to change address
    txBuilder.add_change_if_needed(changeAddr);
    // Build transaction
    var txBody = txBuilder.build();
    var txHash = Buffer.from(CardanoWasm.hash_transaction(txBody).to_bytes()).toString('hex');
    return {
        txHash: txHash,
        txBody: txBody
    };
};
exports.composeTransaction = composeTransaction;
