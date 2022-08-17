"use strict";
exports.__esModule = true;
var axiosSDK = require("axios");
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
        headers: { 'project_id': 'testnetQuSkTOc0XLpq70fRJUEM5R0PXQyVa2fr' }
    };
    axios(configLastBlockBlockfrost).then(function (resp) {
        console.log("Latest block infos on the Cardano blockChain = " + JSON.stringify(resp.data));
        //getUTXOsFromAddress(1000000, getBaseAddress().to_address().to_bech32())
    })["catch"](function (error) {
        console.log("Latest block infos on the Cardano blockChain ERROR = " + error.data);
    });
}
function getUTXOsFromAddress(fees, addrss_bech32) {
    var configUTXOsAddressBlockfrost = {
        method: 'get',
        url: 'https://cardano-testnet.blockfrost.io/api/v0/addresses/' + addrss_bech32 + '/utxos',
        headers: { 'project_id': 'testnetQuSkTOc0XLpq70fRJUEM5R0PXQyVa2fr' }
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
        headers: { 'project_id': 'testnetQuSkTOc0XLpq70fRJUEM5R0PXQyVa2fr' }
    };
    axios(configProtocolBlockfrost).then(function (resp) {
        //console.log("latest protocol params Cardano blockChain = " + JSON.stringify(resp.data));
        console.log("min fee " + resp.data.min_fee_a);
    })["catch"](function (error) {
        //console.log("latest protocol params Cardano blockChain = " + error.data);
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
        headers: { 'project_id': 'testnetQuSkTOc0XLpq70fRJUEM5R0PXQyVa2fr',
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
        headers: { 'project_id': 'testnetQuSkTOc0XLpq70fRJUEM5R0PXQyVa2fr' }
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
        headers: { 'project_id': 'testnetQuSkTOc0XLpq70fRJUEM5R0PXQyVa2fr' }
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
