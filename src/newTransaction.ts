import {
    BlockFrostAPI,
    BlockfrostServerError,
  } from '@blockfrost/blockfrost-js';

import { composeTransaction } from './helper/composeTransaction';
import { signTransaction } from './helper/signTransaction';
import { deriveAddressPrvKey, mnemonicToPrivateKey } from './helper/keys';
import { LatestBlock, ProtocolParameters, UTXO } from './types';


const TESTNET = true;

// BIP39 mnemonic (seed) from which we will generate address to retrieve utxo from and private key used for signing the transaction
const MNEMONIC =
'crouch sister metal holiday cricket credit system short cry muscle artist skill drop box spice';


// Recipient address (needs to be Bech32)
const OUTPUT_ADDRESS =
  'addr_test1qpvtnmsn3nyaqmf4h6rnnfzhjn7zqgezxzwka42vemffpl7j7t4m76efmvm7cjllcu9h3cvzca2980lr4ltwvu5n37ls70d4jh';

// Amount sent to the recipient
const OUTPUT_AMOUNT = '2000000'; // 2 000 000 lovelaces = 5 ADA (cannot make a transaction with NFT under 1 ADA)


const client = new BlockFrostAPI({projectId: TESTNET ? "testnetByg9CqH6pKiCG8shQuXCbXy3cpN4fzgd" : "testnetByg9CqH6pKiCG8shQuXCbXy3cpN4fzgd", isTestnet: TESTNET});



const runTransaction = async () => {//minFeeA: number , minFeeB: number, poolDeposit: number, keyDeposit: number, maxValSize: number, maxTxSize: number, coinPerUTXOWord: number) => {
    
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
    console.log('latest epoch = ' + latestEpoch.epoch);

    // Get the latest protocol parameters of the Cardano Blockchain
    let protocolParameters: ProtocolParameters = await client.epochsParameters(latestEpoch.epoch);
    console.log('latest parameters = ' + protocolParameters);
  
    // Get current blockchain slot from latest block
    let latestBlock: LatestBlock = await client.blocksLatest();
    
    // Get the slot for timelock of transaction (invalid after...)
    let currentSlot = latestBlock.slot;
    

    if (!currentSlot) 
    {
      throw Error('Failed to fetch slot number');
    }


    // Set TTL to +2h from currentSlot -> 7200 = 60(secs) x 60(mins) x 2(hours) 
    // If the transaction is not included in a block before that slot it will be cancelled.
    const ttl = currentSlot + 7200;

  
    // Prepare transaction
    const { txHash, txBody } = composeTransaction(
        address,
        OUTPUT_ADDRESS,
        OUTPUT_AMOUNT,
        utxo,
        ttl,
        protocolParameters
    );
  

    // Sign transaction
    const transaction = signTransaction(txBody, signKey);


    // Estimate fees
    const txSize = transaction.to_bytes().length;
    const estimatedFees = (protocolParameters.min_fee_b/1000000) + (protocolParameters.min_fee_a/1000000) * (Number(txSize));
    console.log('estimated fees = ' + estimatedFees);


    //Push transaction to network w/ BlockFrostSDK
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


runTransaction()


