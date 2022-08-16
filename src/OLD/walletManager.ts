import { mnemonicToEntropy } from "bip39"
import * as CardanoWASM from "@emurgo/cardano-serialization-lib-nodejs"
import * as axiosSDK from "axios"


const axios = axiosSDK.default;

const entropy = mnemonicToEntropy(
    [ "crouch", "sister", "metal", "holiday", "cricket", "credit", "system", "short", "cry", "muscle", "artist", "skill", "drop", "box", "spice" ].join(' ')
);

export const getRootKey = () => {
    const rootKey = CardanoWASM.Bip32PrivateKey.from_bip39_entropy(
        Buffer.from(entropy, 'hex'),
        Buffer.from(''),
    );
    return rootKey
}

export const getPublicKey = () => {
    const keyDetails = getKeyDetails();
    return keyDetails.publicKey;
}

export const getPrivateKey = () => {
    const keyDetails = getKeyDetails();
    return keyDetails.privateKey;
}

export const getUtxoPublicKey = () => {
    const keyDetails = getKeyDetails();
    return keyDetails.utxoPubKey;
}

export const getUtxoPrivateKey = () => {
    const keyDetails = getKeyDetails();
    return keyDetails.utxoPrivateKey;
}



export const getBaseAddress = () => {
    const keyDetails = getKeyDetails();
    const baseAddr = CardanoWASM.BaseAddress.new(
        CardanoWASM.NetworkInfo.testnet().network_id(),
        CardanoWASM.StakeCredential.from_keyhash(keyDetails.utxoPubKey.to_raw_key().hash()),
        CardanoWASM.StakeCredential.from_keyhash(keyDetails.stakeKey.to_raw_key().hash()),
    );
    return baseAddr;
}

export const getAddressOne = () => {
    const keyDetails = getKeyDetails();
    const baseAddr = CardanoWASM.BaseAddress.new(
        CardanoWASM.NetworkInfo.testnet().network_id(),
        CardanoWASM.StakeCredential.from_keyhash(keyDetails.utxoPubKey1.to_raw_key().hash()),
        CardanoWASM.StakeCredential.from_keyhash(keyDetails.stakeKey.to_raw_key().hash()),
    );
    return baseAddr;
}

export const getPolicyAddress = () => {
    const keyDetails = getKeyDetails();
    const policyAddress = CardanoWASM.BaseAddress.new(
        CardanoWASM.NetworkInfo.testnet().network_id(),
        CardanoWASM.StakeCredential.from_keyhash(keyDetails.utxoPrivateKey.to_public().hash()),
        CardanoWASM.StakeCredential.from_keyhash(keyDetails.utxoPrivateKey.to_public().hash()),
    );
    return policyAddress;
}


// const testPriveAddress = CardanoWASM.Bip32PrivateKey.from_bech32("ed25519e_sk16rl5fqqf4mg27syjzjrq8h3vq44jnnv52mvyzdttldszjj7a64xtmjwgjtfy25lu0xmv40306lj9pcqpa6slry9eh3mtlqvfjz93vuq0grl80")


// export const getSpecialExampleAddress = () => {
//     const specialAddress = CardanoWASM.BaseAddress.new(
//         CardanoWASM.NetworkInfo.testnet().network_id(),
//         CardanoWASM.StakeCredential.from_keyhash(testPriveAddress.to_public().to_raw_key().hash()),
//         CardanoWASM.StakeCredential.from_keyhash(testPriveAddress.to_public().to_raw_key().hash()),
//     );
//     return specialAddress;
// }



export const getKeyDetails = () => {

    const rootKey = getRootKey()
    
    const privateKey = rootKey.to_raw_key();
    
    //const publicKey = rootKey.to_public().to_raw_key();
    const publicKey = rootKey.to_public();


    const accountKey = rootKey
        .derive(harden(1852)) // purpose -> 1852 = Ecosystem Cardano (Shelley)
        .derive(harden(1815)) // coin type -> 1815 = ADA
        .derive(harden(0)); // account #0 -> change to different account
  
    const utxoPubKey = accountKey
        .derive(0) // external always 0
        .derive(0) // address index: 0
        .to_public();
        
    const utxoPrivateKey = accountKey
        .derive(0) // external always 0
        .derive(0)
        .to_raw_key();


    const utxoPubKey1 = accountKey
        .derive(0) // external always 0
        .derive(1) // address index: 1 
        .to_public();
    

    const stakeKey = accountKey
        .derive(2) // chimeric
        .derive(0)
        .to_public();

    return { privateKey, publicKey, utxoPrivateKey, utxoPubKey, utxoPubKey1, stakeKey }

}

function harden(num: number): number {
    return 0x80000000 + num;
}



let policyKeyHash = CardanoWASM.BaseAddress.from_address(getPolicyAddress().to_address())?.payment_cred().to_keyhash();

console.log("message = " + entropy);
console.log("address 0 = " + getBaseAddress().to_address().to_bech32());

console.log("private key = " + getKeyDetails().privateKey.to_bech32());
console.log("public key = " + getKeyDetails().publicKey.to_bech32());
console.log("utxo address public 0 = " + getKeyDetails().utxoPubKey.to_bech32());
console.log("utxo address private 0 = " + getKeyDetails().utxoPrivateKey.to_bech32());
console.log("utxo address private to public 0 = " + getKeyDetails().utxoPrivateKey.to_public().to_bech32());

console.log("policy key hash = " + Buffer.from(policyKeyHash!.to_bytes()).toString("hex"));
