import * as CardanoWasm from '@emurgo/cardano-serialization-lib-nodejs';
import { mnemonicToEntropy } from 'bip39';

const harden = (num: number): number => {
  return 0x80000000 + num;
};

export const deriveAddressPrvKey = (
  bipPrvKey: CardanoWasm.Bip32PrivateKey,
  testnet: boolean,
  addressIndex: number,
): {
  cardanoKeys: CardanoKeys;
} => {
  
  const networkId = testnet
    ? CardanoWasm.NetworkInfo.testnet().network_id()
    : CardanoWasm.NetworkInfo.mainnet().network_id();


  const accountIndex = 0;

  // ACCOUNT KEY
  const accountKey = bipPrvKey
    .derive(harden(1852)) // purpose
    .derive(harden(1815)) // coin type
    .derive(harden(accountIndex)); // account #
    
  // ACCOUNT KEY : PRIVATE
  const privateKey = accountKey.to_raw_key();


  // STAKE KEY
  const stakePublicKey  = accountKey
    .derive(2) // chimeric
    .derive(0)
    .to_public();


  // STAKE KEY : PRIVATE
  const stakePrivateKey = accountKey
    .derive(2) // chimeric
    .derive(0)
    .to_raw_key();
  

  const rewardAddr = CardanoWasm.RewardAddress.new(
    networkId,
    CardanoWasm.StakeCredential.from_keyhash(stakePublicKey.to_raw_key().hash())
  );

  const rewardAddress = rewardAddr.to_address().to_bech32();

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
  const paymentPublicKey = accountKey
    .derive(0)      // external
    .derive(0)      // address index 0
    .to_public();

  console.log("address 0 pub key = " + paymentPublicKey.to_bech32());
  console.log("address 0 pub key to raw key = " + paymentPublicKey.to_raw_key().to_bech32());
    

  // ADDRESS 0 KEY: Private
  const paymentSignKey = accountKey
    .derive(0)      // external
    .derive(0)      // address index 0
    .to_raw_key();

  console.log("address 0 sign key = " + paymentSignKey.to_bech32());
            
  // ADDRESS 0: BASE
  const baseAddress0 = CardanoWasm.BaseAddress.new(networkId,
    CardanoWasm.StakeCredential.from_keyhash(paymentPublicKey.to_raw_key().hash()),
    CardanoWasm.StakeCredential.from_keyhash(stakePublicKey.to_raw_key().hash()),
  );

  // ADDRESS 0: BECH32
  const address0 = baseAddress0.to_address().to_bech32();

  console.log("address 0 = " + address0);




  //--------------------------------------------------------------------------------------------
  //-------------------------------------- ADDRESS 1 -------------------------------------------
  //--------------------------------------------------------------------------------------------
    
  const paymentPublicKey1 = accountKey
    .derive(0)      // external
    .derive(1)      // address index 1
    .to_public();
    
  const paymentSignKey1 = accountKey
    .derive(0)      // external
    .derive(1)      // address index 1
    .to_raw_key();

  var baseAddress1 = CardanoWasm.BaseAddress.new(networkId,
    CardanoWasm.StakeCredential.from_keyhash(paymentPublicKey1.to_raw_key().hash()),
    CardanoWasm.StakeCredential.from_keyhash(stakePublicKey.to_raw_key().hash()),
  );

  // ADDRESS 1: BECH32
  const address1 = baseAddress1.to_address().to_bech32();

  console.log("address 1 = " + address1);




  //--------------------------------------------------------------------------------------------
  //-------------------------------------- ADDRESS 2 -------------------------------------------
  //--------------------------------------------------------------------------------------------

  const paymentPublicKey2 = accountKey
    .derive(0)      // external
    .derive(2)      // address index 2
    .to_public();
  

  const paymentSignKey2 = accountKey
    .derive(0)      // external
    .derive(2)      // address index 2
    .to_raw_key();

  const baseAddress2 = CardanoWasm.BaseAddress.new(networkId,
    CardanoWasm.StakeCredential.from_keyhash(paymentPublicKey2.to_raw_key().hash()),
    CardanoWasm.StakeCredential.from_keyhash(stakePublicKey.to_raw_key().hash()),
  );
      
  // ADDRESS 0: BECH32
  const address2 = baseAddress2.to_address().to_bech32();
  




  //--------------------------------------------------------------------------------------------
  //-------------------------------------- ADDRESS INDEX -------------------------------------------
  //--------------------------------------------------------------------------------------------

  const paymentPublicKeyIndex = accountKey
    .derive(0)                  // external
    .derive(addressIndex)       // address index 
    .to_public();
  

  const paymentSignKeyIndex = accountKey
    .derive(0)                  // external
    .derive(addressIndex)       // address index
    .to_raw_key();

  const baseAddressSpecial = CardanoWasm.BaseAddress.new(networkId,
    CardanoWasm.StakeCredential.from_keyhash(paymentPublicKeyIndex.to_raw_key().hash()),
    CardanoWasm.StakeCredential.from_keyhash(stakePublicKey.to_raw_key().hash()),
  );
      
  // ADDRESS 0: BECH32
  const addressSpecial = baseAddressSpecial.to_address().to_bech32();
  
  

  var cardanoKeys: CardanoKeys = {

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
    addrIndexBech32: baseAddressSpecial.to_address().to_bech32(),

  }

  return { cardanoKeys }; // signKeyAddrAtIndex: utxoKey.to_raw_key(), addrAtIndexBech32: address };
};

export const mnemonicToPrivateKey = (
  mnemonic: string,
): CardanoWasm.Bip32PrivateKey => {
  
  const entropy = mnemonicToEntropy(mnemonic);

  const rootKey = CardanoWasm.Bip32PrivateKey.from_bip39_entropy(
    Buffer.from(entropy, 'hex'),
    Buffer.from(''),
  );

  return rootKey;
};

export interface CardanoKeys
{
  accountKey: CardanoWasm.Bip32PrivateKey;
  accountPrivateKey: CardanoWasm.PrivateKey;

  stakePubKey: CardanoWasm.Bip32PublicKey;
  stakeSignKey: CardanoWasm.PrivateKey;
  stakeRewardAddr: CardanoWasm.RewardAddress;
  stakeRewardAddrBech32: string;


  addr0Pubkey: CardanoWasm.Bip32PublicKey;
  addr0SignKey: CardanoWasm.PrivateKey;
  addr0: CardanoWasm.BaseAddress;
  addr0Bech32: string;


  addr1Pubkey: CardanoWasm.Bip32PublicKey;
  addr1SignKey: CardanoWasm.PrivateKey;
  addr1: CardanoWasm.BaseAddress;
  addr1Bech32: string;


  addr2Pubkey: CardanoWasm.Bip32PublicKey;
  addr2SignKey: CardanoWasm.PrivateKey;
  addr2: CardanoWasm.BaseAddress;
  addr2Bech32: string;


  addrIndexPubkey: CardanoWasm.Bip32PublicKey;
  addrIndexSignKey: CardanoWasm.PrivateKey;
  addrIndex: CardanoWasm.BaseAddress;
  addrIndexBech32: string;

}