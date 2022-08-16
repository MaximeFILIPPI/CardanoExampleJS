import * as CardanoWasm from '@emurgo/cardano-serialization-lib-nodejs';


export const prepareNFT = (
    signKey: CardanoWasm.PrivateKey,
    policyTTL: number,                          // Timelock for policy
    assetName: string,                          // example = "asdNFT5"
    assetDescription: string,                   // example = "some descr this is a new nft with same policy"
    assetURL: string,                           // ipfs url address of the media (example format = ipfs://QmNhmDPJMgdsFRM9HyiQEJqrKkpsWFshqES8mPaiFRq9Zk)
    mediaType: string,                          // example = "image/jpeg"
  ): {
    policy: any,
    policyKeyHash: CardanoWasm.Ed25519KeyHash,
    metadata: any,
    mintScript: CardanoWasm.NativeScript,
  } => {


    // Create the policy
    const policy = 
    {
      privateKey: signKey, // policy key
      ttl: policyTTL, // policy ttl
    }


    // Create the policy from public key of private key
    const policyPubKey = signKey.to_public();


    // Derive private key to policy key address
    const policyAddr: CardanoWasm.Address = CardanoWasm.BaseAddress.new(
        CardanoWasm.NetworkInfo.testnet().network_id(),
        CardanoWasm.StakeCredential.from_keyhash(policyPubKey.hash()),
        CardanoWasm.StakeCredential.from_keyhash(policyPubKey.hash())
    ).to_address();


    // Convert to policy key hash
    const policyKeyHash = CardanoWasm.BaseAddress.from_address(policyAddr)!.payment_cred().to_keyhash()!;

    console.log('POLICY_KEYHASH: ' + Buffer.from(policyKeyHash.to_bytes()).toString("hex"));
    

    // Create main native scripts array
    const scripts = CardanoWasm.NativeScripts.new();

    // add key hash script so only people with same policy key can mint assets using this policyId
    const keyHashScript = CardanoWasm.NativeScript.new_script_pubkey(
        CardanoWasm.ScriptPubkey.new(policyKeyHash)
    );

    // Add keyhash of policy hash script to main native scripts array
    scripts.add(keyHashScript);

    // Check policy ttl if null
    //const policyTtl = policy.ttl || policyTTL;
    console.log('POLICY_TTL: ' + policyTTL);


    // add timelock to policy so it's locked after the slot
    const timelock = CardanoWasm.TimelockExpiry.new(policyTTL);//policyTtl ?? currentSlot);
    const timelockScript = CardanoWasm.NativeScript.new_timelock_expiry(timelock);

    // add timelock to the main native scripts array
    scripts.add(timelockScript);


    // Create the mint script
    const mintScript = CardanoWasm.NativeScript.new_script_all(
        CardanoWasm.ScriptAll.new(scripts)
    );


    const policyId = Buffer.from(mintScript.hash().to_bytes()).toString("hex");

    console.log('POLICY_ID: ' + policyId);


    const metadata = 
    {
        [policyId]: {
            [assetName]: {
                name: assetName,
                assetDescription,
                image: assetURL,
                mediaType,
            },
        },
    };


    //console.log('METADATA: ' + JSON.stringify(metadata, null, 4));


    return {
        policy: policy,
        metadata: metadata,
        policyKeyHash: policyKeyHash,
        mintScript: mintScript
    };
}