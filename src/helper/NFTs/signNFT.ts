import * as CardanoWasm from '@emurgo/cardano-serialization-lib-nodejs';


export const signTransactionNFT = (
    txUnsigned: CardanoWasm.Transaction,
    //txBody: CardanoWasm.TransactionBody,
    signKey: CardanoWasm.PrivateKey,
    policy: any,
    mintScript: CardanoWasm.NativeScript,
  ): CardanoWasm.Transaction => {
  
    const txHash = CardanoWasm.hash_transaction(txUnsigned.body());
    
    //const witnesses = CardanoWasm.TransactionWitnessSet.new();
    
    const witnesses = txUnsigned.witness_set() // NOTE - getting witnesses from the tx here
    
    const vkeyWitnesses = witnesses.vkeys() ?? CardanoWasm.Vkeywitnesses.new();
    
    vkeyWitnesses.add(CardanoWasm.make_vkey_witness(txHash, signKey));
  
    vkeyWitnesses.add(CardanoWasm.make_vkey_witness(txHash, policy.privateKey));
  
    witnesses.set_vkeys(vkeyWitnesses);
  
    //const transactionWitnessSet = txUnsigned.witness_set() // NOTE - getting witnesses from the tx here
  
  
  
  
    // witnesses.set_native_scripts;
  
    // const witnessScripts = CardanoWasm.NativeScripts.new();
  
    // witnessScripts.add(mintScript);
    
    // witnesses.set_native_scripts(witnessScripts);
  
  
  
  
    //transactionWitnessSet.set_vkeys(witnesses.vkeys()!)
  
    //const transaction = CardanoWasm.Transaction.new(txUnsigned.body(), witnesses, txUnsigned.auxiliary_data());
  
    const transaction = CardanoWasm.Transaction.new(txUnsigned.body(), witnesses, txUnsigned.auxiliary_data());
  
    return transaction;
  };