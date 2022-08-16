"use strict";
exports.__esModule = true;
exports.prepareNFT = void 0;
var CardanoWasm = require("@emurgo/cardano-serialization-lib-nodejs");
var prepareNFT = function (signKey, policyTTL, // Timelock for policy
assetName, // example = "asdNFT5"
assetDescription, // example = "some descr this is a new nft with same policy"
assetURL, // ipfs url address of the media (example format = ipfs://QmNhmDPJMgdsFRM9HyiQEJqrKkpsWFshqES8mPaiFRq9Zk)
mediaType) {
    var _a, _b;
    // Create the policy
    var policy = {
        privateKey: signKey,
        ttl: policyTTL
    };
    // Create the policy from public key of private key
    var policyPubKey = signKey.to_public();
    // Derive private key to policy key address
    var policyAddr = CardanoWasm.BaseAddress["new"](CardanoWasm.NetworkInfo.testnet().network_id(), CardanoWasm.StakeCredential.from_keyhash(policyPubKey.hash()), CardanoWasm.StakeCredential.from_keyhash(policyPubKey.hash())).to_address();
    // Convert to policy key hash
    var policyKeyHash = CardanoWasm.BaseAddress.from_address(policyAddr).payment_cred().to_keyhash();
    console.log('POLICY_KEYHASH: ' + Buffer.from(policyKeyHash.to_bytes()).toString("hex"));
    // Create main native scripts array
    var scripts = CardanoWasm.NativeScripts["new"]();
    // add key hash script so only people with same policy key can mint assets using this policyId
    var keyHashScript = CardanoWasm.NativeScript.new_script_pubkey(CardanoWasm.ScriptPubkey["new"](policyKeyHash));
    // Add keyhash of policy hash script to main native scripts array
    scripts.add(keyHashScript);
    // Check policy ttl if null
    //const policyTtl = policy.ttl || policyTTL;
    console.log('POLICY_TTL: ' + policyTTL);
    // add timelock to policy so it's locked after the slot
    var timelock = CardanoWasm.TimelockExpiry["new"](policyTTL); //policyTtl ?? currentSlot);
    var timelockScript = CardanoWasm.NativeScript.new_timelock_expiry(timelock);
    // add timelock to the main native scripts array
    scripts.add(timelockScript);
    // Create the mint script
    var mintScript = CardanoWasm.NativeScript.new_script_all(CardanoWasm.ScriptAll["new"](scripts));
    var policyId = Buffer.from(mintScript.hash().to_bytes()).toString("hex");
    console.log('POLICY_ID: ' + policyId);
    var metadata = (_a = {},
        _a[policyId] = (_b = {},
            _b[assetName] = {
                name: assetName,
                assetDescription: assetDescription,
                image: assetURL,
                mediaType: mediaType
            },
            _b),
        _a);
    //console.log('METADATA: ' + JSON.stringify(metadata, null, 4));
    return {
        policy: policy,
        metadata: metadata,
        policyKeyHash: policyKeyHash,
        mintScript: mintScript
    };
};
exports.prepareNFT = prepareNFT;
