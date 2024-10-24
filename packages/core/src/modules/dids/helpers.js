"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDidKey = isDidKey;
exports.didKeyToVerkey = didKeyToVerkey;
exports.verkeyToDidKey = verkeyToDidKey;
exports.didKeyToInstanceOfKey = didKeyToInstanceOfKey;
exports.verkeyToInstanceOfKey = verkeyToInstanceOfKey;
const crypto_1 = require("../../crypto");
const utils_1 = require("../../utils");
const key_1 = require("./methods/key");
function isDidKey(key) {
    return (0, utils_1.isDid)(key, 'key');
}
function didKeyToVerkey(key) {
    if (isDidKey(key)) {
        const publicKeyBase58 = key_1.DidKey.fromDid(key).key.publicKeyBase58;
        return publicKeyBase58;
    }
    return key;
}
function verkeyToDidKey(key) {
    if (isDidKey(key))
        return key;
    const publicKeyBase58 = key;
    const ed25519Key = crypto_1.Key.fromPublicKeyBase58(publicKeyBase58, crypto_1.KeyType.Ed25519);
    const didKey = new key_1.DidKey(ed25519Key);
    return didKey.did;
}
function didKeyToInstanceOfKey(key) {
    const didKey = key_1.DidKey.fromDid(key);
    return didKey.key;
}
function verkeyToInstanceOfKey(verkey) {
    const ed25519Key = crypto_1.Key.fromPublicKeyBase58(verkey, crypto_1.KeyType.Ed25519);
    return ed25519Key;
}
