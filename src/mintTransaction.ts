import {
    BlockFrostAPI,
    BlockfrostServerError,
  } from '@blockfrost/blockfrost-js';
import { composeNFT } from './helper/NFTs/composeNFT';
import { deriveAddressPrvKey, mnemonicToPrivateKey } from './helper/keys';
import { prepareNFT } from './helper/NFTs/prepareNFT';

import { LatestBlock, ProtocolParameters, UTXO } from './types';
import { signTransactionNFT } from './helper/NFTs/signNFT';


const TESTNET = true;

// BIP39 mnemonic (seed) from which we will generate address to retrieve utxo from and private key used for signing the transaction
const MNEMONIC =
'crouch sister metal holiday cricket credit system short cry muscle artist skill drop box spice';


const client = new BlockFrostAPI({projectId: TESTNET ? "testnetByg9CqH6pKiCG8shQuXCbXy3cpN4fzgd" : "mainnetU0WcTKq108uNZB93ctcfmEJ3jAxHY3Co", isTestnet: TESTNET});


const startMintingNFT = async (assetName: string) => {

    // Derive an address (this is the address where you need to send ADA in order to have UTXO to actually make the transaction)
    const bip32PrvKey = mnemonicToPrivateKey(MNEMONIC);
    const { signKey, address } = deriveAddressPrvKey(bip32PrvKey, TESTNET, 0);

    console.log('Using address ' + address);
  
    // Retrieve utxo for the address
    let utxo: UTXO = [];

    try 
    {
      utxo = await client.addressesUtxosAll(address);
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
  
    console.log('UTXO on '+ address);
    console.log(JSON.stringify(utxo, undefined, 4));

    // Get latest epoch of the Cardano Blockchain
    let latestEpoch = await client.epochsLatest()
    console.log();
    console.log('latest epoch = ' + latestEpoch.epoch);
    console.log();

    // Get the latest protocol parameters of the Cardano Blockchain
    let protocolParameters: ProtocolParameters = await client.epochsParameters(latestEpoch.epoch);
    console.log();
    console.log('latest parameters utxo coin = ' + protocolParameters.coins_per_utxo_word);
    console.log();
  
    // Get current blockchain slot from latest block
    let latestBlock: LatestBlock = await client.blocksLatest();
    
    // Get the slot for timelock of transaction (invalid after...)
    let currentSlot = latestBlock.slot;
    console.log();
    console.log('current slot = ' + currentSlot);
    console.log();
    

    if (!currentSlot) 
    {
      throw Error('Failed to fetch slot number');
    }


    // Set TTL to +2h from currentSlot (7200 = 60(secs) x 60(mins) x 2(hours))
    // If the transaction/mint is not included in a block before that slot it will be cancelled.
    const ttl = currentSlot + 7200;


    // 1. PREPARE NFT
    const { 
      policy, 
      metadata, 
      policyKeyHash, 
      mintScript 
    } 
    = prepareNFT(
      signKey, 
      ttl, 
      assetName, 
      "Trying to create an NFT on cardano testnet", 
      "ipfs://QmNhmDPJMgdsFRM9HyiQEJqrKkpsWFshqES8mPaiFRq9Zk", 
      "image/jpeg"
    );



    // 2. COMPOSE NFT
    const { 
        txHash, 
        txUnsigned 
    } 
    = composeNFT(  
        policyKeyHash,
        address,
        utxo,
        protocolParameters,
        assetName,
        metadata,
        mintScript,
        ttl,
    );
  

    // 3. SIGN NFT TRANSACTION
    const transaction = signTransactionNFT(txUnsigned, signKey, policy, mintScript);



    // (Optional: Estimate fees)
    const txSize = transaction.to_bytes().length;
    const estimatedFees = (protocolParameters.min_fee_b/1000000) + (protocolParameters.min_fee_a/1000000) * (Number(txSize));
    console.log('estimated fees = ' + estimatedFees);


    // 4. PUSH TRANSACTION to network w/ BlockFrostSDK
    try
     {
        const res = await client.txSubmit(transaction.to_bytes());
        
        if (res)
        {
            console.log("Transaction successfully submitted: " + txHash);
        }
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


startMintingNFT("testNFT")