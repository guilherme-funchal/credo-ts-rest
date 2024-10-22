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
exports.AskarProfileWallet = void 0;
const core_1 = require("@aries-framework/core");
const tsyringe_1 = require("tsyringe");
const utils_1 = require("../utils");
const AskarBaseWallet_1 = require("./AskarBaseWallet");
let AskarProfileWallet = (() => {
    let _classDecorators = [(0, tsyringe_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = AskarBaseWallet_1.AskarBaseWallet;
    var AskarProfileWallet = _classThis = class extends _classSuper {
        constructor(store, logger, signingKeyProviderRegistry) {
            super(logger, signingKeyProviderRegistry);
            this.store = store;
        }
        get isInitialized() {
            return this._session !== undefined;
        }
        get isProvisioned() {
            return this.walletConfig !== undefined;
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
        create(walletConfig) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.debug(`Creating wallet for profile '${walletConfig.id}'`);
                try {
                    yield this.store.createProfile(walletConfig.id);
                }
                catch (error) {
                    if ((0, utils_1.isAskarError)(error, utils_1.AskarErrorCode.Duplicate)) {
                        const errorMessage = `Wallet for profile '${walletConfig.id}' already exists`;
                        this.logger.debug(errorMessage);
                        throw new core_1.WalletDuplicateError(errorMessage, {
                            walletType: 'AskarProfileWallet',
                            cause: error,
                        });
                    }
                    const errorMessage = `Error creating wallet for profile '${walletConfig.id}'`;
                    this.logger.error(errorMessage, {
                        error,
                        errorMessage: error.message,
                    });
                    throw new core_1.WalletError(errorMessage, { cause: error });
                }
                this.logger.debug(`Successfully created wallet for profile '${walletConfig.id}'`);
            });
        }
        open(walletConfig) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.debug(`Opening wallet for profile '${walletConfig.id}'`);
                try {
                    this.walletConfig = walletConfig;
                    this._session = yield this.store.session(walletConfig.id).open();
                    // FIXME: opening a session for a profile that does not exist, will not throw an error until
                    // the session is actually used. We can check if the profile exists by doing something with
                    // the session, which will throw a not found error if the profile does not exists,
                    // but that is not very efficient as it needs to be done on every open.
                    // See: https://github.com/hyperledger/aries-askar/issues/163
                    yield this._session.fetch({
                        category: 'fetch-to-see-if-profile-exists',
                        name: 'fetch-to-see-if-profile-exists',
                        forUpdate: false,
                        isJson: false,
                    });
                }
                catch (error) {
                    // Profile does not exist
                    if ((0, utils_1.isAskarError)(error, utils_1.AskarErrorCode.NotFound)) {
                        const errorMessage = `Wallet for profile '${walletConfig.id}' not found`;
                        this.logger.debug(errorMessage);
                        throw new core_1.WalletNotFoundError(errorMessage, {
                            walletType: 'AskarProfileWallet',
                            cause: error,
                        });
                    }
                    const errorMessage = `Error opening wallet for profile '${walletConfig.id}'`;
                    this.logger.error(errorMessage, {
                        error,
                        errorMessage: error.message,
                    });
                    throw new core_1.WalletError(errorMessage, { cause: error });
                }
                this.logger.debug(`Successfully opened wallet for profile '${walletConfig.id}'`);
            });
        }
        createAndOpen(walletConfig) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.create(walletConfig);
                yield this.open(walletConfig);
            });
        }
        delete() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.walletConfig) {
                    throw new core_1.WalletError('Can not delete wallet that does not have wallet config set. Make sure to call create wallet before deleting the wallet');
                }
                this.logger.info(`Deleting profile '${this.walletConfig.id}'`);
                if (this._session) {
                    yield this.close();
                }
                try {
                    yield this.store.removeProfile(this.walletConfig.id);
                }
                catch (error) {
                    const errorMessage = `Error deleting wallet for profile '${this.walletConfig.id}': ${error.message}`;
                    this.logger.error(errorMessage, {
                        error,
                        errorMessage: error.message,
                    });
                    throw new core_1.WalletError(errorMessage, { cause: error });
                }
            });
        }
        export() {
            return __awaiter(this, void 0, void 0, function* () {
                // This PR should help with this: https://github.com/hyperledger/aries-askar/pull/159
                throw new core_1.WalletError('Exporting a profile is not supported.');
            });
        }
        import() {
            return __awaiter(this, void 0, void 0, function* () {
                // This PR should help with this: https://github.com/hyperledger/aries-askar/pull/159
                throw new core_1.WalletError('Importing a profile is not supported.');
            });
        }
        rotateKey() {
            return __awaiter(this, void 0, void 0, function* () {
                throw new core_1.WalletError('Rotating a key is not supported for a profile. You can rotate the key on the main askar wallet.');
            });
        }
        close() {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                this.logger.debug(`Closing wallet for profile ${(_a = this.walletConfig) === null || _a === void 0 ? void 0 : _a.id}`);
                if (!this._session) {
                    throw new core_1.WalletError('Wallet is in invalid state, you are trying to close wallet that has no handle.');
                }
                try {
                    yield this.session.close();
                    this._session = undefined;
                }
                catch (error) {
                    const errorMessage = `Error closing wallet for profile ${(_b = this.walletConfig) === null || _b === void 0 ? void 0 : _b.id}: ${error.message}`;
                    this.logger.error(errorMessage, {
                        error,
                        errorMessage: error.message,
                    });
                    throw new core_1.WalletError(errorMessage, { cause: error });
                }
            });
        }
    };
    __setFunctionName(_classThis, "AskarProfileWallet");
    (() => {
        var _a;
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AskarProfileWallet = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AskarProfileWallet = _classThis;
})();
exports.AskarProfileWallet = AskarProfileWallet;
