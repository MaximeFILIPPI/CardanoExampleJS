"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var CardanoWASM = require("@emurgo/cardano-serialization-lib-nodejs");
var axiosSDK = require("axios");
var walletManager_1 = require("./walletManager");
var axios = axiosSDK["default"];
function getLastBlockData() {
    // // get current global slot from yoroi backend
    // const { data: slotData } = await axios.get(
    //     "https://testnet-backend.yoroiwallet.com/api/v2/bestblock"
    // );
    //const ttl = slotData.globalSlot + 60 * 60 * 2; // two hours from now
    var configLastBlockBlockfrost = {
        method: 'get',
        url: 'https://cardano-testnet.blockfrost.io/api/v0/blocks/latest',
        headers: { 'project_id': 'testnetByg9CqH6pKiCG8shQuXCbXy3cpN4fzgd' }
    };
    axios(configLastBlockBlockfrost).then(function (resp) {
        console.log("Latest block infos on the Cardano blockChain = " + JSON.stringify(resp.data));
        getUTXOsFromAddress(1000000, (0, walletManager_1.getBaseAddress)().to_address().to_bech32());
    })["catch"](function (error) {
        console.log("Latest block infos on the Cardano blockChain ERROR = " + error.data);
    });
}
function getUTXOsFromAddress(fees, addrss_bech32) {
    var configUTXOsAddressBlockfrost = {
        method: 'get',
        url: 'https://cardano-testnet.blockfrost.io/api/v0/addresses/' + addrss_bech32 + '/utxos',
        headers: { 'project_id': 'testnetByg9CqH6pKiCG8shQuXCbXy3cpN4fzgd' }
    };
    axios(configUTXOsAddressBlockfrost).then(function (resp) {
        console.log("all UTXOs for address " + addrss_bech32 + " on the Cardano blockChain = " + JSON.stringify(resp.data));
        //console.log("hash first address " + resp.data.tx_hash)
        //createTransaction(resp.data.min_fee_a, resp.data.min_fee_b, resp.data.pool_deposit, resp.data.key_deposit,resp.data.max_val_size, resp.data.max_tx_size, resp.data.coins_per_utxo_word);
        var utxo = null;
        var amountUtxo = null;
        if (resp.data) {
            for (var _i = 0, _a = resp.data; _i < _a.length; _i++) {
                var utxoEntry = _a[_i];
                for (var _b = 0, _c = utxoEntry.amount; _b < _c.length; _b++) {
                    var amountEntry = _c[_b];
                    if (amountEntry.unit == "lovelace") {
                        if (amountEntry.quantity > fees) {
                            utxo = utxoEntry;
                            amountUtxo = amountEntry.quantity;
                        }
                    }
                }
                // if (utxoEntry.amount > fees) 
                // {
                //     utxo = utxoEntry;
                // }
            }
        }
        if (utxo === null || amountUtxo == null) {
            throw new Error("no utxo found with sufficient ADA.");
        }
        console.log("chosen UTXO -> " + JSON.stringify(utxo) + " / quantity = " + amountUtxo);
        //getProtocolParameters(utxo, amountUtxo);
    })["catch"](function (error) {
        console.log("error to find UTXOs for address " + addrss_bech32 + " on the Cardano blockChain = " + error);
    });
}
function getProtocolParameters(utxoSelected, utxoAmount) {
    var configProtocolBlockfrost = {
        method: 'get',
        url: 'https://cardano-testnet.blockfrost.io/api/v0/epochs/latest/parameters',
        headers: { 'project_id': 'testnetByg9CqH6pKiCG8shQuXCbXy3cpN4fzgd' }
    };
    axios(configProtocolBlockfrost).then(function (resp) {
        //console.log("latest protocol params Cardano blockChain = " + JSON.stringify(resp.data));
        console.log("min fee " + resp.data.min_fee_a);
        createTransaction(utxoSelected, utxoAmount, resp.data.min_fee_a, resp.data.min_fee_b, resp.data.pool_deposit, resp.data.key_deposit, resp.data.max_val_size, resp.data.max_tx_size, resp.data.coins_per_utxo_word);
    })["catch"](function (error) {
        //console.log("latest protocol params Cardano blockChain = " + error.data);
    });
}
function createTransaction(utxoSelected, utxoAmount, minFeeA, minFeeB, poolDeposit, keyDeposit, maxValSize, maxTxSize, coinPerUTXOWord) {
    return __awaiter(this, void 0, void 0, function () {
        var linearFee, transactionConfig, transactionBuilder, ownerPrivateKey, transactionInput, valueInput, shelleyOutputAddress, shelleyChangeAddress, valueOutput, transactionOutput, transactionBody, newTransactionHash, witnesses, vkeyWitnesses, vkeyWitness, transaction, signedTransaction;
        return __generator(this, function (_a) {
            linearFee = CardanoWASM.LinearFee["new"](CardanoWASM.BigNum.from_str(minFeeA.toString()), CardanoWASM.BigNum.from_str(minFeeB.toString()));
            console.log("create transaciton step: 1 = OK");
            transactionConfig = CardanoWASM.TransactionBuilderConfigBuilder["new"]()
                .fee_algo(linearFee)
                .pool_deposit(CardanoWASM.BigNum.from_str(poolDeposit.toString()))
                .key_deposit(CardanoWASM.BigNum.from_str(keyDeposit.toString()))
                .max_value_size(maxValSize)
                .max_tx_size(maxTxSize)
                .coins_per_utxo_word(CardanoWASM.BigNum.from_str(coinPerUTXOWord.toString()))
                .build();
            console.log("create transaciton step: 2 = OK");
            transactionBuilder = CardanoWASM.TransactionBuilder["new"](transactionConfig);
            console.log("create transaciton step: 3 = OK");
            ownerPrivateKey = CardanoWASM.PrivateKey.from_bech32((0, walletManager_1.getKeyDetails)().utxoPrivateKey.to_bech32());
            console.log("create transaciton step: 4.1 = OK / utxo hash = " + utxoSelected.tx_hash);
            transactionInput = CardanoWASM.TransactionInput["new"](CardanoWASM.TransactionHash.from_bytes(Buffer.from(utxoSelected.tx_hash, "hex")), utxoSelected.index);
            console.log("create transaciton step: 4.2 = OK");
            valueInput = CardanoWASM.Value["new"](CardanoWASM.BigNum.from_str('' + utxoAmount + ''));
            console.log("create transaciton step: 4.3 = OK");
            // Add key input to the build transaction
            transactionBuilder.add_key_input(ownerPrivateKey.to_public().hash(), transactionInput, valueInput);
            console.log("create transaciton step: 4.4 = OK");
            console.log("create transaciton step: 5 = OK");
            shelleyOutputAddress = CardanoWASM.Address.from_bech32("addr_test1qpvtnmsn3nyaqmf4h6rnnfzhjn7zqgezxzwka42vemffpl7j7t4m76efmvm7cjllcu9h3cvzca2980lr4ltwvu5n37ls70d4jh");
            shelleyChangeAddress = CardanoWASM.Address.from_bech32("addr_test1qr8wdvwjl6yf6cx6vcrk404cg9l8drfz4qv2w0wdryhdwswj7t4m76efmvm7cjllcu9h3cvzca2980lr4ltwvu5n37ls7hd6yp");
            console.log("create transaciton step: 6 = OK");
            valueOutput = CardanoWASM.Value["new"](CardanoWASM.BigNum.from_str('2000000'));
            transactionOutput = CardanoWASM.TransactionOutput["new"](shelleyOutputAddress, valueOutput);
            // Transaction output
            transactionBuilder.add_output(transactionOutput);
            console.log("create transaciton step: 7 = OK");
            // calculate the min fee required and send any change to an address
            transactionBuilder.add_change_if_needed(shelleyChangeAddress);
            // set the time to live - the absolute slot value before the tx becomes invalid
            transactionBuilder.set_ttl(66929569);
            console.log("create transaciton step: 8 = OK");
            transactionBody = transactionBuilder.build();
            newTransactionHash = CardanoWASM.hash_transaction(transactionBody);
            witnesses = CardanoWASM.TransactionWitnessSet["new"]();
            console.log("create transaciton step: 9 = OK");
            vkeyWitnesses = CardanoWASM.Vkeywitnesses["new"]();
            vkeyWitness = CardanoWASM.make_vkey_witness(newTransactionHash, ownerPrivateKey);
            vkeyWitnesses.add(vkeyWitness);
            witnesses.set_vkeys(vkeyWitnesses);
            console.log("create transaciton step: 10 = OK");
            transaction = CardanoWASM.Transaction["new"](transactionBody, witnesses, undefined);
            console.log("create transaciton step: 11 = OK");
            signedTransaction = Buffer.from(transaction.to_bytes()) //.toString("base64");
            ;
            console.log("transaction signed = " + signedTransaction);
            // let serializedTx = Buffer.from(transaction.to_bytes()).toString("hex");
            // console.log("transaction signed = " + serializedTx)
            // let finalTx = Buffer.from(serializedTx, 'hex')
            // console.log("transaction finalized = " + finalTx)
            submitTransaction(transaction.to_bytes());
            return [2 /*return*/];
        });
    });
}
function submitTransaction(signedTransaction) {
    var tx;
    if (typeof signedTransaction === 'string') {
        tx = Buffer.from(signedTransaction, 'hex');
    }
    else {
        tx = Buffer.from(signedTransaction);
    }
    var configSubmitTransactionBlockfrost = {
        method: 'post',
        url: 'https://cardano-testnet.blockfrost.io/api/v0/tx/submit',
        data: tx,
        headers: { 'project_id': 'testnetByg9CqH6pKiCG8shQuXCbXy3cpN4fzgd',
            'Content-Type': 'application/cbor' }
        //body: { signedTransaction }
        // body: {
        //     signedTransaction
        // }
    };
    //axios.post('https://cardano-testnet.blockfrost.io/api/v0/tx/submit', { tx }).then(resp => {
    axios(configSubmitTransactionBlockfrost).then(function (resp) {
        console.log("submitTransaction on the Cardano blockChain = " + JSON.stringify(resp.data));
        //console.log("hash first address " + resp.data.tx_hash)
        //createTransaction(resp.data.min_fee_a, resp.data.min_fee_b, resp.data.pool_deposit, resp.data.key_deposit,resp.data.max_val_size, resp.data.max_tx_size, resp.data.coins_per_utxo_word);
        //getProtocolParameters(resp.data);
    })["catch"](function (error) {
        console.log("ERROR submitTransaction on the Cardano blockChain ERROR = " + error + error.error + error.message);
    });
}
function getUTXOforTransaction(hashTransaction) {
    var configLastBlockBlockfrost = {
        method: 'get',
        url: 'https://cardano-testnet.blockfrost.io/api/v0/txs/' + hashTransaction + '/utxos',
        headers: { 'project_id': 'testnetByg9CqH6pKiCG8shQuXCbXy3cpN4fzgd' }
    };
    axios(configLastBlockBlockfrost).then(function (resp) {
        console.log("UTXO for transaction result = " + JSON.stringify(resp.data));
    })["catch"](function (error) {
        console.log("UTXO for transaction on the Cardano blockChain ERROR = " + error.data);
    });
}
function startWithProtocolParameters() {
    var configProtocolBlockfrost = {
        method: 'get',
        url: 'https://cardano-testnet.blockfrost.io/api/v0/epochs/latest/parameters',
        headers: { 'project_id': 'testnetByg9CqH6pKiCG8shQuXCbXy3cpN4fzgd' }
    };
    axios(configProtocolBlockfrost).then(function (resp) {
        //console.log("latest protocol params Cardano blockChain = " + JSON.stringify(resp.data));
        console.log("min fee " + resp.data.min_fee_a);
        //runTransaction(resp.data.min_fee_a, resp.data.min_fee_b, resp.data.pool_deposit, resp.data.key_deposit,resp.data.max_val_size, resp.data.max_tx_size, resp.data.coins_per_utxo_word);
    })["catch"](function (error) {
        //console.log("latest protocol params Cardano blockChain = " + error.data);
    });
}
//getUTXOforTransaction("40b9661f635fc384b62ac5e2862c3eb679ec461677c309e71df8049236ff8e57")
//getLastBlockData()
//getUTXOsFromAddress(getAddressOne().to_address().to_bech32());
getUTXOsFromAddress(30000000, "addr_test1qr9tdv6p44asg53ndd3dn8y2dyrey63llaum42mpemc9ztw2k6e5rttmq3frx6mzmxwg56g8jf4rllmeh24krnhs2yks6kkvua");
