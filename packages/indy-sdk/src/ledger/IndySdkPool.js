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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndySdkPool = void 0;
const core_1 = require("@aries-framework/core");
const error_1 = require("../error");
const error_2 = require("./error");
const util_1 = require("./util");
class IndySdkPool {
    constructor(poolConfig, indySdk, logger, stop$, fileSystem) {
        this.indySdk = indySdk;
        this.fileSystem = fileSystem;
        this.poolConfig = poolConfig;
        this.logger = logger;
        // Listen to stop$ (shutdown) and close pool
        stop$.subscribe(() => __awaiter(this, void 0, void 0, function* () {
            if (this._poolHandle) {
                yield this.close();
            }
        }));
    }
    get didIndyNamespace() {
        return this.config.indyNamespace;
    }
    get id() {
        return this.poolConfig.id;
    }
    get config() {
        return this.poolConfig;
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            const poolHandle = this._poolHandle;
            if (!poolHandle) {
                return;
            }
            this._poolHandle = undefined;
            this.poolConnected = undefined;
            yield this.indySdk.closePoolLedger(poolHandle);
        });
    }
    delete() {
        return __awaiter(this, void 0, void 0, function* () {
            // Close the pool if currently open
            if (this._poolHandle) {
                yield this.close();
            }
            yield this.indySdk.deletePoolLedgerConfig(this.poolConfig.indyNamespace);
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.poolConnected) {
                // Save the promise of connectToLedger to determine if we are done connecting
                this.poolConnected = this.connectToLedger();
                this.poolConnected.catch((error) => {
                    // Set poolConnected to undefined so we can retry connection upon failure
                    this.poolConnected = undefined;
                    this.logger.error('Connection to pool: ' + this.poolConfig.genesisPath + ' failed.', { error });
                });
                return this.poolConnected;
            }
            else {
                throw new core_1.AriesFrameworkError('Cannot attempt connection to ledger, already connecting.');
            }
        });
    }
    connectToLedger() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const poolName = (_a = this.poolConfig.id) !== null && _a !== void 0 ? _a : this.poolConfig.indyNamespace;
            const genesisPath = yield this.getGenesisPath();
            if (!genesisPath) {
                throw new core_1.AriesFrameworkError('Cannot connect to ledger without genesis file');
            }
            this.logger.debug(`Connecting to ledger pool '${poolName}'`, { genesisPath });
            yield this.indySdk.setProtocolVersion(2);
            try {
                this._poolHandle = yield this.indySdk.openPoolLedger(poolName);
                return;
            }
            catch (error) {
                if (!(0, error_1.isIndyError)(error, 'PoolLedgerNotCreatedError')) {
                    throw (0, error_1.isIndyError)(error) ? new error_1.IndySdkError(error) : error;
                }
            }
            this.logger.debug(`Pool '${poolName}' does not exist yet, creating.`, {
                indyError: 'PoolLedgerNotCreatedError',
            });
            try {
                yield this.indySdk.createPoolLedgerConfig(poolName, { genesis_txn: genesisPath });
                this._poolHandle = yield this.indySdk.openPoolLedger(poolName);
                return;
            }
            catch (error) {
                throw (0, error_1.isIndyError)(error) ? new error_1.IndySdkError(error) : error;
            }
        });
    }
    submitRequest(request) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.indySdk.submitRequest(yield this.getPoolHandle(), request);
        });
    }
    submitReadRequest(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.submitRequest(request);
            if ((0, util_1.isLedgerRejectResponse)(response) || (0, util_1.isLedgerReqnackResponse)(response)) {
                throw new error_2.IndySdkPoolError(`Ledger '${this.didIndyNamespace}' rejected read transaction request: ${response.reason}`);
            }
            return response;
        });
    }
    submitWriteRequest(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.submitRequest(request);
            if ((0, util_1.isLedgerRejectResponse)(response) || (0, util_1.isLedgerReqnackResponse)(response)) {
                throw new error_2.IndySdkPoolError(`Ledger '${this.didIndyNamespace}' rejected write transaction request: ${response.reason}`);
            }
            return response;
        });
    }
    getPoolHandle() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.poolConnected) {
                // If we have tried to already connect to pool wait for it
                try {
                    yield this.poolConnected;
                }
                catch (error) {
                    this.logger.error('Connection to pool: ' + this.poolConfig.genesisPath + ' failed.', { error });
                }
            }
            if (!this._poolHandle)
                yield this.connect();
            if (!this._poolHandle)
                throw new error_2.IndySdkPoolError('Pool handle not set after connection');
            return this._poolHandle;
        });
    }
    getGenesisPath() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            // If the path is already provided return it
            if (this.poolConfig.genesisPath)
                return this.poolConfig.genesisPath;
            // Determine the genesisPath
            const genesisPath = this.fileSystem.tempPath + `/genesis-${(_a = this.poolConfig.id) !== null && _a !== void 0 ? _a : this.poolConfig.indyNamespace}.txn`;
            // Store genesis data if provided
            if (this.poolConfig.genesisTransactions) {
                yield this.fileSystem.write(genesisPath, this.poolConfig.genesisTransactions);
                this.poolConfig.genesisPath = genesisPath;
                return genesisPath;
            }
            // No genesisPath
            return null;
        });
    }
}
exports.IndySdkPool = IndySdkPool;
