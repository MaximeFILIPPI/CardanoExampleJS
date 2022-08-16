import * as CardanoWASM from "@emurgo/cardano-serialization-lib-nodejs"
import * as axiosSDK from "axios"
import { getAddressOne, getBaseAddress, getKeyDetails, getUtxoPrivateKey, getUtxoPublicKey } from "./walletManager";

const axios = axiosSDK.default;


function getLastBlockData()
{
    // // get current global slot from yoroi backend
    // const { data: slotData } = await axios.get(
    //     "https://testnet-backend.yoroiwallet.com/api/v2/bestblock"
    // );

    //const ttl = slotData.globalSlot + 60 * 60 * 2; // two hours from now

    const configLastBlockBlockfrost = {
        method: 'get',
        url: 'https://cardano-testnet.blockfrost.io/api/v0/blocks/latest',
        headers: { 'project_id': 'testnetByg9CqH6pKiCG8shQuXCbXy3cpN4fzgd' }
    }


    axios(configLastBlockBlockfrost).then(resp => {

        console.log("Latest block infos on the Cardano blockChain = " + JSON.stringify(resp.data));
        

        getUTXOsFromAddress(1000000, getBaseAddress().to_address().to_bech32())

    }).catch(error => {
        console.log("Latest block infos on the Cardano blockChain ERROR = " + error.data);
    });

}


function getUTXOsFromAddress(fees: Number, addrss_bech32: String)
{
    
    const configUTXOsAddressBlockfrost = {
        method: 'get',
        url: 'https://cardano-testnet.blockfrost.io/api/v0/addresses/'+addrss_bech32+'/utxos',
        headers: { 'project_id': 'testnetByg9CqH6pKiCG8shQuXCbXy3cpN4fzgd' }
    }
    
    
    axios(configUTXOsAddressBlockfrost).then(resp => {
    
        console.log("all UTXOs for address " + addrss_bech32 + " on the Cardano blockChain = " + JSON.stringify(resp.data));
        //console.log("hash first address " + resp.data.tx_hash)
    
        //createTransaction(resp.data.min_fee_a, resp.data.min_fee_b, resp.data.pool_deposit, resp.data.key_deposit,resp.data.max_val_size, resp.data.max_tx_size, resp.data.coins_per_utxo_word);

        let utxo = null;
        let amountUtxo = null;

        if (resp.data) {
            for (const utxoEntry of resp.data) 
            {
                for (const amountEntry of utxoEntry.amount) 
                {
                    if (amountEntry.unit == "lovelace")
                    {
                        if (amountEntry.quantity > fees)
                        {
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

        if (utxo === null || amountUtxo == null) 
        {
            throw new Error("no utxo found with sufficient ADA.");
        }

        console.log("chosen UTXO -> " + JSON.stringify(utxo) + " / quantity = " + amountUtxo)

        //getProtocolParameters(utxo, amountUtxo);

    }).catch(error => {
        console.log("error to find UTXOs for address " +  addrss_bech32 + " on the Cardano blockChain = " + error);
    });
}


function getProtocolParameters(utxoSelected: any, utxoAmount: Number)
{
    const configProtocolBlockfrost = {
        method: 'get',
        url: 'https://cardano-testnet.blockfrost.io/api/v0/epochs/latest/parameters',
        headers: { 'project_id': 'testnetByg9CqH6pKiCG8shQuXCbXy3cpN4fzgd' }
    }
    
    
    axios(configProtocolBlockfrost).then(resp => {
    
        //console.log("latest protocol params Cardano blockChain = " + JSON.stringify(resp.data));
        console.log("min fee " + resp.data.min_fee_a);
    
        createTransaction(utxoSelected, utxoAmount, resp.data.min_fee_a, resp.data.min_fee_b, resp.data.pool_deposit, resp.data.key_deposit,resp.data.max_val_size, resp.data.max_tx_size, resp.data.coins_per_utxo_word);
    
    }).catch(error => {
        //console.log("latest protocol params Cardano blockChain = " + error.data);
    });
}



async function createTransaction(utxoSelected: any, utxoAmount: Number, minFeeA: number , minFeeB: number, poolDeposit: number, keyDeposit: number, maxValSize: number, maxTxSize: number, coinPerUTXOWord: number)
{
    const linearFee = CardanoWASM.LinearFee.new(
        CardanoWASM.BigNum.from_str(minFeeA.toString()),
        CardanoWASM.BigNum.from_str(minFeeB.toString())
    )

    console.log("create transaciton step: 1 = OK");

    // Config the transaction with the last protocol parameters of the blockchain (fetch from BlockFrostAPI)
    const transactionConfig = CardanoWASM.TransactionBuilderConfigBuilder.new()
    .fee_algo(linearFee)
    .pool_deposit(CardanoWASM.BigNum.from_str(poolDeposit.toString()))
    .key_deposit(CardanoWASM.BigNum.from_str(keyDeposit.toString()))
    .max_value_size(maxValSize)
    .max_tx_size(maxTxSize)
    .coins_per_utxo_word(CardanoWASM.BigNum.from_str(coinPerUTXOWord.toString()))
    .build();

    console.log("create transaciton step: 2 = OK");

    // Build the transaction 
    const transactionBuilder = CardanoWASM.TransactionBuilder.new(transactionConfig);

    console.log("create transaciton step: 3 = OK");

    // Create parameters (TODO: should be dynamic) -> 
    // 1. owner private to public hash 
    // 2. utxo hash with sufficient fund for fees
    // 3. utxo index on the address

    //let ownerPrivateToPublicKeyHash = getUtxoPrivateKey().to_public().hash();
    let ownerPrivateKey = CardanoWASM.PrivateKey.from_bech32(getKeyDetails().utxoPrivateKey.to_bech32());

    console.log("create transaciton step: 4.1 = OK / utxo hash = " + utxoSelected.tx_hash);

    let transactionInput = CardanoWASM.TransactionInput.new(CardanoWASM.TransactionHash.from_bytes(Buffer.from(utxoSelected.tx_hash, "hex")), utxoSelected.index);

    console.log("create transaciton step: 4.2 = OK");

    let valueInput = CardanoWASM.Value.new(CardanoWASM.BigNum.from_str('' + utxoAmount + '')); // the amount of the utxo

    console.log("create transaciton step: 4.3 = OK");


    // Add key input to the build transaction
    transactionBuilder.add_key_input(ownerPrivateKey.to_public().hash(), transactionInput, valueInput);

    console.log("create transaciton step: 4.4 = OK");


    console.log("create transaciton step: 5 = OK");

    // base address
    const shelleyOutputAddress = CardanoWASM.Address.from_bech32("addr_test1qpvtnmsn3nyaqmf4h6rnnfzhjn7zqgezxzwka42vemffpl7j7t4m76efmvm7cjllcu9h3cvzca2980lr4ltwvu5n37ls70d4jh");
    
    // pointer address
    const shelleyChangeAddress = CardanoWASM.Address.from_bech32("addr_test1qr8wdvwjl6yf6cx6vcrk404cg9l8drfz4qv2w0wdryhdwswj7t4m76efmvm7cjllcu9h3cvzca2980lr4ltwvu5n37ls7hd6yp");


    console.log("create transaciton step: 6 = OK");

    // Value of the output transaction
    let valueOutput = CardanoWASM.Value.new(CardanoWASM.BigNum.from_str('2000000')); // 2 ADA = 2 000 000 lovelace

    // Create transaction output
    let transactionOutput = CardanoWASM.TransactionOutput.new(shelleyOutputAddress, valueOutput);

    // Transaction output
    transactionBuilder.add_output(transactionOutput)

    console.log("create transaciton step: 7 = OK");

    // calculate the min fee required and send any change to an address
    transactionBuilder.add_change_if_needed(shelleyChangeAddress);

    // set the time to live - the absolute slot value before the tx becomes invalid
    transactionBuilder.set_ttl(66929569);

    console.log("create transaciton step: 8 = OK");

    // once the transaction is ready, we build it to get the tx body without witnesses
    let transactionBody = transactionBuilder.build();
    let newTransactionHash = CardanoWASM.hash_transaction(transactionBody);
    let witnesses = CardanoWASM.TransactionWitnessSet.new();

    console.log("create transaciton step: 9 = OK");

    // add keyhash witnesses
    let vkeyWitnesses = CardanoWASM.Vkeywitnesses.new();
    let vkeyWitness = CardanoWASM.make_vkey_witness(newTransactionHash, ownerPrivateKey);
    
    vkeyWitnesses.add(vkeyWitness);
    witnesses.set_vkeys(vkeyWitnesses); 

    console.log("create transaciton step: 10 = OK");

    // create the finalized transaction with witnesses
    let transaction = CardanoWASM.Transaction.new(
        transactionBody,
        witnesses,
        undefined, // transaction metadata
    );


    console.log("create transaciton step: 11 = OK");

    let signedTransaction = Buffer.from(transaction.to_bytes())//.toString("base64");
    
    console.log("transaction signed = " + signedTransaction)

    // let serializedTx = Buffer.from(transaction.to_bytes()).toString("hex");

    // console.log("transaction signed = " + serializedTx)

    // let finalTx = Buffer.from(serializedTx, 'hex')

    // console.log("transaction finalized = " + finalTx)


    submitTransaction(transaction.to_bytes());


}


function submitTransaction(signedTransaction: Uint8Array)
{
    let tx: Buffer;

    if (typeof signedTransaction === 'string') 
    {
        tx = Buffer.from(signedTransaction, 'hex');
    } 
    else 
    {
        tx = Buffer.from(signedTransaction);
    }

    const configSubmitTransactionBlockfrost = {
        method: 'post',
        url: 'https://cardano-testnet.blockfrost.io/api/v0/tx/submit',
        data: tx ,
        headers: { 'project_id': 'testnetByg9CqH6pKiCG8shQuXCbXy3cpN4fzgd',
        'Content-Type': 'application/cbor' }
        //body: { signedTransaction }
        // body: {
        //     signedTransaction
        // }
    }

    //axios.post('https://cardano-testnet.blockfrost.io/api/v0/tx/submit', { tx }).then(resp => {
    
    axios(configSubmitTransactionBlockfrost).then(resp => {
    
        console.log("submitTransaction on the Cardano blockChain = " + JSON.stringify(resp.data));
        //console.log("hash first address " + resp.data.tx_hash)
    
        //createTransaction(resp.data.min_fee_a, resp.data.min_fee_b, resp.data.pool_deposit, resp.data.key_deposit,resp.data.max_val_size, resp.data.max_tx_size, resp.data.coins_per_utxo_word);
    
        //getProtocolParameters(resp.data);

    }).catch(error => {
        console.log("ERROR submitTransaction on the Cardano blockChain ERROR = " + error + error.error + error.message);
    });


}


function getUTXOforTransaction(hashTransaction: String)
{

    const configLastBlockBlockfrost = {
        method: 'get',
        url: 'https://cardano-testnet.blockfrost.io/api/v0/txs/'+ hashTransaction +'/utxos',
        headers: { 'project_id': 'testnetByg9CqH6pKiCG8shQuXCbXy3cpN4fzgd' }
    }


    axios(configLastBlockBlockfrost).then(resp => {

        console.log("UTXO for transaction result = " + JSON.stringify(resp.data));

    }).catch(error => {
        console.log("UTXO for transaction on the Cardano blockChain ERROR = " + error.data);
    });

}


function startWithProtocolParameters()
{
    const configProtocolBlockfrost = {
        method: 'get',
        url: 'https://cardano-testnet.blockfrost.io/api/v0/epochs/latest/parameters',
        headers: { 'project_id': 'testnetByg9CqH6pKiCG8shQuXCbXy3cpN4fzgd' }
    }
    
    
    axios(configProtocolBlockfrost).then(resp => {
    
        //console.log("latest protocol params Cardano blockChain = " + JSON.stringify(resp.data));
        console.log("min fee " + resp.data.min_fee_a);
    
        //runTransaction(resp.data.min_fee_a, resp.data.min_fee_b, resp.data.pool_deposit, resp.data.key_deposit,resp.data.max_val_size, resp.data.max_tx_size, resp.data.coins_per_utxo_word);
    
    }).catch(error => {
        //console.log("latest protocol params Cardano blockChain = " + error.data);
    });

}

//getUTXOforTransaction("40b9661f635fc384b62ac5e2862c3eb679ec461677c309e71df8049236ff8e57")

//getLastBlockData()

//getUTXOsFromAddress(getAddressOne().to_address().to_bech32());

getUTXOsFromAddress(30000000, "addr_test1qr9tdv6p44asg53ndd3dn8y2dyrey63llaum42mpemc9ztw2k6e5rttmq3frx6mzmxwg56g8jf4rllmeh24krnhs2yks6kkvua");

