import * as CardanoWasm from '@emurgo/cardano-serialization-lib-nodejs';


export const signTransactionNFT = (
    txUnsigned: CardanoWasm.Transaction,
    signKey: CardanoWasm.PrivateKey,
    policy: any
  ): CardanoWasm.Transaction => {
  
    const txHash = CardanoWasm.hash_transaction(txUnsigned.body());

    
    const witnesses = txUnsigned.witness_set() ?? CardanoWasm.TransactionWitnessSet.new() // NOTE - getting witnesses from the tx here
    
    const vkeyWitnesses = witnesses.vkeys() ?? CardanoWasm.Vkeywitnesses.new();
    
    vkeyWitnesses.add(CardanoWasm.make_vkey_witness(txHash, signKey));
  
    vkeyWitnesses.add(CardanoWasm.make_vkey_witness(txHash, policy.privateKey));
  
    witnesses.set_vkeys(vkeyWitnesses);

    const transaction = CardanoWasm.Transaction.new(txUnsigned.body(), witnesses, txUnsigned.auxiliary_data());


    return transaction;
  };