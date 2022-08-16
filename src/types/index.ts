export type UTXO = {
      /** @description Transaction hash of the UTXO */
      tx_hash: string;
      /**
       * @deprecated
       * @description UTXO index in the transaction
       */
      tx_index: number;
      /** @description UTXO index in the transaction */
      output_index: number;
      amount: {
          /**
           * Format: Lovelace or concatenation of asset policy_id and hex-encoded asset_name
           * @description The unit of the value
           */
          unit: string;
          /** @description The quantity of the unit */
          quantity: string;
      }[];
      /** @description Block hash of the UTXO */
      block: string;
      /** @description The hash of the transaction output datum */
      data_hash: string | null;
      /**
       * @description CBOR encoded inline datum
       * @example 19a6aa
       */
      inline_datum: string | null;
      /**
       * @description The hash of the reference script of the output
       * @example 13a3efd825703a352a8f71f4e2758d08c28c564e8dfcce9f77776ad1
       */
      reference_script_hash: string | null;
}[];

export type ProtocolParameters = {
  /**
             * @description Epoch number
             * @example 225
             */
   epoch: number;
   /**
    * @description The linear factor for the minimum fee calculation for given epoch
    * @example 44
    */
   min_fee_a: number;
   /**
    * @description The constant factor for the minimum fee calculation
    * @example 155381
    */
   min_fee_b: number;
   /**
    * @description Maximum block body size in Bytes
    * @example 65536
    */
   max_block_size: number;
   /**
    * @description Maximum transaction size
    * @example 16384
    */
   max_tx_size: number;
   /**
    * @description Maximum block header size
    * @example 1100
    */
   max_block_header_size: number;
   /**
    * @description The amount of a key registration deposit in Lovelaces
    * @example 2000000
    */
   key_deposit: string;
   /**
    * @description The amount of a pool registration deposit in Lovelaces
    * @example 500000000
    */
   pool_deposit: string;
   /**
    * @description Epoch bound on pool retirement
    * @example 18
    */
   e_max: number;
   /**
    * @description Desired number of pools
    * @example 150
    */
   n_opt: number;
   /**
    * @description Pool pledge influence
    * @example 0.3
    */
   a0: number;
   /**
    * @description Monetary expansion
    * @example 0.003
    */
   rho: number;
   /**
    * @description Treasury expansion
    * @example 0.2
    */
   tau: number;
   /**
    * @description Percentage of blocks produced by federated nodes
    * @example 0.5
    */
   decentralisation_param: number;
   /**
    * @description Seed for extra entropy
    * @example null
    */
   extra_entropy: {
       [key: string]: unknown;
   } | null;
   /**
    * @description Accepted protocol major version
    * @example 2
    */
   protocol_major_ver: number;
   /**
    * @description Accepted protocol minor version
    * @example 0
    */
   protocol_minor_ver: number;
   /**
    * @description Minimum UTXO value
    * @example 1000000
    */
   min_utxo: string;
   /**
    * @description Minimum stake cost forced on the pool
    * @example 340000000
    */
   min_pool_cost: string;
   /**
    * @description Epoch number only used once
    * @example 1a3be38bcbb7911969283716ad7aa550250226b76a61fc51cc9a9a35d9276d81
    */
   nonce: string;
   /**
    * @description The per word cost of script memory usage
    * @example 0.0577
    */
   price_mem: number | null;
   /**
    * @description The cost of script execution step usage
    * @example 0.0000721
    */
   price_step: number | null;
   /**
    * @description The maximum number of execution memory allowed to be used in a single transaction
    * @example 10000000
    */
   max_tx_ex_mem: string | null;
   /**
    * @description The maximum number of execution steps allowed to be used in a single transaction
    * @example 10000000000
    */
   max_tx_ex_steps: string | null;
   /**
    * @description The maximum number of execution memory allowed to be used in a single block
    * @example 50000000
    */
   max_block_ex_mem: string | null;
   /**
    * @description The maximum number of execution steps allowed to be used in a single block
    * @example 40000000000
    */
   max_block_ex_steps: string | null;
   /**
    * @description The maximum Val size
    * @example 5000
    */
   max_val_size: string | null;
   /**
    * @description The percentage of the transactions fee which must be provided as collateral when including non-native scripts
    * @example 150
    */
   collateral_percent: number | null;
   /**
    * @description The maximum number of collateral inputs allowed in a transaction
    * @example 3
    */
   max_collateral_inputs: number | null;
   /**
    * @description Cost per UTxO word for Alonzo. Cost per UTxO byte for Babbage and later.
    * @example 34482
    */
   coins_per_utxo_size: string | null;
   /**
    * @description Cost per UTxO word for Alonzo. Cost per UTxO byte for Babbage and later.
    * @example 34482
    */
   coins_per_utxo_word: string | null;
}

export interface AssetAmount {
  unit: string;
  quantity: string;
}


export type LatestBlock = {
  /**
   * @description Block creation time in UNIX time
   * @example 1641338934
   */
  time: number;
  /**
   * @description Block number
   * @example 15243593
   */
  height: number | null;
  /**
   * @description Hash of the block
   * @example 4ea1ba291e8eef538635a53e59fddba7810d1679631cc3aed7c8e6c4091a516a
   */
  hash: string;
  /**
   * @description Slot number
   * @example 412162133
   */
  slot: number | null;
  /**
   * @description Epoch number
   * @example 425
   */
  epoch: number | null;
  /**
   * @description Slot within the epoch
   * @example 12
   */
  epoch_slot: number | null;
  /**
   * @description Bech32 ID of the slot leader or specific block description in case there is no slot leader
   * @example pool1pu5jlj4q9w9jlxeu370a3c9myx47md5j5m2str0naunn2qnikdy
   */
  slot_leader: string;
  /**
   * @description Block size in Bytes
   * @example 3
   */
  size: number;
  /**
   * @description Number of transactions in the block
   * @example 1
   */
  tx_count: number;
  /**
   * @description Total output within the block in Lovelaces
   * @example 128314491794
   */
  output: string | null;
  /**
   * @description Total fees within the block in Lovelaces
   * @example 592661
   */
  fees: string | null;
  /**
   * @description VRF key of the block
   * @example vrf_vk1wf2k6lhujezqcfe00l6zetxpnmh9n6mwhpmhm0dvfh3fxgmdnrfqkms8ty
   */
  block_vrf: string | null;
  /**
   * @description Hash of the previous block
   * @example 43ebccb3ac72c7cebd0d9b755a4b08412c9f5dcb81b8a0ad1e3c197d29d47b05
   */
  previous_block: string | null;
  /**
   * @description Hash of the next block
   * @example 8367f026cf4b03e116ff8ee5daf149b55ba5a6ec6dec04803b8dc317721d15fa
   */
  next_block: string | null;
  /**
   * @description Number of block confirmations
   * @example 4698
   */
  confirmations: number;
};

