import * as CardanoWasm from '@emurgo/cardano-serialization-lib-nodejs';
import { ProtocolParameters, UTXO } from '../types';



export const composeTransaction = (
  address: string,
  outputAddress: string,
  outputAmount: string,
  utxos: UTXO,
  ttl: number,
  protocolParameters: ProtocolParameters,
): {
  txHash: string;
  txBody: CardanoWasm.TransactionBody;
} => {

  if (!utxos || utxos.length === 0) 
  {
    throw Error('No utxo on address ' + address);
  }

  const txBuilder = CardanoWasm.TransactionBuilder.new(
    CardanoWasm.TransactionBuilderConfigBuilder.new()
      .fee_algo(
        CardanoWasm.LinearFee.new(
          CardanoWasm.BigNum.from_str(protocolParameters.min_fee_a.toString()),
          CardanoWasm.BigNum.from_str(protocolParameters.min_fee_b.toString()),
        ),
      )
      .pool_deposit(CardanoWasm.BigNum.from_str(protocolParameters.pool_deposit.toString()))
      .key_deposit(CardanoWasm.BigNum.from_str(protocolParameters.key_deposit.toString())) 
      .coins_per_utxo_byte(CardanoWasm.BigNum.from_str((protocolParameters.coins_per_utxo_size ?? 34482).toString())) 
      .coins_per_utxo_word(CardanoWasm.BigNum.from_str((protocolParameters.coins_per_utxo_word ?? 34482).toString())) 
      .max_value_size(Number(protocolParameters.max_val_size))
      .max_tx_size(protocolParameters.max_tx_size) 
      .build(),
  );

  const outputAddr = CardanoWasm.Address.from_bech32(outputAddress);
  const changeAddr = CardanoWasm.Address.from_bech32(address);

  txBuilder.set_ttl(ttl);

  // Add output to the tx
  txBuilder.add_output(
    CardanoWasm.TransactionOutput.new(
      outputAddr,
      CardanoWasm.Value.new(CardanoWasm.BigNum.from_str(outputAmount)),
    ),
  );

  // Filter out multi asset utxo to keep this simple
  const lovelaceUtxos = utxos.filter(
    (u: any) => !u.amount.find((a: any) => a.unit !== 'lovelace'),
  );

  // Create TransactionUnspentOutputs from utxos fetched from Blockfrost
  const unspentOutputs = CardanoWasm.TransactionUnspentOutputs.new();
  for (const utxo of lovelaceUtxos) {
    const amount = utxo.amount.find(
      (a: any) => a.unit === 'lovelace',
    )?.quantity;

    if (!amount) continue;

    const inputValue = CardanoWasm.Value.new(
      CardanoWasm.BigNum.from_str(amount.toString()),
    );

    const input = CardanoWasm.TransactionInput.new(
      CardanoWasm.TransactionHash.from_bytes(Buffer.from(utxo.tx_hash, 'hex')),
      utxo.output_index,
    );
    const output = CardanoWasm.TransactionOutput.new(changeAddr, inputValue);
    unspentOutputs.add(CardanoWasm.TransactionUnspentOutput.new(input, output));
  }

  txBuilder.add_inputs_from(
    unspentOutputs,
    CardanoWasm.CoinSelectionStrategyCIP2.LargestFirst,
  );

  // Adds a change output if there are more ADA in utxo than we need for the transaction,
  // these coins will be returned to change address
  txBuilder.add_change_if_needed(changeAddr);

  // Build transaction
  const txBody = txBuilder.build();
  const txHash = Buffer.from(
    CardanoWasm.hash_transaction(txBody).to_bytes(),
  ).toString('hex');

  return {
    txHash,
    txBody,
  };
};

