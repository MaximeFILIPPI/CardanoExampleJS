import * as CardanoWasm from '@emurgo/cardano-serialization-lib-nodejs';
import axios from 'axios';
import {
    BlockFrostAPI,
    BlockfrostServerError,
  } from '@blockfrost/blockfrost-js';
import { deriveAddressPrvKey, mnemonicToPrivateKey } from '../helper/keys';
import { UTXO } from '../types';



const TESTNET = true;

// BIP39 mnemonic (seed) from which we will generate address to retrieve utxo from and private key used for signing the transaction
const MNEMONIC =
'crouch sister metal holiday cricket credit system short cry muscle artist skill drop box spice';


const client = new BlockFrostAPI({projectId: TESTNET ? "testnetByg9CqH6pKiCG8shQuXCbXy3cpN4fzgd" : "mainnetU0WcTKq108uNZB93ctcfmEJ3jAxHY3Co", isTestnet: TESTNET});


export const mintTestNFT = async () => {


    // Derive an address (this is the address where you need to send ADA in order to have UTXO to actually make the transaction)
    //const bip32PrvKey = mnemonicToPrivateKey(MNEMONIC);
    //const { signKey, address } = deriveAddressPrvKey(bip32PrvKey, TESTNET, 0);

    //console.log('Using address ' + address);


    const privateKey = CardanoWasm.PrivateKey.from_bech32("ed25519_sk18j0a6704zyerm6dsj6p2fp8juw5m43rfgk0y84jnm7w5khs4dpqquewh43");
    console.log("PRIVATE KEY:", privateKey.to_bech32());

    const policyPrivateKey = CardanoWasm.PrivateKey.from_bech32("ed25519_sk1q96x2g66j5g7u5wydl7kcagk0h8upxznt3gj48h6njqthkyr7faqxmnnte");

    
    
    const policy = { privateKey: policyPrivateKey, ttl: null };

    // import policy key from a .skey file
    // CBOR is unknow
    //const policyPrivateKey = CardanoWasm.PrivateKey.from_normal_bytes( cbor.decodeFirstSync("582009ca7f508dd5a5f9823d367e98170f25606799f49ae7363a47a11d7d3502c91f"));
    console.log("POLICY_PRIV_KEY:", policyPrivateKey.to_bech32());

    // assetName
    const assetName = "TestNFT"; 

    // description
    const description = "Redking try create NFT";  

    // image url
    const imageUrl = "ipfs://QmNhmDPJMgdsFRM9HyiQEJqrKkpsWFshqES8mPaiFRq9Zk"; 

     // mediaType
    const mediaType = "image/jpeg";   

    const FEE = '1500000';

    
    const publicKey = privateKey.to_public();

    const addr = CardanoWasm.BaseAddress.new(
        CardanoWasm.NetworkInfo.testnet().network_id(),
        CardanoWasm.StakeCredential.from_keyhash(publicKey.hash()),
        CardanoWasm.StakeCredential.from_keyhash(publicKey.hash())
    ).to_address();

    console.log("ADDR:", addr.to_bech32());

    const policyPubKey =  policyPrivateKey.to_public();
    
    console.log("policyPubKey", policyPubKey.to_bech32());
    

    const policyAddr = CardanoWasm.BaseAddress.new(
        CardanoWasm.NetworkInfo.testnet().network_id(),
        CardanoWasm.StakeCredential.from_keyhash(policyPubKey.hash()),
        CardanoWasm.StakeCredential.from_keyhash(policyPubKey.hash())
    ).to_address();

    console.log("policyAddr", policyAddr.to_bech32());
    
    // Retrieve utxo for the address
    let utxo: UTXO = [];

    try 
    {
    utxo = await client.addressesUtxosAll(addr.to_bech32());
    } 
    catch (error) 
    {
    if (error instanceof BlockfrostServerError && error.status_code === 404)
    {
        // Address derived from the seed was not used yet
        // In this case Blockfrost API will return 404
        utxo = [];
    } 
    else 
    {
        throw error;
    }

    }

    if (utxo.length === 0) 
    {
    console.log();
    console.log('You should send ADA to ${address} to have enough funds to sent a transaction');
    console.log();
    }

    console.log('UTXO on '+ addr.to_bech32());
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
     

    //const utxo_tx_hash =  "d7813a099aacdbb5a4ab19336df9c586a833fd3e95321fcf750a761a7be2d779";
    //const utxo_tx_index = 1;
    //const utxo_amount = "997318706"; //"998659353";
      //998659353
     
    let utxoSelected;
    let utxoQuantity;

    if (utxo != null) {
        
        for (const utxoEntry of utxo) 
        {
            for (const coinEntry of utxoEntry.amount)
            {
                if (coinEntry.quantity > FEE) 
                {
                    utxoSelected = utxoEntry;
                    utxoQuantity = coinEntry.quantity
                }
            }
            
        }
    }
    

    if (utxoSelected === null || utxoQuantity === null) 
    {
        console.log("no utxo found with sufficient ADA.");
    }
    console.log("UTXO:", JSON.stringify(utxoSelected, null, 4));

   
    // get current global slot from yoroi backend
    // const { data: slotData } = await axios.get(
    //     "https://testnet-backend.yoroiwallet.com/api/v2/bestblock"
    // );
    
    

    const ttl = 66266650 + 60 * 60 * 24; // 24 hours from now

    const txBuilder = CardanoWasm.TransactionBuilder.new(
    CardanoWasm.TransactionBuilderConfigBuilder.new()
      .fee_algo(
        CardanoWasm.LinearFee.new(
          CardanoWasm.BigNum.from_str("44"),
          CardanoWasm.BigNum.from_str("155381")
        )
      )
      .coins_per_utxo_word(CardanoWasm.BigNum.from_str("34482"))
      .pool_deposit(CardanoWasm.BigNum.from_str("500000000"))
      .key_deposit(CardanoWasm.BigNum.from_str("2000000"))
      .max_value_size(5000)
      .max_tx_size(16384)
      .build()
    );


    const scripts = CardanoWasm.NativeScripts.new();

    const policyKeyHash = CardanoWasm.BaseAddress.from_address(policyAddr)!.payment_cred().to_keyhash()!;
    console.log( "POLICY_KEYHASH:", Buffer.from(policyKeyHash.to_bytes()).toString("hex"));


    // add key hash script so only people with policy key can mint assets using this policyId
    const keyHashScript = CardanoWasm.NativeScript.new_script_pubkey(CardanoWasm.ScriptPubkey.new(policyKeyHash));
    
    scripts.add(keyHashScript);

    const policyTtl =  ttl;
    console.log("POLICY_TTL:", policyTtl);

    // add timelock so policy is locked after this slot
    const timelock = CardanoWasm.TimelockExpiry.new(policyTtl);
    const timelockScript = CardanoWasm.NativeScript.new_timelock_expiry(timelock);
    scripts.add(timelockScript);
    
    console.log("timelock:", timelock);

    const mintScript = CardanoWasm.NativeScript.new_script_all(CardanoWasm.ScriptAll.new(scripts));
    
    console.log("mintScript:", mintScript);

    /* mintScript can be a single script instead of an array of scripts
    const mintScript = CardanoWasm.NativeScript.new_script_pubkey(CardanoWasm.ScriptPubkey.new(policyKeyHash));
    */

    const privKeyHash = CardanoWasm.BaseAddress.from_address(addr)!
    .payment_cred()
    .to_keyhash()!;
    
    console.log("privKeyHash:", privKeyHash);
  
  
    txBuilder.add_key_input(
        privKeyHash,
        CardanoWasm.TransactionInput.new(
            CardanoWasm.TransactionHash.from_bytes(Buffer.from(utxoSelected.tx_hash, "hex")),
            utxoSelected.tx_index
        ),
        CardanoWasm.Value.new(CardanoWasm.BigNum.from_str(utxoQuantity))
    );

    txBuilder.add_mint_asset_and_output_min_required_coin(
        mintScript,
        CardanoWasm.AssetName.new(Buffer.from(assetName)),
        CardanoWasm.Int.new_i32(1),
        CardanoWasm.TransactionOutputBuilder.new().with_address(addr).next()
    );

    const policyId = Buffer.from(mintScript.hash().to_bytes()).toString("hex");

    console.log(`POLICY_ID: ${policyId}`);

    const metadata = {
     [policyId]: {
        [assetName]: {
            name: assetName,
            description,
            image: imageUrl,
            mediaType,
        },
      },
    };

    console.log("METADATA:",  JSON.stringify(metadata, null, 4));

    // transaction ttl can't be later than policy ttl
    const txTtl = ttl > policyTtl ? policyTtl : ttl;

    console.log(`TX_TTL: ${txTtl}`);

    txBuilder.set_ttl(txTtl);
    txBuilder.add_json_metadatum(
        CardanoWasm.BigNum.from_str("721"),
        JSON.stringify(metadata)
    );


    txBuilder.add_change_if_needed(addr);

    const txBody = txBuilder.build();
    const txHash = CardanoWasm.hash_transaction(txBody);

    console.log("TX_HASH:", Buffer.from(txHash.to_bytes()).toString("hex"));
    


    // sign the tx using the policy key and main key
    const witnesses = CardanoWasm.TransactionWitnessSet.new();
    const vkeyWitnesses = CardanoWasm.Vkeywitnesses.new();
    vkeyWitnesses.add(CardanoWasm.make_vkey_witness(txHash, policyPrivateKey));
    vkeyWitnesses.add(CardanoWasm.make_vkey_witness(txHash, privateKey));
    witnesses.set_vkeys(vkeyWitnesses);
    witnesses.set_native_scripts;
    const witnessScripts = CardanoWasm.NativeScripts.new();
    witnessScripts.add(mintScript);
    witnesses.set_native_scripts(witnessScripts);

    const unsignedTx = txBuilder.build_tx();
    
    console.log("unsignedTx:", unsignedTx);

    // create signed transaction
    const tx = CardanoWasm.Transaction.new(
        unsignedTx.body(),
        witnesses,
        unsignedTx.auxiliary_data()
    );
    
    //const transactionToBlockfrost =  Buffer.from(tx.to_bytes().toString('hex'));
    //console.log("transactionToBlockfrost :", transactionToBlockfrost );
  

    //const signedTx = Buffer.from(tx.to_bytes()).toString("base64");
    //console.log("signedTx:", signedTx);



    // (Optional: Estimate fees)
    const txSize = tx.to_bytes().length;
    const estimatedFees = (155381/1000000) + (44/1000000) * (Number(txSize));
    console.log('estimated fees = ' + estimatedFees);


    // 4. PUSH TRANSACTION to network w/ BlockFrostSDK
    try
     {
        // const res = await client.txSubmit(tx.to_bytes());
        
        // if (res)
        // {
        //     console.log("Transaction successfully submitted: " + res);
        // }
    } 
    catch (error) 
    {
        // submit could fail if the transactions is rejected by cardano node
        if (error instanceof BlockfrostServerError && error.status_code === 400) {
            console.log("Transaction " + txHash + " rejected");
            // Reason for the rejection is in error.message
            console.log(error.message);
        } 
        else 
        {
            // rethrow other errors
            throw error;
        }

    }




};