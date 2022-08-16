"use strict";
exports.__esModule = true;
exports.composeNFT = void 0;
var CardanoWasm = require("@emurgo/cardano-serialization-lib-nodejs");
var composeNFT = function (policyKeyHash, address, utxos, protocolParameters, assetName, metadata, mintScript, ttl) {
    var _a;
    if (!utxos || utxos.length === 0) {
        throw Error('No utxo on address ' + address);
    }
    var txBuilder = CardanoWasm.TransactionBuilder["new"](CardanoWasm.TransactionBuilderConfigBuilder["new"]()
        .fee_algo(CardanoWasm.LinearFee["new"](CardanoWasm.BigNum.from_str(protocolParameters.min_fee_a.toString()), CardanoWasm.BigNum.from_str(protocolParameters.min_fee_b.toString())))
        .pool_deposit(CardanoWasm.BigNum.from_str(protocolParameters.pool_deposit.toString()))
        .key_deposit(CardanoWasm.BigNum.from_str(protocolParameters.key_deposit.toString()))
        .coins_per_utxo_byte(CardanoWasm.BigNum.from_str((34482).toString())) //(protocolParameters.coins_per_utxo_size ?? 34482).toString()))
        .coins_per_utxo_word(CardanoWasm.BigNum.from_str((34482).toString())) //(protocolParameters.coins_per_utxo_word ?? 34482).toString())) 
        .max_value_size(Number(protocolParameters.max_val_size))
        .max_tx_size(protocolParameters.max_tx_size)
        .build());
    var changeAddr = CardanoWasm.Address.from_bech32(address);
    // Timelock
    txBuilder.set_ttl(ttl);
    // Filter out multi asset utxo to keep this simple
    var lovelaceUtxos = utxos.filter(function (u) { return !u.amount.find(function (a) { return a.unit !== 'lovelace'; }); });
    //Create TransactionUnspentOutputs from utxos fetched from Blockfrost
    var unspentOutputs = CardanoWasm.TransactionUnspentOutputs["new"]();
    for (var _i = 0, lovelaceUtxos_1 = lovelaceUtxos; _i < lovelaceUtxos_1.length; _i++) {
        var utxo = lovelaceUtxos_1[_i];
        var amount = (_a = utxo.amount.find(function (a) { return a.unit === 'lovelace'; })) === null || _a === void 0 ? void 0 : _a.quantity;
        if (!amount)
            continue;
        var inputValue = CardanoWasm.Value["new"](CardanoWasm.BigNum.from_str(amount.toString()));
        var input = CardanoWasm.TransactionInput["new"](CardanoWasm.TransactionHash.from_bytes(Buffer.from(utxo.tx_hash, 'hex')), utxo.output_index);
        var output = CardanoWasm.TransactionOutput["new"](changeAddr, inputValue);
        unspentOutputs.add(CardanoWasm.TransactionUnspentOutput["new"](input, output));
    }
    txBuilder.add_inputs_from(unspentOutputs, CardanoWasm.CoinSelectionStrategyCIP2.LargestFirst);
    txBuilder.add_json_metadatum(CardanoWasm.BigNum.from_str("721"), JSON.stringify(metadata));
    var assetNameStr = CardanoWasm.AssetName["new"](Buffer.from(assetName, 'utf-8'));
    var assetNumber = CardanoWasm.Int.new_i32(1);
    txBuilder.add_mint_asset_and_output_min_required_coin(mintScript, // NOTE - passing the script here
    assetNameStr, assetNumber, CardanoWasm.TransactionOutputBuilder["new"]().with_address(changeAddr).next());
    // Adds a change output if there are more ADA in utxo than we need for the transaction,
    // these coins will be returned to change address
    txBuilder.add_change_if_needed(changeAddr);
    // Build transaction
    //const txBody = txBuilder.build();
    var txUnsigned = txBuilder.build_tx();
    var txHash = Buffer.from(CardanoWasm.hash_transaction(txUnsigned.body()).to_bytes()).toString('hex');
    return {
        txHash: txHash,
        //txBody,
        txUnsigned: txUnsigned
    };
};
exports.composeNFT = composeNFT;
