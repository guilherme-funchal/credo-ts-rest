"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uriFromWalletConfig = exports.keyDerivationMethodToStoreKeyMethod = void 0;
const core_1 = require("@aries-framework/core");
const aries_askar_shared_1 = require("@hyperledger/aries-askar-shared");
const keyDerivationMethodToStoreKeyMethod = (keyDerivationMethod) => {
    const correspondenceTable = {
        [core_1.KeyDerivationMethod.Raw]: aries_askar_shared_1.KdfMethod.Raw,
        [core_1.KeyDerivationMethod.Argon2IInt]: aries_askar_shared_1.KdfMethod.Argon2IInt,
        [core_1.KeyDerivationMethod.Argon2IMod]: aries_askar_shared_1.KdfMethod.Argon2IMod,
    };
    return new aries_askar_shared_1.StoreKeyMethod(correspondenceTable[keyDerivationMethod]);
};
exports.keyDerivationMethodToStoreKeyMethod = keyDerivationMethodToStoreKeyMethod;
/**
 * Creates a proper askar wallet URI value based on walletConfig
 * @param walletConfig WalletConfig object
 * @param afjDataPath framework data path (used in case walletConfig.storage.path is undefined)
 * @returns string containing the askar wallet URI
 */
const uriFromWalletConfig = (walletConfig, afjDataPath) => {
    var _a;
    let uri = '';
    let path;
    // By default use sqlite as database backend
    if (!walletConfig.storage) {
        walletConfig.storage = { type: 'sqlite' };
    }
    if (walletConfig.storage.type === 'sqlite') {
        if (walletConfig.storage.inMemory) {
            uri = 'sqlite://:memory:';
        }
        else {
            path = (_a = walletConfig.storage.path) !== null && _a !== void 0 ? _a : `${afjDataPath}/wallet/${walletConfig.id}/sqlite.db`;
            uri = `sqlite://${path}`;
        }
    }
    else if (walletConfig.storage.type === 'postgres') {
        const storageConfig = walletConfig.storage;
        if (!storageConfig.config || !storageConfig.credentials) {
            throw new core_1.WalletError('Invalid storage configuration for postgres wallet');
        }
        const urlParams = [];
        if (storageConfig.config.connectTimeout !== undefined) {
            urlParams.push(`connect_timeout=${encodeURIComponent(storageConfig.config.connectTimeout)}`);
        }
        if (storageConfig.config.idleTimeout !== undefined) {
            urlParams.push(`idle_timeout=${encodeURIComponent(storageConfig.config.idleTimeout)}`);
        }
        if (storageConfig.config.maxConnections !== undefined) {
            urlParams.push(`max_connections=${encodeURIComponent(storageConfig.config.maxConnections)}`);
        }
        if (storageConfig.config.minConnections !== undefined) {
            urlParams.push(`min_connections=${encodeURIComponent(storageConfig.config.minConnections)}`);
        }
        if (storageConfig.credentials.adminAccount !== undefined) {
            urlParams.push(`admin_account=${encodeURIComponent(storageConfig.credentials.adminAccount)}`);
        }
        if (storageConfig.credentials.adminPassword !== undefined) {
            urlParams.push(`admin_password=${encodeURIComponent(storageConfig.credentials.adminPassword)}`);
        }
        uri = `postgres://${encodeURIComponent(storageConfig.credentials.account)}:${encodeURIComponent(storageConfig.credentials.password)}@${storageConfig.config.host}/${encodeURIComponent(walletConfig.id)}`;
        if (urlParams.length > 0) {
            uri = `${uri}?${urlParams.join('&')}`;
        }
    }
    else {
        throw new core_1.WalletError(`Storage type not supported: ${walletConfig.storage.type}`);
    }
    return { uri, path };
};
exports.uriFromWalletConfig = uriFromWalletConfig;
