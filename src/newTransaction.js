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
var blockfrost_js_1 = require("@blockfrost/blockfrost-js");
var composeTransaction_1 = require("./helper/composeTransaction");
var signTransaction_1 = require("./helper/signTransaction");
var keys_1 = require("./helper/keys");
var TESTNET = true;
// BIP39 mnemonic (seed) from which we will generate address to retrieve utxo from and private key used for signing the transaction
var MNEMONIC = 'crouch sister metal holiday cricket credit system short cry muscle artist skill drop box spice';
// Recipient address (needs to be Bech32)
var OUTPUT_ADDRESS = 'addr_test1qpvtnmsn3nyaqmf4h6rnnfzhjn7zqgezxzwka42vemffpl7j7t4m76efmvm7cjllcu9h3cvzca2980lr4ltwvu5n37ls70d4jh';
// Amount sent to the recipient
var OUTPUT_AMOUNT = '2000000'; // 2 000 000 lovelaces = 5 ADA (cannot make a transaction with NFT under 1 ADA)
var client = new blockfrost_js_1.BlockFrostAPI({ projectId: TESTNET ? "testnetByg9CqH6pKiCG8shQuXCbXy3cpN4fzgd" : "testnetByg9CqH6pKiCG8shQuXCbXy3cpN4fzgd", isTestnet: TESTNET });
var runTransaction = function () { return __awaiter(void 0, void 0, void 0, function () {
    var bip32PrvKey, cardanoKeys, address, utxo, error_1, latestEpoch, protocolParameters, latestBlock, currentSlot, ttl, _a, txHash, txBody, transaction, txSize, estimatedFees, res, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                bip32PrvKey = (0, keys_1.mnemonicToPrivateKey)(MNEMONIC);
                cardanoKeys = (0, keys_1.deriveAddressPrvKey)(bip32PrvKey, TESTNET, 0).cardanoKeys;
                address = cardanoKeys.addrIndexBech32;
                console.log('Using address ' + address);
                utxo = [];
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, client.addressesUtxosAll(address)];
            case 2:
                utxo = _b.sent();
                return [3 /*break*/, 4];
            case 3:
                error_1 = _b.sent();
                if (error_1 instanceof blockfrost_js_1.BlockfrostServerError && error_1.status_code === 404) {
                    // Address derived from the seed was not used yet
                    // In this case Blockfrost API will return 404
                    utxo = [];
                }
                else {
                    throw error_1;
                }
                return [3 /*break*/, 4];
            case 4:
                if (utxo.length === 0) {
                    console.log();
                    console.log('You should send ADA to ${address} to have enough funds to sent a transaction');
                    console.log();
                }
                console.log('UTXO on ' + address);
                console.log(JSON.stringify(utxo, undefined, 4));
                return [4 /*yield*/, client.epochsLatest()];
            case 5:
                latestEpoch = _b.sent();
                console.log('latest epoch = ' + latestEpoch.epoch);
                return [4 /*yield*/, client.epochsParameters(latestEpoch.epoch)];
            case 6:
                protocolParameters = _b.sent();
                console.log('latest parameters = ' + protocolParameters);
                return [4 /*yield*/, client.blocksLatest()];
            case 7:
                latestBlock = _b.sent();
                currentSlot = latestBlock.slot;
                if (!currentSlot) {
                    throw Error('Failed to fetch slot number');
                }
                ttl = currentSlot + 7200;
                _a = (0, composeTransaction_1.composeTransaction)(address, OUTPUT_ADDRESS, OUTPUT_AMOUNT, utxo, ttl, protocolParameters), txHash = _a.txHash, txBody = _a.txBody;
                transaction = (0, signTransaction_1.signTransaction)(txBody, cardanoKeys.addrIndexSignKey);
                txSize = transaction.to_bytes().length;
                estimatedFees = (protocolParameters.min_fee_b / 1000000) + (protocolParameters.min_fee_a / 1000000) * (Number(txSize));
                console.log('estimated fees = ' + estimatedFees);
                _b.label = 8;
            case 8:
                _b.trys.push([8, 10, , 11]);
                return [4 /*yield*/, client.txSubmit(transaction.to_bytes())];
            case 9:
                res = _b.sent();
                if (res) {
                    console.log("Transaction successfully submitted: " + txHash);
                }
                return [3 /*break*/, 11];
            case 10:
                error_2 = _b.sent();
                // submit could fail if the transactions is rejected by cardano node
                if (error_2 instanceof blockfrost_js_1.BlockfrostServerError && error_2.status_code === 400) {
                    console.log("Transaction " + txHash + " rejected");
                    // Reason for the rejection is in error.message
                    console.log(error_2.message);
                }
                else {
                    // rethrow other errors
                    throw error_2;
                }
                return [3 /*break*/, 11];
            case 11: return [2 /*return*/];
        }
    });
}); };
runTransaction();
