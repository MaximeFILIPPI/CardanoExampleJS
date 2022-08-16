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
exports.mintTestNFT = void 0;
var CardanoWasm = require("@emurgo/cardano-serialization-lib-nodejs");
var blockfrost_js_1 = require("@blockfrost/blockfrost-js");
var TESTNET = true;
// BIP39 mnemonic (seed) from which we will generate address to retrieve utxo from and private key used for signing the transaction
var MNEMONIC = 'crouch sister metal holiday cricket credit system short cry muscle artist skill drop box spice';
var client = new blockfrost_js_1.BlockFrostAPI({ projectId: TESTNET ? "testnetByg9CqH6pKiCG8shQuXCbXy3cpN4fzgd" : "mainnetU0WcTKq108uNZB93ctcfmEJ3jAxHY3Co", isTestnet: TESTNET });
var mintTestNFT = function () { return __awaiter(void 0, void 0, void 0, function () {
    var privateKey, policyPrivateKey, policy, assetName, description, imageUrl, mediaType, FEE, publicKey, addr, policyPubKey, policyAddr, utxo, error_1, utxoSelected, utxoQuantity, _i, utxo_1, utxoEntry, _a, _b, coinEntry, ttl, txBuilder, scripts, policyKeyHash, keyHashScript, policyTtl, timelock, timelockScript, mintScript, privKeyHash, policyId, metadata, txTtl, txBody, txHash, witnesses, vkeyWitnesses, witnessScripts, unsignedTx, tx, txSize, estimatedFees;
    var _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                privateKey = CardanoWasm.PrivateKey.from_bech32("ed25519_sk18j0a6704zyerm6dsj6p2fp8juw5m43rfgk0y84jnm7w5khs4dpqquewh43");
                console.log("PRIVATE KEY:", privateKey.to_bech32());
                policyPrivateKey = CardanoWasm.PrivateKey.from_bech32("ed25519_sk1q96x2g66j5g7u5wydl7kcagk0h8upxznt3gj48h6njqthkyr7faqxmnnte");
                policy = { privateKey: policyPrivateKey, ttl: null };
                // import policy key from a .skey file
                // CBOR is unknow
                //const policyPrivateKey = CardanoWasm.PrivateKey.from_normal_bytes( cbor.decodeFirstSync("582009ca7f508dd5a5f9823d367e98170f25606799f49ae7363a47a11d7d3502c91f"));
                console.log("POLICY_PRIV_KEY:", policyPrivateKey.to_bech32());
                assetName = "TestNFT";
                description = "Redking try create NFT";
                imageUrl = "ipfs://QmNhmDPJMgdsFRM9HyiQEJqrKkpsWFshqES8mPaiFRq9Zk";
                mediaType = "image/jpeg";
                FEE = '300000';
                publicKey = privateKey.to_public();
                addr = CardanoWasm.BaseAddress["new"](CardanoWasm.NetworkInfo.testnet().network_id(), CardanoWasm.StakeCredential.from_keyhash(publicKey.hash()), CardanoWasm.StakeCredential.from_keyhash(publicKey.hash())).to_address();
                console.log("ADDR:", addr.to_bech32());
                policyPubKey = policyPrivateKey.to_public();
                console.log("policyPubKey", policyPubKey.to_bech32());
                policyAddr = CardanoWasm.BaseAddress["new"](CardanoWasm.NetworkInfo.testnet().network_id(), CardanoWasm.StakeCredential.from_keyhash(policyPubKey.hash()), CardanoWasm.StakeCredential.from_keyhash(policyPubKey.hash())).to_address();
                console.log("policyAddr", policyAddr.to_bech32());
                utxo = [];
                _e.label = 1;
            case 1:
                _e.trys.push([1, 3, , 4]);
                return [4 /*yield*/, client.addressesUtxosAll(addr.to_bech32())];
            case 2:
                utxo = _e.sent();
                return [3 /*break*/, 4];
            case 3:
                error_1 = _e.sent();
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
                console.log('UTXO on ' + addr.to_bech32());
                console.log(JSON.stringify(utxo, undefined, 4));
                //get utxos for our address and select one that is probably big enough to pay the tx fee
                // const utxoRes = await axios.post(
                //     "https://testnet-backend.yoroiwallet.com/api/txs/utxoForAddresses",
                //     {
                //     addresses: [addr.to_bech32()],
                //     }
                // );
                //let utxo = "{'utxo_id': '8fd48466de4c56c90f3154fae86daf58e35a42a3d4643ff57d97c91dc75f2894:0', 'tx_hash': '8fd48466de4c56c90f3154fae86daf58e35a42a3d4643ff57d97c91dc75f2894', 'tx_index': 0, 'receiver': 'addr_test1qr9tdv6p44asg53ndd3dn8y2dyrey63llaum42mpemc9ztw2k6e5rttmq3frx6mzmxwg56g8jf4rllmeh24krnhs2yks6kkvua', 'amount': '1344798', 'dataHash': null, 'assets': [{'assetId': '04158b93560bb7ad91bf249f425d1de3c70fef24b43064487fc97635.6173644e465433','policyId': '04158b93560bb7ad91bf249f425d1de3c70fef24b43064487fc97635','name': '6173644e465433','amount': '1'}], 'block_num': 3432188}";
                //{"tx_hash":"d7813a099aacdbb5a4ab19336df9c586a833fd3e95321fcf750a761a7be2d779","tx_index":1,"output_index":1,"amount":[{"unit":"lovelace","quantity":"998659353"}],"block":"e6467d15877f89d01b9204670a83ff17b47458100ea0a4c436dd59d960d934c9","data_hash":null,"inline_datum":null,"reference_script_hash":null}
                console.log();
                console.log('utxos = ' + utxo);
                console.log();
                if (utxo != null) {
                    for (_i = 0, utxo_1 = utxo; _i < utxo_1.length; _i++) {
                        utxoEntry = utxo_1[_i];
                        for (_a = 0, _b = utxoEntry.amount; _a < _b.length; _a++) {
                            coinEntry = _b[_a];
                            if (coinEntry.quantity > FEE) {
                                utxoSelected = utxoEntry;
                                utxoQuantity = coinEntry.quantity;
                            }
                        }
                    }
                }
                if (utxoSelected === null || utxoQuantity === null) {
                    console.log("no utxo found with sufficient ADA.");
                }
                console.log("UTXO:", JSON.stringify(utxoSelected, null, 4));
                ttl = 66266650 + 60 * 60 * 24;
                txBuilder = CardanoWasm.TransactionBuilder["new"](CardanoWasm.TransactionBuilderConfigBuilder["new"]()
                    .fee_algo(CardanoWasm.LinearFee["new"](CardanoWasm.BigNum.from_str("44"), CardanoWasm.BigNum.from_str("155381")))
                    .coins_per_utxo_word(CardanoWasm.BigNum.from_str("34482"))
                    .pool_deposit(CardanoWasm.BigNum.from_str("500000000"))
                    .key_deposit(CardanoWasm.BigNum.from_str("2000000"))
                    .max_value_size(5000)
                    .max_tx_size(16384)
                    .build());
                scripts = CardanoWasm.NativeScripts["new"]();
                policyKeyHash = CardanoWasm.BaseAddress.from_address(policyAddr).payment_cred().to_keyhash();
                console.log("POLICY_KEYHASH:", Buffer.from(policyKeyHash.to_bytes()).toString("hex"));
                keyHashScript = CardanoWasm.NativeScript.new_script_pubkey(CardanoWasm.ScriptPubkey["new"](policyKeyHash));
                scripts.add(keyHashScript);
                policyTtl = ttl;
                console.log("POLICY_TTL:", policyTtl);
                timelock = CardanoWasm.TimelockExpiry["new"](policyTtl);
                timelockScript = CardanoWasm.NativeScript.new_timelock_expiry(timelock);
                scripts.add(timelockScript);
                console.log("timelock:", timelock);
                mintScript = CardanoWasm.NativeScript.new_script_all(CardanoWasm.ScriptAll["new"](scripts));
                console.log("mintScript:", mintScript);
                privKeyHash = CardanoWasm.BaseAddress.from_address(addr)
                    .payment_cred()
                    .to_keyhash();
                console.log("privKeyHash:", privKeyHash);
                txBuilder.add_key_input(privKeyHash, CardanoWasm.TransactionInput["new"](CardanoWasm.TransactionHash.from_bytes(Buffer.from(utxoSelected.tx_hash, "hex")), utxoSelected.tx_index), CardanoWasm.Value["new"](CardanoWasm.BigNum.from_str(utxoQuantity)));
                txBuilder.add_mint_asset_and_output_min_required_coin(mintScript, CardanoWasm.AssetName["new"](Buffer.from(assetName)), CardanoWasm.Int.new_i32(1), CardanoWasm.TransactionOutputBuilder["new"]().with_address(addr).next());
                policyId = Buffer.from(mintScript.hash().to_bytes()).toString("hex");
                console.log("POLICY_ID: ".concat(policyId));
                metadata = (_c = {},
                    _c[policyId] = (_d = {},
                        _d[assetName] = {
                            name: assetName,
                            description: description,
                            image: imageUrl,
                            mediaType: mediaType
                        },
                        _d),
                    _c);
                console.log("METADATA:", JSON.stringify(metadata, null, 4));
                txTtl = ttl > policyTtl ? policyTtl : ttl;
                console.log("TX_TTL: ".concat(txTtl));
                txBuilder.set_ttl(txTtl);
                txBuilder.add_json_metadatum(CardanoWasm.BigNum.from_str("721"), JSON.stringify(metadata));
                txBuilder.add_change_if_needed(addr);
                txBody = txBuilder.build();
                txHash = CardanoWasm.hash_transaction(txBody);
                console.log("TX_HASH:", Buffer.from(txHash.to_bytes()).toString("hex"));
                witnesses = CardanoWasm.TransactionWitnessSet["new"]();
                vkeyWitnesses = CardanoWasm.Vkeywitnesses["new"]();
                vkeyWitnesses.add(CardanoWasm.make_vkey_witness(txHash, policyPrivateKey));
                vkeyWitnesses.add(CardanoWasm.make_vkey_witness(txHash, privateKey));
                witnesses.set_vkeys(vkeyWitnesses);
                witnesses.set_native_scripts;
                witnessScripts = CardanoWasm.NativeScripts["new"]();
                witnessScripts.add(mintScript);
                witnesses.set_native_scripts(witnessScripts);
                unsignedTx = txBuilder.build_tx();
                console.log("unsignedTx:", unsignedTx);
                tx = CardanoWasm.Transaction["new"](unsignedTx.body(), witnesses, unsignedTx.auxiliary_data());
                txSize = tx.to_bytes().length;
                estimatedFees = (155381 / 1000000) + (44 / 1000000) * (Number(txSize));
                console.log('estimated fees = ' + estimatedFees);
                // 4. PUSH TRANSACTION to network w/ BlockFrostSDK
                try {
                    // const res = await client.txSubmit(tx.to_bytes());
                    // if (res)
                    // {
                    //     console.log("Transaction successfully submitted: " + res);
                    // }
                }
                catch (error) {
                    // submit could fail if the transactions is rejected by cardano node
                    if (error instanceof blockfrost_js_1.BlockfrostServerError && error.status_code === 400) {
                        console.log("Transaction " + txHash + " rejected");
                        // Reason for the rejection is in error.message
                        console.log(error.message);
                    }
                    else {
                        // rethrow other errors
                        throw error;
                    }
                }
                return [2 /*return*/];
        }
    });
}); };
exports.mintTestNFT = mintTestNFT;
