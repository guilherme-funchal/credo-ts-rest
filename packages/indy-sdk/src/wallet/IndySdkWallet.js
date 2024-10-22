"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndySdkWallet = void 0;
// eslint-disable-next-line import/order
const core_1 = require("@aries-framework/core");
const isError = (error) => error instanceof Error;
const tsyringe_1 = require("tsyringe");
const error_1 = require("../error");
let IndySdkWallet = (() => {
    let _classDecorators = [(0, tsyringe_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var IndySdkWallet = _classThis = class {
        constructor(indySdk, logger, signingKeyProviderRegistry) {
            this.logger = logger;
            this.signingKeyProviderRegistry = signingKeyProviderRegistry;
            this.indySdk = indySdk;
        }
        get isProvisioned() {
            return this.walletConfig !== undefined;
        }
        get isInitialized() {
            return this.walletHandle !== undefined;
        }
        get handle() {
            if (!this.walletHandle) {
                throw new core_1.AriesFrameworkError('Wallet has not been initialized yet. Make sure to await agent.initialize() before using the agent.');
            }
            return this.walletHandle;
        }
        get supportedKeyTypes() {
            const walletSupportedKeyTypes = [core_1.KeyType.Ed25519];
            const signingKeyProviderSupportedKeyTypes = this.signingKeyProviderRegistry.supportedKeyTypes;
            return Array.from(new Set([...walletSupportedKeyTypes, ...signingKeyProviderSupportedKeyTypes]));
        }
        /**
         * Dispose method is called when an agent context is disposed.
         */
        dispose() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.isInitialized) {
                    yield this.close();
                }
            });
        }
        walletStorageConfig(walletConfig) {
            var _a, _b, _c;
            const walletStorageConfig = {
                id: walletConfig.id,
                storage_type: (_a = walletConfig.storage) === null || _a === void 0 ? void 0 : _a.type,
            };
            if ((_b = walletConfig.storage) === null || _b === void 0 ? void 0 : _b.config) {
                walletStorageConfig.storage_config = (_c = walletConfig.storage) === null || _c === void 0 ? void 0 : _c.config;
            }
            return walletStorageConfig;
        }
        walletCredentials(walletConfig, rekey, rekeyDerivation) {
            var _a, _b;
            const walletCredentials = {
                key: walletConfig.key,
                key_derivation_method: walletConfig.keyDerivationMethod,
            };
            if (rekey) {
                walletCredentials.rekey = rekey;
            }
            if (rekeyDerivation) {
                walletCredentials.rekey_derivation_method = rekeyDerivation;
            }
            if ((_a = walletConfig.storage) === null || _a === void 0 ? void 0 : _a.credentials) {
                walletCredentials.storage_credentials = (_b = walletConfig.storage) === null || _b === void 0 ? void 0 : _b.credentials;
            }
            return walletCredentials;
        }
        /**
         * @throws {WalletDuplicateError} if the wallet already exists
         * @throws {WalletError} if another error occurs
         */
        create(walletConfig) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.createAndOpen(walletConfig);
                yield this.close();
            });
        }
        /**
         * @throws {WalletDuplicateError} if the wallet already exists
         * @throws {WalletError} if another error occurs
         */
        createAndOpen(walletConfig) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.debug(`Creating wallet '${walletConfig.id}' using SQLite storage`);
                try {
                    yield this.indySdk.createWallet(this.walletStorageConfig(walletConfig), this.walletCredentials(walletConfig));
                    this.walletConfig = walletConfig;
                    yield this.open(walletConfig);
                }
                catch (error) {
                    if ((0, error_1.isIndyError)(error, 'WalletAlreadyExistsError')) {
                        const errorMessage = `Wallet '${walletConfig.id}' already exists`;
                        this.logger.debug(errorMessage);
                        throw new core_1.WalletDuplicateError(errorMessage, {
                            walletType: 'IndySdkWallet',
                            cause: error,
                        });
                    }
                    else {
                        if (!isError(error)) {
                            throw new core_1.AriesFrameworkError('Attempted to throw error, but it was not of type Error', { cause: error });
                        }
                        const errorMessage = `Error creating wallet '${walletConfig.id}'`;
                        this.logger.error(errorMessage, {
                            error,
                            errorMessage: error.message,
                        });
                        throw new core_1.WalletError(errorMessage, { cause: error });
                    }
                }
                this.logger.debug(`Successfully created wallet '${walletConfig.id}'`);
            });
        }
        /**
         * @throws {WalletNotFoundError} if the wallet does not exist
         * @throws {WalletError} if another error occurs
         */
        open(walletConfig) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this._open(walletConfig);
            });
        }
        /**
         * @throws {WalletNotFoundError} if the wallet does not exist
         * @throws {WalletError} if another error occurs
         */
        rotateKey(walletConfig) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!walletConfig.rekey) {
                    throw new core_1.WalletError('Wallet rekey undefined!. Please specify the new wallet key');
                }
                yield this._open({
                    id: walletConfig.id,
                    key: walletConfig.key,
                    keyDerivationMethod: walletConfig.keyDerivationMethod,
                }, walletConfig.rekey, walletConfig.rekeyDerivationMethod);
            });
        }
        /**
         * @throws {WalletNotFoundError} if the wallet does not exist
         * @throws {WalletError} if another error occurs
         */
        _open(walletConfig, rekey, rekeyDerivation) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.walletHandle) {
                    throw new core_1.WalletError('Wallet instance already opened. Close the currently opened wallet before re-opening the wallet');
                }
                try {
                    this.walletHandle = yield this.indySdk.openWallet(this.walletStorageConfig(walletConfig), this.walletCredentials(walletConfig, rekey, rekeyDerivation));
                    if (rekey) {
                        this.walletConfig = Object.assign(Object.assign({}, walletConfig), { key: rekey, keyDerivationMethod: rekeyDerivation });
                    }
                    else {
                        this.walletConfig = walletConfig;
                    }
                }
                catch (error) {
                    if ((0, error_1.isIndyError)(error, 'WalletNotFoundError')) {
                        const errorMessage = `Wallet '${walletConfig.id}' not found`;
                        this.logger.debug(errorMessage);
                        throw new core_1.WalletNotFoundError(errorMessage, {
                            walletType: 'IndySdkWallet',
                            cause: error,
                        });
                    }
                    else if ((0, error_1.isIndyError)(error, 'WalletAccessFailed')) {
                        const errorMessage = `Incorrect key for wallet '${walletConfig.id}'`;
                        this.logger.debug(errorMessage);
                        throw new core_1.WalletInvalidKeyError(errorMessage, {
                            walletType: 'IndySdkWallet',
                            cause: error,
                        });
                    }
                    else {
                        if (!isError(error)) {
                            throw new core_1.AriesFrameworkError('Attempted to throw error, but it was not of type Error', { cause: error });
                        }
                        const errorMessage = `Error opening wallet '${walletConfig.id}': ${error.message}`;
                        this.logger.error(errorMessage, {
                            error,
                            errorMessage: error.message,
                        });
                        throw new core_1.WalletError(errorMessage, { cause: error });
                    }
                }
                this.logger.debug(`Wallet '${walletConfig.id}' opened with handle '${this.handle}'`);
            });
        }
        /**
         * @throws {WalletNotFoundError} if the wallet does not exist
         * @throws {WalletError} if another error occurs
         */
        delete() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.walletConfig) {
                    throw new core_1.WalletError('Can not delete wallet that does not have wallet config set. Make sure to call create wallet before deleting the wallet');
                }
                this.logger.info(`Deleting wallet '${this.walletConfig.id}'`);
                if (this.walletHandle) {
                    yield this.close();
                }
                try {
                    yield this.indySdk.deleteWallet(this.walletStorageConfig(this.walletConfig), this.walletCredentials(this.walletConfig));
                }
                catch (error) {
                    if ((0, error_1.isIndyError)(error, 'WalletNotFoundError')) {
                        const errorMessage = `Error deleting wallet: wallet '${this.walletConfig.id}' not found`;
                        this.logger.debug(errorMessage);
                        throw new core_1.WalletNotFoundError(errorMessage, {
                            walletType: 'IndySdkWallet',
                            cause: error,
                        });
                    }
                    else {
                        if (!isError(error)) {
                            throw new core_1.AriesFrameworkError('Attempted to throw error, but it was not of type Error', { cause: error });
                        }
                        const errorMessage = `Error deleting wallet '${this.walletConfig.id}': ${error.message}`;
                        this.logger.error(errorMessage, {
                            error,
                            errorMessage: error.message,
                        });
                        throw new core_1.WalletError(errorMessage, { cause: error });
                    }
                }
            });
        }
        export(exportConfig) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                try {
                    this.logger.debug(`Exporting wallet ${(_a = this.walletConfig) === null || _a === void 0 ? void 0 : _a.id} to path ${exportConfig.path}`);
                    yield this.indySdk.exportWallet(this.handle, exportConfig);
                }
                catch (error) {
                    if (!isError(error)) {
                        throw new core_1.AriesFrameworkError('Attempted to throw error, but it was not of type Error', { cause: error });
                    }
                    // Export path already exists
                    if ((0, error_1.isIndyError)(error, 'CommonIOError')) {
                        throw new core_1.WalletExportPathExistsError(`Unable to create export, wallet export at path '${exportConfig.path}' already exists`, { cause: error });
                    }
                    const errorMessage = `Error exporting wallet: ${error.message}`;
                    this.logger.error(errorMessage, {
                        error,
                    });
                    throw new core_1.WalletError(errorMessage, { cause: error });
                }
            });
        }
        import(walletConfig, importConfig) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    this.logger.debug(`Importing wallet ${walletConfig.id} from path ${importConfig.path}`);
                    yield this.indySdk.importWallet({ id: walletConfig.id }, { key: walletConfig.key, key_derivation_method: walletConfig.keyDerivationMethod }, importConfig);
                }
                catch (error) {
                    if (!isError(error)) {
                        throw new core_1.AriesFrameworkError('Attempted to throw error, but it was not of type Error', { cause: error });
                    }
                    const errorMessage = `Error importing wallet': ${error.message}`;
                    this.logger.error(errorMessage, {
                        error,
                    });
                    throw new core_1.WalletError(errorMessage, { cause: error });
                }
            });
        }
        /**
         * @throws {WalletError} if the wallet is already closed or another error occurs
         */
        close() {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                this.logger.debug(`Closing wallet ${(_a = this.walletConfig) === null || _a === void 0 ? void 0 : _a.id}`);
                if (!this.walletHandle) {
                    throw new core_1.WalletError('Wallet is in invalid state, you are trying to close wallet that has no `walletHandle`.');
                }
                try {
                    yield this.indySdk.closeWallet(this.walletHandle);
                    this.walletHandle = undefined;
                }
                catch (error) {
                    if ((0, error_1.isIndyError)(error, 'WalletInvalidHandle')) {
                        const errorMessage = `Error closing wallet: wallet already closed`;
                        this.logger.debug(errorMessage);
                        throw new core_1.WalletError(errorMessage, {
                            cause: error,
                        });
                    }
                    else {
                        if (!isError(error)) {
                            throw new core_1.AriesFrameworkError('Attempted to throw error, but it was not of type Error', { cause: error });
                        }
                        const errorMessage = `Error closing wallet': ${error.message}`;
                        this.logger.error(errorMessage, {
                            error,
                            errorMessage: error.message,
                        });
                        throw new core_1.WalletError(errorMessage, { cause: error });
                    }
                }
            });
        }
        /**
         * Create a key with an optional private key and keyType.
         * The keypair is also automatically stored in the wallet afterwards
         *
         * Bls12381g1g2 and X25519 are not supported.
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
                    // Ed25519 is supported natively in Indy wallet
                    if (keyType === core_1.KeyType.Ed25519) {
                        if (seed) {
                            throw new core_1.WalletError('IndySdkWallet does not support seed. You may rather want to specify a private key for deterministic ed25519 key generation');
                        }
                        try {
                            const verkey = yield this.indySdk.createKey(this.handle, {
                                seed: privateKey === null || privateKey === void 0 ? void 0 : privateKey.toString(),
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                //@ts-ignore
                                crypto_type: 'ed25519',
                            });
                            return core_1.Key.fromPublicKeyBase58(verkey, keyType);
                        }
                        catch (error) {
                            // Handle case where key already exists
                            if ((0, error_1.isIndyError)(error, 'WalletItemAlreadyExists')) {
                                throw new core_1.WalletKeyExistsError('Key already exists');
                            }
                            // Otherwise re-throw error
                            throw error;
                        }
                    }
                    // Check if there is a signing key provider for the specified key type.
                    if (this.signingKeyProviderRegistry.hasProviderForKeyType(keyType)) {
                        const signingKeyProvider = this.signingKeyProviderRegistry.getProviderForKeyType(keyType);
                        const keyPair = yield signingKeyProvider.createKeyPair({ seed, privateKey });
                        yield this.storeKeyPair(keyPair);
                        return core_1.Key.fromPublicKeyBase58(keyPair.publicKeyBase58, keyType);
                    }
                }
                catch (error) {
                    // If already instance of `WalletError`, re-throw
                    if (error instanceof core_1.WalletError)
                        throw error;
                    if (!isError(error)) {
                        throw new core_1.AriesFrameworkError(`Attempted to throw error, but it was not of type Error: ${error}`, {
                            cause: error,
                        });
                    }
                    throw new core_1.WalletError(`Error creating key with key type '${keyType}': ${error.message}`, { cause: error });
                }
                throw new core_1.WalletError(`Unsupported key type: '${keyType}' for wallet IndySdkWallet`);
            });
        }
        /**
         * sign a Buffer with an instance of a Key class
         *
         * Bls12381g1g2, Bls12381g1 and X25519 are not supported.
         *
         * @param data Buffer The data that needs to be signed
         * @param key Key The key that is used to sign the data
         *
         * @returns A signature for the data
         */
        sign(_a) {
            return __awaiter(this, arguments, void 0, function* ({ data, key }) {
                try {
                    // Ed25519 is supported natively in Indy wallet
                    if (key.keyType === core_1.KeyType.Ed25519) {
                        // Checks to see if it is an not an Array of messages, but just a single one
                        if (!core_1.TypedArrayEncoder.isTypedArray(data)) {
                            throw new core_1.WalletError(`${core_1.KeyType.Ed25519} does not support multiple singing of multiple messages`);
                        }
                        return yield this.indySdk.cryptoSign(this.handle, key.publicKeyBase58, data);
                    }
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
                }
                catch (error) {
                    if (!isError(error)) {
                        throw new core_1.AriesFrameworkError('Attempted to throw error, but it was not of type Error', { cause: error });
                    }
                    throw new core_1.WalletError(`Error signing data with verkey ${key.publicKeyBase58}`, { cause: error });
                }
                throw new core_1.WalletError(`Unsupported keyType: ${key.keyType}`);
            });
        }
        /**
         * Verify the signature with the data and the used key
         *
         * Bls12381g1g2, Bls12381g1 and X25519 are not supported.
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
                try {
                    // Ed25519 is supported natively in Indy wallet
                    if (key.keyType === core_1.KeyType.Ed25519) {
                        // Checks to see if it is an not an Array of messages, but just a single one
                        if (!core_1.TypedArrayEncoder.isTypedArray(data)) {
                            throw new core_1.WalletError(`${core_1.KeyType.Ed25519} does not support multiple singing of multiple messages`);
                        }
                        return yield this.indySdk.cryptoVerify(key.publicKeyBase58, data, signature);
                    }
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
                }
                catch (error) {
                    if (!isError(error)) {
                        throw new core_1.AriesFrameworkError('Attempted to throw error, but it was not of type Error', { cause: error });
                    }
                    throw new core_1.WalletError(`Error verifying signature of data signed with verkey ${key.publicKeyBase58}`, {
                        cause: error,
                    });
                }
                throw new core_1.WalletError(`Unsupported keyType: ${key.keyType}`);
            });
        }
        pack(payload, recipientKeys, senderVerkey) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const messageRaw = core_1.JsonEncoder.toBuffer(payload);
                    const packedMessage = yield this.indySdk.packMessage(this.handle, messageRaw, recipientKeys, senderVerkey !== null && senderVerkey !== void 0 ? senderVerkey : null);
                    return core_1.JsonEncoder.fromBuffer(packedMessage);
                }
                catch (error) {
                    if (!isError(error)) {
                        throw new core_1.AriesFrameworkError('Attempted to throw error, but it was not of type Error', { cause: error });
                    }
                    throw new core_1.WalletError('Error packing message', { cause: error });
                }
            });
        }
        unpack(messagePackage) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const unpackedMessageBuffer = yield this.indySdk.unpackMessage(this.handle, core_1.JsonEncoder.toBuffer(messagePackage));
                    const unpackedMessage = core_1.JsonEncoder.fromBuffer(unpackedMessageBuffer);
                    return {
                        senderKey: unpackedMessage.sender_verkey,
                        recipientKey: unpackedMessage.recipient_verkey,
                        plaintextMessage: core_1.JsonEncoder.fromString(unpackedMessage.message),
                    };
                }
                catch (error) {
                    if (!isError(error)) {
                        throw new core_1.AriesFrameworkError('Attempted to throw error, but it was not of type Error', { cause: error });
                    }
                    throw new core_1.WalletError('Error unpacking message', { cause: error });
                }
            });
        }
        generateNonce() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    return yield this.indySdk.generateNonce();
                }
                catch (error) {
                    if (!isError(error)) {
                        throw new core_1.AriesFrameworkError('Attempted to throw error, but it was not of type Error', { cause: error });
                    }
                    throw new core_1.WalletError('Error generating nonce', { cause: error });
                }
            });
        }
        retrieveKeyPair(publicKeyBase58) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const { value } = yield this.indySdk.getWalletRecord(this.handle, 'KeyPairRecord', `key-${publicKeyBase58}`, {});
                    if (value) {
                        return core_1.JsonEncoder.fromString(value);
                    }
                    else {
                        throw new core_1.WalletError(`No content found for record with public key: ${publicKeyBase58}`);
                    }
                }
                catch (error) {
                    if ((0, error_1.isIndyError)(error, 'WalletItemNotFound')) {
                        throw new core_1.RecordNotFoundError(`KeyPairRecord not found for public key: ${publicKeyBase58}.`, {
                            recordType: 'KeyPairRecord',
                            cause: error,
                        });
                    }
                    throw (0, error_1.isIndyError)(error) ? new error_1.IndySdkError(error) : error;
                }
            });
        }
        storeKeyPair(keyPair) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    yield this.indySdk.addWalletRecord(this.handle, 'KeyPairRecord', `key-${keyPair.publicKeyBase58}`, JSON.stringify(keyPair), {
                        keyType: keyPair.keyType,
                    });
                }
                catch (error) {
                    if ((0, error_1.isIndyError)(error, 'WalletItemAlreadyExists')) {
                        throw new core_1.WalletKeyExistsError('Key already exists');
                    }
                    throw (0, error_1.isIndyError)(error) ? new error_1.IndySdkError(error) : error;
                }
            });
        }
        generateWalletKey() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    return yield this.indySdk.generateWalletKey();
                }
                catch (error) {
                    throw new core_1.WalletError('Error generating wallet key', { cause: error });
                }
            });
        }
    };
    __setFunctionName(_classThis, "IndySdkWallet");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        IndySdkWallet = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return IndySdkWallet = _classThis;
})();
exports.IndySdkWallet = IndySdkWallet;
