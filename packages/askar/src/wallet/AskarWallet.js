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
exports.AskarWallet = void 0;
const core_1 = require("@aries-framework/core");
// eslint-disable-next-line import/order
const aries_askar_shared_1 = require("@hyperledger/aries-askar-shared");
const tsyringe_1 = require("tsyringe");
const utils_1 = require("../utils");
const AskarBaseWallet_1 = require("./AskarBaseWallet");
const AskarProfileWallet_1 = require("./AskarProfileWallet");
/**
 * @todo: rename after 0.5.0, as we now have multiple types of AskarWallet
 */
let AskarWallet = (() => {
    let _classDecorators = [(0, tsyringe_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = AskarBaseWallet_1.AskarBaseWallet;
    var AskarWallet = _classThis = class extends _classSuper {
        constructor(logger, fileSystem, signingKeyProviderRegistry) {
            super(logger, signingKeyProviderRegistry);
            this.fileSystem = fileSystem;
        }
        get isProvisioned() {
            return this.walletConfig !== undefined;
        }
        get isInitialized() {
            return this._store !== undefined;
        }
        get store() {
            if (!this._store) {
                throw new core_1.AriesFrameworkError('Wallet has not been initialized yet. Make sure to await agent.initialize() before using the agent.');
            }
            return this._store;
        }
        get profile() {
            if (!this.walletConfig) {
                throw new core_1.WalletError('No profile configured.');
            }
            return this.walletConfig.id;
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
         * TODO: we can add this method, and add custom logic in the tenants module
         * or we can try to register the store on the agent context
         */
        getProfileWallet() {
            return __awaiter(this, void 0, void 0, function* () {
                return new AskarProfileWallet_1.AskarProfileWallet(this.store, this.logger, this.signingKeyProviderRegistry);
            });
        }
        /**
         * @throws {WalletDuplicateError} if the wallet already exists
         * @throws {WalletError} if another error occurs
         */
        createAndOpen(walletConfig) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.debug(`Creating wallet '${walletConfig.id}`);
                const askarWalletConfig = yield this.getAskarWalletConfig(walletConfig);
                // Check if database exists
                const { path: filePath } = (0, utils_1.uriFromWalletConfig)(walletConfig, this.fileSystem.dataPath);
                if (filePath && (yield this.fileSystem.exists(filePath))) {
                    throw new core_1.WalletDuplicateError(`Wallet '${walletConfig.id}' already exists.`, {
                        walletType: 'AskarWallet',
                    });
                }
                try {
                    // Make sure path exists before creating the wallet
                    if (filePath) {
                        yield this.fileSystem.createDirectory(filePath);
                    }
                    this._store = yield aries_askar_shared_1.Store.provision({
                        recreate: false,
                        uri: askarWalletConfig.uri,
                        profile: askarWalletConfig.profile,
                        keyMethod: askarWalletConfig.keyMethod,
                        passKey: askarWalletConfig.passKey,
                    });
                    this.walletConfig = walletConfig;
                    this._session = yield this._store.openSession();
                }
                catch (error) {
                    // FIXME: Askar should throw a Duplicate error code, but is currently returning Encryption
                    // And if we provide the very same wallet key, it will open it without any error
                    if ((0, utils_1.isAskarError)(error) &&
                        (error.code === utils_1.AskarErrorCode.Encryption || error.code === utils_1.AskarErrorCode.Duplicate)) {
                        const errorMessage = `Wallet '${walletConfig.id}' already exists`;
                        this.logger.debug(errorMessage);
                        throw new core_1.WalletDuplicateError(errorMessage, {
                            walletType: 'AskarWallet',
                            cause: error,
                        });
                    }
                    const errorMessage = `Error creating wallet '${walletConfig.id}'`;
                    this.logger.error(errorMessage, {
                        error,
                        errorMessage: error.message,
                    });
                    throw new core_1.WalletError(errorMessage, { cause: error });
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
                var _a;
                if (this._store) {
                    throw new core_1.WalletError('Wallet instance already opened. Close the currently opened wallet before re-opening the wallet');
                }
                const askarWalletConfig = yield this.getAskarWalletConfig(walletConfig);
                try {
                    this._store = yield aries_askar_shared_1.Store.open({
                        uri: askarWalletConfig.uri,
                        keyMethod: askarWalletConfig.keyMethod,
                        passKey: askarWalletConfig.passKey,
                    });
                    if (rekey) {
                        yield this._store.rekey({
                            passKey: rekey,
                            keyMethod: (0, utils_1.keyDerivationMethodToStoreKeyMethod)(rekeyDerivation !== null && rekeyDerivation !== void 0 ? rekeyDerivation : core_1.KeyDerivationMethod.Argon2IMod),
                        });
                    }
                    this._session = yield this._store.openSession();
                    this.walletConfig = walletConfig;
                }
                catch (error) {
                    if ((0, utils_1.isAskarError)(error) &&
                        (error.code === utils_1.AskarErrorCode.NotFound ||
                            (error.code === utils_1.AskarErrorCode.Backend && ((_a = walletConfig.storage) === null || _a === void 0 ? void 0 : _a.inMemory)))) {
                        const errorMessage = `Wallet '${walletConfig.id}' not found`;
                        this.logger.debug(errorMessage);
                        throw new core_1.WalletNotFoundError(errorMessage, {
                            walletType: 'AskarWallet',
                            cause: error,
                        });
                    }
                    else if ((0, utils_1.isAskarError)(error) && error.code === utils_1.AskarErrorCode.Encryption) {
                        const errorMessage = `Incorrect key for wallet '${walletConfig.id}'`;
                        this.logger.debug(errorMessage);
                        throw new core_1.WalletInvalidKeyError(errorMessage, {
                            walletType: 'AskarWallet',
                            cause: error,
                        });
                    }
                    throw new core_1.WalletError(`Error opening wallet ${walletConfig.id}: ${error.message}`, { cause: error });
                }
                this.logger.debug(`Wallet '${walletConfig.id}' opened with handle '${this._store.handle.handle}'`);
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
                if (this._store) {
                    yield this.close();
                }
                try {
                    const { uri } = (0, utils_1.uriFromWalletConfig)(this.walletConfig, this.fileSystem.dataPath);
                    yield aries_askar_shared_1.Store.remove(uri);
                }
                catch (error) {
                    const errorMessage = `Error deleting wallet '${this.walletConfig.id}': ${error.message}`;
                    this.logger.error(errorMessage, {
                        error,
                        errorMessage: error.message,
                    });
                    throw new core_1.WalletError(errorMessage, { cause: error });
                }
            });
        }
        export(exportConfig) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.walletConfig) {
                    throw new core_1.WalletError('Can not export wallet that does not have wallet config set. Make sure to open it before exporting');
                }
                const { path: destinationPath, key: exportKey } = exportConfig;
                const { path: sourcePath } = (0, utils_1.uriFromWalletConfig)(this.walletConfig, this.fileSystem.dataPath);
                if (!sourcePath) {
                    throw new core_1.WalletError('Export is only supported for SQLite backend');
                }
                try {
                    // Export path already exists
                    if (yield this.fileSystem.exists(destinationPath)) {
                        throw new core_1.WalletExportPathExistsError(`Unable to create export, wallet export at path '${exportConfig.path}' already exists`);
                    }
                    const exportedWalletConfig = yield this.getAskarWalletConfig(Object.assign(Object.assign({}, this.walletConfig), { storage: { type: 'sqlite', path: destinationPath } }));
                    // Close this wallet before copying
                    yield this.close();
                    // Make sure destination path exists
                    yield this.fileSystem.createDirectory(destinationPath);
                    // Copy wallet to the destination path
                    yield this.fileSystem.copyFile(sourcePath, destinationPath);
                    // Open exported wallet and rotate its key to the one requested
                    const exportedWalletStore = yield aries_askar_shared_1.Store.open({
                        uri: exportedWalletConfig.uri,
                        keyMethod: exportedWalletConfig.keyMethod,
                        passKey: exportedWalletConfig.passKey,
                    });
                    yield exportedWalletStore.rekey({ keyMethod: exportedWalletConfig.keyMethod, passKey: exportKey });
                    yield exportedWalletStore.close();
                    yield this._open(this.walletConfig);
                }
                catch (error) {
                    const errorMessage = `Error exporting wallet '${this.walletConfig.id}': ${error.message}`;
                    this.logger.error(errorMessage, {
                        error,
                        errorMessage: error.message,
                    });
                    if (error instanceof core_1.WalletExportPathExistsError)
                        throw error;
                    throw new core_1.WalletError(errorMessage, { cause: error });
                }
            });
        }
        import(walletConfig, importConfig) {
            return __awaiter(this, void 0, void 0, function* () {
                const { path: sourcePath, key: importKey } = importConfig;
                const { path: destinationPath } = (0, utils_1.uriFromWalletConfig)(walletConfig, this.fileSystem.dataPath);
                if (!destinationPath) {
                    throw new core_1.WalletError('Import is only supported for SQLite backend');
                }
                try {
                    const importWalletConfig = yield this.getAskarWalletConfig(walletConfig);
                    // Import path already exists
                    if (yield this.fileSystem.exists(destinationPath)) {
                        throw new core_1.WalletExportPathExistsError(`Unable to import wallet. Path '${importConfig.path}' already exists`);
                    }
                    // Make sure destination path exists
                    yield this.fileSystem.createDirectory(destinationPath);
                    // Copy wallet to the destination path
                    yield this.fileSystem.copyFile(sourcePath, destinationPath);
                    // Open imported wallet and rotate its key to the one requested
                    const importedWalletStore = yield aries_askar_shared_1.Store.open({
                        uri: importWalletConfig.uri,
                        keyMethod: importWalletConfig.keyMethod,
                        passKey: importKey,
                    });
                    yield importedWalletStore.rekey({ keyMethod: importWalletConfig.keyMethod, passKey: importWalletConfig.passKey });
                    yield importedWalletStore.close();
                }
                catch (error) {
                    const errorMessage = `Error importing wallet '${walletConfig.id}': ${error.message}`;
                    this.logger.error(errorMessage, {
                        error,
                        errorMessage: error.message,
                    });
                    if (error instanceof core_1.WalletImportPathExistsError)
                        throw error;
                    // Cleanup any wallet file we could have created
                    if (yield this.fileSystem.exists(destinationPath)) {
                        yield this.fileSystem.delete(destinationPath);
                    }
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
                if (!this._store) {
                    throw new core_1.WalletError('Wallet is in invalid state, you are trying to close wallet that has no handle.');
                }
                try {
                    yield this.session.close();
                    yield this.store.close();
                    this._session = undefined;
                    this._store = undefined;
                }
                catch (error) {
                    const errorMessage = `Error closing wallet': ${error.message}`;
                    this.logger.error(errorMessage, {
                        error,
                        errorMessage: error.message,
                    });
                    throw new core_1.WalletError(errorMessage, { cause: error });
                }
            });
        }
        getAskarWalletConfig(walletConfig) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                const { uri, path } = (0, utils_1.uriFromWalletConfig)(walletConfig, this.fileSystem.dataPath);
                return {
                    uri,
                    path,
                    profile: walletConfig.id,
                    // FIXME: Default derivation method should be set somewhere in either agent config or some constants
                    keyMethod: (0, utils_1.keyDerivationMethodToStoreKeyMethod)((_a = walletConfig.keyDerivationMethod) !== null && _a !== void 0 ? _a : core_1.KeyDerivationMethod.Argon2IMod),
                    passKey: walletConfig.key,
                };
            });
        }
    };
    __setFunctionName(_classThis, "AskarWallet");
    (() => {
        var _a;
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AskarWallet = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AskarWallet = _classThis;
})();
exports.AskarWallet = AskarWallet;
