"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AskarBaseWallet = void 0;
const core_1 = require("@aries-framework/core");
const aries_askar_shared_1 = require("@hyperledger/aries-askar-shared");
// eslint-disable-next-line import/order
const bn_js_1 = __importDefault(require("bn.js"));
const isError = (error) => error instanceof Error;
const utils_1 = require("../utils");
const JweEnvelope_1 = require("./JweEnvelope");
class AskarBaseWallet {
    constructor(logger, signingKeyProviderRegistry) {
        this.logger = logger;
        this.signingKeyProviderRegistry = signingKeyProviderRegistry;
    }
    get session() {
        if (!this._session) {
            throw new core_1.AriesFrameworkError('No Wallet Session is opened');
        }
        return this._session;
    }
    get supportedKeyTypes() {
        const signingKeyProviderSupportedKeyTypes = this.signingKeyProviderRegistry.supportedKeyTypes;
        return Array.from(new Set([...utils_1.keyTypesSupportedByAskar, ...signingKeyProviderSupportedKeyTypes]));
    }
    /**
     * Create a key with an optional seed and keyType.
     * The keypair is also automatically stored in the wallet afterwards
     */
    createKey(_a) {
        return __awaiter(this, arguments, void 0, function* ({ seed, privateKey, keyType }) {
            try {
                if (seed && privateKey) {
                    throw new core_1.WalletError('Only one of seed and privateKey can be set');
                }
                if (seed && !(0, core_1.isValidSeed)(seed, keyType)) {
                    throw new core_1.WalletError('Invalid seed provided');
                }
                if (privateKey && !(0, core_1.isValidPrivateKey)(privateKey, keyType)) {
                    throw new core_1.WalletError('Invalid private key provided');
                }
                if ((0, utils_1.isKeyTypeSupportedByAskar)(keyType)) {
                    const algorithm = (0, aries_askar_shared_1.keyAlgFromString)(keyType);
                    // Create key
                    let key;
                    try {
                        const key = privateKey
                            ? aries_askar_shared_1.Key.fromSecretBytes({ secretKey: privateKey, algorithm })
                            : seed
                                ? aries_askar_shared_1.Key.fromSeed({ seed, algorithm })
                                : aries_askar_shared_1.Key.generate(algorithm);
                        const keyPublicBytes = key.publicBytes;
                        // Store key
                        yield this.session.insertKey({ key, name: core_1.TypedArrayEncoder.toBase58(keyPublicBytes) });
                        key.handle.free();
                        return core_1.Key.fromPublicKey(keyPublicBytes, keyType);
                    }
                    catch (error) {
                        key === null || key === void 0 ? void 0 : key.handle.free();
                        // Handle case where key already exists
                        if ((0, utils_1.isAskarError)(error, utils_1.AskarErrorCode.Duplicate)) {
                            throw new core_1.WalletKeyExistsError('Key already exists');
                        }
                        // Otherwise re-throw error
                        throw error;
                    }
                }
                else {
                    // Check if there is a signing key provider for the specified key type.
                    if (this.signingKeyProviderRegistry.hasProviderForKeyType(keyType)) {
                        const signingKeyProvider = this.signingKeyProviderRegistry.getProviderForKeyType(keyType);
                        const keyPair = yield signingKeyProvider.createKeyPair({ seed, privateKey });
                        yield this.storeKeyPair(keyPair);
                        return core_1.Key.fromPublicKeyBase58(keyPair.publicKeyBase58, keyType);
                    }
                    throw new core_1.WalletError(`Unsupported key type: '${keyType}'`);
                }
            }
            catch (error) {
                // If already instance of `WalletError`, re-throw
                if (error instanceof core_1.WalletError)
                    throw error;
                if (!isError(error)) {
                    throw new core_1.AriesFrameworkError('Attempted to throw error, but it was not of type Error', { cause: error });
                }
                throw new core_1.WalletError(`Error creating key with key type '${keyType}': ${error.message}`, { cause: error });
            }
        });
    }
    /**
     * sign a Buffer with an instance of a Key class
     *
     * @param data Buffer The data that needs to be signed
     * @param key Key The key that is used to sign the data
     *
     * @returns A signature for the data
     */
    sign(_a) {
        return __awaiter(this, arguments, void 0, function* ({ data, key }) {
            let keyEntry;
            try {
                if ((0, utils_1.isKeyTypeSupportedByAskar)(key.keyType)) {
                    if (!core_1.TypedArrayEncoder.isTypedArray(data)) {
                        throw new core_1.WalletError(`Currently not supporting signing of multiple messages`);
                    }
                    keyEntry = yield this.session.fetchKey({ name: key.publicKeyBase58 });
                    if (!keyEntry) {
                        throw new core_1.WalletError('Key entry not found');
                    }
                    const signed = keyEntry.key.signMessage({ message: data });
                    keyEntry.key.handle.free();
                    return core_1.Buffer.from(signed);
                }
                else {
                    // Check if there is a signing key provider for the specified key type.
                    if (this.signingKeyProviderRegistry.hasProviderForKeyType(key.keyType)) {
                        const signingKeyProvider = this.signingKeyProviderRegistry.getProviderForKeyType(key.keyType);
                        const keyPair = yield this.retrieveKeyPair(key.publicKeyBase58);
                        const signed = yield signingKeyProvider.sign({
                            data,
                            privateKeyBase58: keyPair.privateKeyBase58,
                            publicKeyBase58: key.publicKeyBase58,
                        });
                        return signed;
                    }
                    throw new core_1.WalletError(`Unsupported keyType: ${key.keyType}`);
                }
            }
            catch (error) {
                keyEntry === null || keyEntry === void 0 ? void 0 : keyEntry.key.handle.free();
                if (!isError(error)) {
                    throw new core_1.AriesFrameworkError('Attempted to throw error, but it was not of type Error', { cause: error });
                }
                throw new core_1.WalletError(`Error signing data with verkey ${key.publicKeyBase58}. ${error.message}`, { cause: error });
            }
        });
    }
    /**
     * Verify the signature with the data and the used key
     *
     * @param data Buffer The data that has to be confirmed to be signed
     * @param key Key The key that was used in the signing process
     * @param signature Buffer The signature that was created by the signing process
     *
     * @returns A boolean whether the signature was created with the supplied data and key
     *
     * @throws {WalletError} When it could not do the verification
     * @throws {WalletError} When an unsupported keytype is used
     */
    verify(_a) {
        return __awaiter(this, arguments, void 0, function* ({ data, key, signature }) {
            let askarKey;
            try {
                if ((0, utils_1.isKeyTypeSupportedByAskar)(key.keyType)) {
                    if (!core_1.TypedArrayEncoder.isTypedArray(data)) {
                        throw new core_1.WalletError(`Currently not supporting verification of multiple messages`);
                    }
                    const askarKey = aries_askar_shared_1.Key.fromPublicBytes({
                        algorithm: (0, aries_askar_shared_1.keyAlgFromString)(key.keyType),
                        publicKey: key.publicKey,
                    });
                    const verified = askarKey.verifySignature({ message: data, signature });
                    askarKey.handle.free();
                    return verified;
                }
                else {
                    // Check if there is a signing key provider for the specified key type.
                    if (this.signingKeyProviderRegistry.hasProviderForKeyType(key.keyType)) {
                        const signingKeyProvider = this.signingKeyProviderRegistry.getProviderForKeyType(key.keyType);
                        const signed = yield signingKeyProvider.verify({
                            data,
                            signature,
                            publicKeyBase58: key.publicKeyBase58,
                        });
                        return signed;
                    }
                    throw new core_1.WalletError(`Unsupported keyType: ${key.keyType}`);
                }
            }
            catch (error) {
                askarKey === null || askarKey === void 0 ? void 0 : askarKey.handle.free();
                if (!isError(error)) {
                    throw new core_1.AriesFrameworkError('Attempted to throw error, but it was not of type Error', { cause: error });
                }
                throw new core_1.WalletError(`Error verifying signature of data signed with verkey ${key.publicKeyBase58}`, {
                    cause: error,
                });
            }
        });
    }
    /**
     * Pack a message using DIDComm V1 algorithm
     *
     * @param payload message to send
     * @param recipientKeys array containing recipient keys in base58
     * @param senderVerkey sender key in base58
     * @returns JWE Envelope to send
     */
    pack(payload, recipientKeys, senderVerkey // in base58
    ) {
        return __awaiter(this, void 0, void 0, function* () {
            let cek;
            let senderKey;
            let senderExchangeKey;
            try {
                cek = aries_askar_shared_1.Key.generate(aries_askar_shared_1.KeyAlgs.Chacha20C20P);
                senderKey = senderVerkey ? yield this.session.fetchKey({ name: senderVerkey }) : undefined;
                if (senderVerkey && !senderKey) {
                    throw new core_1.WalletError(`Unable to pack message. Sender key ${senderVerkey} not found in wallet.`);
                }
                senderExchangeKey = senderKey ? senderKey.key.convertkey({ algorithm: aries_askar_shared_1.KeyAlgs.X25519 }) : undefined;
                const recipients = [];
                for (const recipientKey of recipientKeys) {
                    let targetExchangeKey;
                    try {
                        targetExchangeKey = aries_askar_shared_1.Key.fromPublicBytes({
                            publicKey: core_1.Key.fromPublicKeyBase58(recipientKey, core_1.KeyType.Ed25519).publicKey,
                            algorithm: aries_askar_shared_1.KeyAlgs.Ed25519,
                        }).convertkey({ algorithm: aries_askar_shared_1.KeyAlgs.X25519 });
                        if (senderVerkey && senderExchangeKey) {
                            const encryptedSender = aries_askar_shared_1.CryptoBox.seal({
                                recipientKey: targetExchangeKey,
                                message: core_1.Buffer.from(senderVerkey),
                            });
                            const nonce = aries_askar_shared_1.CryptoBox.randomNonce();
                            const encryptedCek = aries_askar_shared_1.CryptoBox.cryptoBox({
                                recipientKey: targetExchangeKey,
                                senderKey: senderExchangeKey,
                                message: cek.secretBytes,
                                nonce,
                            });
                            recipients.push(new JweEnvelope_1.JweRecipient({
                                encryptedKey: encryptedCek,
                                header: {
                                    kid: recipientKey,
                                    sender: core_1.TypedArrayEncoder.toBase64URL(encryptedSender),
                                    iv: core_1.TypedArrayEncoder.toBase64URL(nonce),
                                },
                            }));
                        }
                        else {
                            const encryptedCek = aries_askar_shared_1.CryptoBox.seal({
                                recipientKey: targetExchangeKey,
                                message: cek.secretBytes,
                            });
                            recipients.push(new JweEnvelope_1.JweRecipient({
                                encryptedKey: encryptedCek,
                                header: {
                                    kid: recipientKey,
                                },
                            }));
                        }
                    }
                    finally {
                        targetExchangeKey === null || targetExchangeKey === void 0 ? void 0 : targetExchangeKey.handle.free();
                    }
                }
                const protectedJson = {
                    enc: 'xchacha20poly1305_ietf',
                    typ: 'JWM/1.0',
                    alg: senderVerkey ? 'Authcrypt' : 'Anoncrypt',
                    recipients: recipients.map((item) => core_1.JsonTransformer.toJSON(item)),
                };
                const { ciphertext, tag, nonce } = cek.aeadEncrypt({
                    message: core_1.Buffer.from(JSON.stringify(payload)),
                    aad: core_1.Buffer.from(core_1.JsonEncoder.toBase64URL(protectedJson)),
                }).parts;
                const envelope = new JweEnvelope_1.JweEnvelope({
                    ciphertext: core_1.TypedArrayEncoder.toBase64URL(ciphertext),
                    iv: core_1.TypedArrayEncoder.toBase64URL(nonce),
                    protected: core_1.JsonEncoder.toBase64URL(protectedJson),
                    tag: core_1.TypedArrayEncoder.toBase64URL(tag),
                }).toJson();
                return envelope;
            }
            finally {
                cek === null || cek === void 0 ? void 0 : cek.handle.free();
                senderKey === null || senderKey === void 0 ? void 0 : senderKey.key.handle.free();
                senderExchangeKey === null || senderExchangeKey === void 0 ? void 0 : senderExchangeKey.handle.free();
            }
        });
    }
    /**
     * Unpacks a JWE Envelope coded using DIDComm V1 algorithm
     *
     * @param messagePackage JWE Envelope
     * @returns UnpackedMessageContext with plain text message, sender key and recipient key
     */
    unpack(messagePackage) {
        return __awaiter(this, void 0, void 0, function* () {
            const protectedJson = core_1.JsonEncoder.fromBase64(messagePackage.protected);
            const alg = protectedJson.alg;
            if (!['Anoncrypt', 'Authcrypt'].includes(alg)) {
                throw new core_1.WalletError(`Unsupported pack algorithm: ${alg}`);
            }
            const recipients = [];
            for (const recip of protectedJson.recipients) {
                const kid = recip.header.kid;
                if (!kid) {
                    throw new core_1.WalletError('Blank recipient key');
                }
                const sender = recip.header.sender ? core_1.TypedArrayEncoder.fromBase64(recip.header.sender) : undefined;
                const iv = recip.header.iv ? core_1.TypedArrayEncoder.fromBase64(recip.header.iv) : undefined;
                if (sender && !iv) {
                    throw new core_1.WalletError('Missing IV');
                }
                else if (!sender && iv) {
                    throw new core_1.WalletError('Unexpected IV');
                }
                recipients.push({
                    kid,
                    sender,
                    iv,
                    encrypted_key: core_1.TypedArrayEncoder.fromBase64(recip.encrypted_key),
                });
            }
            let payloadKey, senderKey, recipientKey;
            for (const recipient of recipients) {
                let recipientKeyEntry;
                let sender_x;
                let recip_x;
                try {
                    recipientKeyEntry = yield this.session.fetchKey({ name: recipient.kid });
                    if (recipientKeyEntry) {
                        const recip_x = recipientKeyEntry.key.convertkey({ algorithm: aries_askar_shared_1.KeyAlgs.X25519 });
                        recipientKey = recipient.kid;
                        if (recipient.sender && recipient.iv) {
                            senderKey = core_1.TypedArrayEncoder.toUtf8String(aries_askar_shared_1.CryptoBox.sealOpen({
                                recipientKey: recip_x,
                                ciphertext: recipient.sender,
                            }));
                            const sender_x = aries_askar_shared_1.Key.fromPublicBytes({
                                algorithm: aries_askar_shared_1.KeyAlgs.Ed25519,
                                publicKey: core_1.TypedArrayEncoder.fromBase58(senderKey),
                            }).convertkey({ algorithm: aries_askar_shared_1.KeyAlgs.X25519 });
                            payloadKey = aries_askar_shared_1.CryptoBox.open({
                                recipientKey: recip_x,
                                senderKey: sender_x,
                                message: recipient.encrypted_key,
                                nonce: recipient.iv,
                            });
                        }
                        else {
                            payloadKey = aries_askar_shared_1.CryptoBox.sealOpen({ ciphertext: recipient.encrypted_key, recipientKey: recip_x });
                        }
                        break;
                    }
                }
                finally {
                    recipientKeyEntry === null || recipientKeyEntry === void 0 ? void 0 : recipientKeyEntry.key.handle.free();
                    sender_x === null || sender_x === void 0 ? void 0 : sender_x.handle.free();
                    recip_x === null || recip_x === void 0 ? void 0 : recip_x.handle.free();
                }
            }
            if (!payloadKey) {
                throw new core_1.WalletError('No corresponding recipient key found');
            }
            if (!senderKey && alg === 'Authcrypt') {
                throw new core_1.WalletError('Sender public key not provided for Authcrypt');
            }
            let cek;
            try {
                cek = aries_askar_shared_1.Key.fromSecretBytes({ algorithm: aries_askar_shared_1.KeyAlgs.Chacha20C20P, secretKey: payloadKey });
                const message = cek.aeadDecrypt({
                    ciphertext: core_1.TypedArrayEncoder.fromBase64(messagePackage.ciphertext),
                    nonce: core_1.TypedArrayEncoder.fromBase64(messagePackage.iv),
                    tag: core_1.TypedArrayEncoder.fromBase64(messagePackage.tag),
                    aad: core_1.TypedArrayEncoder.fromString(messagePackage.protected),
                });
                return {
                    plaintextMessage: core_1.JsonEncoder.fromBuffer(message),
                    senderKey,
                    recipientKey,
                };
            }
            finally {
                cek === null || cek === void 0 ? void 0 : cek.handle.free();
            }
        });
    }
    generateNonce() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // generate an 80-bit nonce suitable for AnonCreds proofs
                const nonce = aries_askar_shared_1.CryptoBox.randomNonce().slice(0, 10);
                return new bn_js_1.default(nonce).toString();
            }
            catch (error) {
                if (!isError(error)) {
                    throw new core_1.AriesFrameworkError('Attempted to throw error, but it was not of type Error', { cause: error });
                }
                throw new core_1.WalletError('Error generating nonce', { cause: error });
            }
        });
    }
    generateWalletKey() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return aries_askar_shared_1.Store.generateRawKey();
            }
            catch (error) {
                throw new core_1.WalletError('Error generating wallet key', { cause: error });
            }
        });
    }
    retrieveKeyPair(publicKeyBase58) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const entryObject = yield this.session.fetch({ category: 'KeyPairRecord', name: `key-${publicKeyBase58}` });
                if (entryObject === null || entryObject === void 0 ? void 0 : entryObject.value) {
                    return core_1.JsonEncoder.fromString(entryObject === null || entryObject === void 0 ? void 0 : entryObject.value);
                }
                else {
                    throw new core_1.WalletError(`No content found for record with public key: ${publicKeyBase58}`);
                }
            }
            catch (error) {
                throw new core_1.WalletError('Error retrieving KeyPair record', { cause: error });
            }
        });
    }
    storeKeyPair(keyPair) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.session.insert({
                    category: 'KeyPairRecord',
                    name: `key-${keyPair.publicKeyBase58}`,
                    value: JSON.stringify(keyPair),
                    tags: {
                        keyType: keyPair.keyType,
                    },
                });
            }
            catch (error) {
                if ((0, utils_1.isAskarError)(error, utils_1.AskarErrorCode.Duplicate)) {
                    throw new core_1.WalletKeyExistsError('Key already exists');
                }
                throw new core_1.WalletError('Error saving KeyPair record', { cause: error });
            }
        });
    }
}
exports.AskarBaseWallet = AskarBaseWallet;
