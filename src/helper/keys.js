"use strict";
exports.__esModule = true;
exports.mnemonicToPrivateKey = exports.deriveAddressPrvKey = void 0;
var CardanoWasm = require("@emurgo/cardano-serialization-lib-nodejs");
var bip39_1 = require("bip39");
var harden = function (num) {
    return 0x80000000 + num;
};
var deriveAddressPrvKey = function (bipPrvKey, testnet, addressIndex) {
    var networkId = testnet
        ? CardanoWasm.NetworkInfo.testnet().network_id()
        : CardanoWasm.NetworkInfo.mainnet().network_id();
    var accountIndex = 0;
    // ACCOUNT KEY
    var accountKey = bipPrvKey
        .derive(harden(1852)) // purpose
        .derive(harden(1815)) // coin type
        .derive(harden(accountIndex)); // account #
    // ACCOUNT KEY : PRIVATE
    var privateKey = accountKey.to_raw_key();
    // STAKE KEY
    var stakePublicKey = accountKey
        .derive(2) // chimeric
        .derive(0)
        .to_public();
    // STAKE KEY : PRIVATE
    var stakePrivateKey = accountKey
        .derive(2) // chimeric
        .derive(0)
        .to_raw_key();
    var rewardAddr = CardanoWasm.RewardAddress["new"](networkId, CardanoWasm.StakeCredential.from_keyhash(stakePublicKey.to_raw_key().hash()));
    var rewardAddress = rewardAddr.to_address().to_bech32();
    console.log("reward address =" + rewardAddress);
    // OLD CODE
    // const utxoKey = accountKey
    //   .derive(0) // external
    //   .derive(addressIndex);
    // const baseAddress = CardanoWasm.BaseAddress.new(
    //   networkId,
    //   CardanoWasm.StakeCredential.from_keyhash(utxoKey.to_public().to_raw_key().hash()),
    //   CardanoWasm.StakeCredential.from_keyhash(stakePublicKey.to_raw_key().hash()),
    // );
    // const address = baseAddress.to_address().to_bech32();
    //--------------------------------------------------------------------------------------------
    //-------------------------------------- ADDRESS 0 -------------------------------------------
    //--------------------------------------------------------------------------------------------
    // ADDRESS 0 KEY: Public
    var paymentPublicKey = accountKey
        .derive(0) // external
        .derive(0) // address index 0
        .to_public();
    console.log("address 0 pub key = " + paymentPublicKey.to_bech32());
    console.log("address 0 pub key to raw key = " + paymentPublicKey.to_raw_key().to_bech32());
    // ADDRESS 0 KEY: Private
    var paymentSignKey = accountKey
        .derive(0) // external
        .derive(0) // address index 0
        .to_raw_key();
    console.log("address 0 sign key = " + paymentSignKey.to_bech32());
    // ADDRESS 0: BASE
    var baseAddress0 = CardanoWasm.BaseAddress["new"](networkId, CardanoWasm.StakeCredential.from_keyhash(paymentPublicKey.to_raw_key().hash()), CardanoWasm.StakeCredential.from_keyhash(stakePublicKey.to_raw_key().hash()));
    // ADDRESS 0: BECH32
    var address0 = baseAddress0.to_address().to_bech32();
    console.log("address 0 = " + address0);
    //--------------------------------------------------------------------------------------------
    //-------------------------------------- ADDRESS 1 -------------------------------------------
    //--------------------------------------------------------------------------------------------
    var paymentPublicKey1 = accountKey
        .derive(0) // external
        .derive(1) // address index 1
        .to_public();
    var paymentSignKey1 = accountKey
        .derive(0) // external
        .derive(1) // address index 1
        .to_raw_key();
    var baseAddress1 = CardanoWasm.BaseAddress["new"](networkId, CardanoWasm.StakeCredential.from_keyhash(paymentPublicKey1.to_raw_key().hash()), CardanoWasm.StakeCredential.from_keyhash(stakePublicKey.to_raw_key().hash()));
    // ADDRESS 1: BECH32
    var address1 = baseAddress1.to_address().to_bech32();
    console.log("address 1 = " + address1);
    //--------------------------------------------------------------------------------------------
    //-------------------------------------- ADDRESS 2 -------------------------------------------
    //--------------------------------------------------------------------------------------------
    var paymentPublicKey2 = accountKey
        .derive(0) // external
        .derive(2) // address index 2
        .to_public();
    var paymentSignKey2 = accountKey
        .derive(0) // external
        .derive(2) // address index 2
        .to_raw_key();
    var baseAddress2 = CardanoWasm.BaseAddress["new"](networkId, CardanoWasm.StakeCredential.from_keyhash(paymentPublicKey2.to_raw_key().hash()), CardanoWasm.StakeCredential.from_keyhash(stakePublicKey.to_raw_key().hash()));
    // ADDRESS 0: BECH32
    var address2 = baseAddress2.to_address().to_bech32();
    //--------------------------------------------------------------------------------------------
    //-------------------------------------- ADDRESS INDEX -------------------------------------------
    //--------------------------------------------------------------------------------------------
    var paymentPublicKeyIndex = accountKey
        .derive(0) // external
        .derive(addressIndex) // address index 
        .to_public();
    var paymentSignKeyIndex = accountKey
        .derive(0) // external
        .derive(addressIndex) // address index
        .to_raw_key();
    var baseAddressSpecial = CardanoWasm.BaseAddress["new"](networkId, CardanoWasm.StakeCredential.from_keyhash(paymentPublicKeyIndex.to_raw_key().hash()), CardanoWasm.StakeCredential.from_keyhash(stakePublicKey.to_raw_key().hash()));
    // ADDRESS 0: BECH32
    var addressSpecial = baseAddressSpecial.to_address().to_bech32();
    var cardanoKeys = {
        accountKey: accountKey,
        accountPrivateKey: privateKey,
        stakePubKey: stakePublicKey,
        stakeSignKey: stakePrivateKey,
        stakeRewardAddr: rewardAddr,
        stakeRewardAddrBech32: rewardAddr.to_address().to_bech32(),
        addr0Pubkey: paymentPublicKey,
        addr0SignKey: paymentSignKey,
        addr0: baseAddress0,
        addr0Bech32: baseAddress0.to_address().to_bech32(),
        addr1Pubkey: paymentPublicKey1,
        addr1SignKey: paymentSignKey1,
        addr1: baseAddress1,
        addr1Bech32: baseAddress1.to_address().to_bech32(),
        addr2Pubkey: paymentPublicKey2,
        addr2SignKey: paymentSignKey2,
        addr2: baseAddress2,
        addr2Bech32: baseAddress2.to_address().to_bech32(),
        addrIndexPubkey: paymentPublicKeyIndex,
        addrIndexSignKey: paymentSignKeyIndex,
        addrIndex: baseAddressSpecial,
        addrIndexBech32: baseAddressSpecial.to_address().to_bech32()
    };
    return { cardanoKeys: cardanoKeys }; // signKeyAddrAtIndex: utxoKey.to_raw_key(), addrAtIndexBech32: address };
};
exports.deriveAddressPrvKey = deriveAddressPrvKey;
var mnemonicToPrivateKey = function (mnemonic) {
    var entropy = (0, bip39_1.mnemonicToEntropy)(mnemonic);
    var rootKey = CardanoWasm.Bip32PrivateKey.from_bip39_entropy(Buffer.from(entropy, 'hex'), Buffer.from(''));
    return rootKey;
};
exports.mnemonicToPrivateKey = mnemonicToPrivateKey;
