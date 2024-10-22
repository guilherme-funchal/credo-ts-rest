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
exports.IndySdkToAskarMigrationUpdater = void 0;
const anoncreds_1 = require("@aries-framework/anoncreds");
const askar_1 = require("@aries-framework/askar");
const core_1 = require("@aries-framework/core");
const aries_askar_shared_1 = require("@hyperledger/aries-askar-shared");
const IndySdkToAskarMigrationError_1 = require("./errors/IndySdkToAskarMigrationError");
const utils_1 = require("./utils");
/**
 *
 * Migration class to move a wallet form the indy-sdk structure to the new
 * askar wallet structure.
 *
 * Right now, this is ONLY supported within React Native environments AND only sqlite.
 *
 * The reason it only works within React Native is that we ONLY update the
 * keys, masterSecret and credentials for now. If you have an agent in Node.JS
 * where it only contains these records, it may be used but we cannot
 * guarantee a successful migration.
 *
 */
class IndySdkToAskarMigrationUpdater {
    constructor(walletConfig, agent, dbPath, defaultLinkSecretId) {
        this.walletConfig = walletConfig;
        this.dbPath = dbPath;
        this.agent = agent;
        this.fs = this.agent.dependencyManager.resolve(core_1.InjectionSymbols.FileSystem);
        this.defaultLinkSecretId = defaultLinkSecretId !== null && defaultLinkSecretId !== void 0 ? defaultLinkSecretId : walletConfig.id;
    }
    static initialize(_a) {
        return __awaiter(this, arguments, void 0, function* ({ dbPath, agent, defaultLinkSecretId, }) {
            var _b;
            const { config: { walletConfig }, } = agent;
            if (typeof ((_b = process === null || process === void 0 ? void 0 : process.versions) === null || _b === void 0 ? void 0 : _b.node) !== 'undefined') {
                agent.config.logger.warn('Node.JS is not fully supported. Using this will likely leave the wallet in a half-migrated state');
            }
            if (!walletConfig) {
                throw new IndySdkToAskarMigrationError_1.IndySdkToAskarMigrationError('Wallet config is required for updating the wallet');
            }
            if (walletConfig.storage && walletConfig.storage.type !== 'sqlite') {
                throw new IndySdkToAskarMigrationError_1.IndySdkToAskarMigrationError('Only sqlite wallets are supported, right now');
            }
            if (agent.isInitialized) {
                throw new IndySdkToAskarMigrationError_1.IndySdkToAskarMigrationError('Wallet migration can not be done on an initialized agent');
            }
            if (!(agent.dependencyManager.resolve(core_1.InjectionSymbols.Wallet) instanceof askar_1.AskarWallet)) {
                throw new IndySdkToAskarMigrationError_1.IndySdkToAskarMigrationError("Wallet on the agent must be of instance 'AskarWallet'");
            }
            return new IndySdkToAskarMigrationUpdater(walletConfig, agent, dbPath, defaultLinkSecretId);
        });
    }
    /**
     * This function migrates the old database to the new structure.
     *
     * This doubles checks some fields as later it might be possible to run this function
     */
    migrate() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const specUri = this.backupFile;
            const kdfLevel = (_a = this.walletConfig.keyDerivationMethod) !== null && _a !== void 0 ? _a : core_1.KeyDerivationMethod.Argon2IMod;
            const walletName = this.walletConfig.id;
            const walletKey = this.walletConfig.key;
            const storageType = (_c = (_b = this.walletConfig.storage) === null || _b === void 0 ? void 0 : _b.type) !== null && _c !== void 0 ? _c : 'sqlite';
            if (storageType !== 'sqlite') {
                throw new IndySdkToAskarMigrationError_1.IndySdkToAskarMigrationError("Storage type defined and not of type 'sqlite'");
            }
            if (!walletKey) {
                throw new IndySdkToAskarMigrationError_1.IndySdkToAskarMigrationError('Wallet key is not defined in the wallet configuration');
            }
            this.agent.config.logger.info('Migration indy-sdk database structure to askar');
            yield aries_askar_shared_1.Migration.migrate({ specUri, walletKey, kdfLevel, walletName });
        });
    }
    /*
     * Checks whether the destination locations are already used. This might
     * happen if you want to migrate a wallet when you already have a new wallet
     * with the same id.
     */
    assertDestinationsAreFree() {
        return __awaiter(this, void 0, void 0, function* () {
            const areAllDestinationsTaken = (yield this.fs.exists(this.backupFile)) || (yield this.fs.exists(this.newWalletPath));
            if (areAllDestinationsTaken) {
                throw new IndySdkToAskarMigrationError_1.IndySdkToAskarMigrationError(`Files already exist at paths that will be used for backing up. Please remove them manually. Backup path: '${this.backupFile}' and new wallet path: ${this.newWalletPath} `);
            }
        });
    }
    /**
     * Location of the new wallet
     */
    get newWalletPath() {
        return `${this.fs.dataPath}/wallet/${this.walletConfig.id}/sqlite.db`;
    }
    /**
     * Temporary backup location of the pre-migrated script
     */
    get backupFile() {
        return `${this.fs.tempPath}/${this.walletConfig.id}.db`;
    }
    copyDatabaseWithOptionalWal(src, dest) {
        return __awaiter(this, void 0, void 0, function* () {
            // Copy the supplied database to the backup destination
            yield this.fs.copyFile(src, dest);
            // If a wal-file is included, also copy it (https://www.sqlite.org/wal.html)
            if (yield this.fs.exists(`${src}-wal`)) {
                yield this.fs.copyFile(`${src}-wal`, `${dest}-wal`);
            }
        });
    }
    /**
     * Backup the database file. This function makes sure that the the indy-sdk
     * database file is backed up within our temporary directory path. If some
     * error occurs, `this.revertDatabase()` will be called to revert the backup.
     */
    backupDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            const src = this.dbPath;
            const dest = this.backupFile;
            this.agent.config.logger.trace(`Creating backup from '${src}' to '${dest}'`);
            // Create the directories for the backup
            yield this.fs.createDirectory(dest);
            // Copy the supplied database to the backup destination, with optional wal-file
            yield this.copyDatabaseWithOptionalWal(src, dest);
            if (!(yield this.fs.exists(dest))) {
                throw new IndySdkToAskarMigrationError_1.IndySdkToAskarMigrationError('Could not locate the new backup file');
            }
        });
    }
    // Delete the backup as `this.fs.copyFile` only copies and no deletion
    // Since we use `tempPath` which is cleared when certain events happen,
    // e.g. cron-job and system restart (depending on the os) we could omit
    // this call `await this.fs.delete(this.backupFile)`.
    cleanBackup() {
        return __awaiter(this, void 0, void 0, function* () {
            this.agent.config.logger.trace(`Deleting the backup file at '${this.backupFile}'`);
            yield this.fs.delete(this.backupFile);
            // Also delete wal-file if it exists
            if (yield this.fs.exists(`${this.backupFile}-wal`)) {
                yield this.fs.delete(`${this.backupFile}-wal`);
            }
        });
    }
    /**
     * Move the migrated and updated database file to the new location according
     * to the `FileSystem.dataPath`.
     */
    moveToNewLocation() {
        return __awaiter(this, void 0, void 0, function* () {
            const src = this.backupFile;
            // New path for the database
            const dest = this.newWalletPath;
            // create the wallet directory
            yield this.fs.createDirectory(dest);
            this.agent.config.logger.trace(`Moving upgraded database from ${src} to ${dest}`);
            // Copy the file from the database path to the new location, with optional wal-file
            yield this.copyDatabaseWithOptionalWal(src, dest);
        });
    }
    /**
     * Function that updates the values from an indy-sdk structure to the new askar structure.
     *
     * > NOTE: It is very important that this script is ran before the 0.3.x to
     *         0.4.x migration script. This can easily be done by calling this when you
     *         upgrade, before you initialize the agent with `autoUpdateStorageOnStartup:
     *         true`.
     *
     * - Assert that the paths that will be used are free
     * - Create a backup of the database
     * - Migrate the database to askar structure
     * - Update the Keys
     * - Update the Master Secret (Link Secret)
     * - Update the credentials
     * If any of those failed:
     *   - Revert the database
     * - Clear the backup from the temporary directory
     */
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield this.assertDestinationsAreFree();
            yield this.backupDatabase();
            try {
                // Migrate the database
                yield this.migrate();
                const keyMethod = (0, utils_1.keyDerivationMethodToStoreKeyMethod)((_a = this.walletConfig.keyDerivationMethod) !== null && _a !== void 0 ? _a : core_1.KeyDerivationMethod.Argon2IMod);
                this.store = yield aries_askar_shared_1.Store.open({ uri: `sqlite://${this.backupFile}`, passKey: this.walletConfig.key, keyMethod });
                // Update the values to reflect the new structure
                yield this.updateKeys();
                yield this.updateCredentialDefinitions();
                yield this.updateMasterSecret();
                yield this.updateCredentials();
                // Move the migrated and updated file to the expected location for afj
                yield this.moveToNewLocation();
            }
            catch (err) {
                this.agent.config.logger.error(`Migration failed. Restoring state. ${err.message}`);
                throw new IndySdkToAskarMigrationError_1.IndySdkToAskarMigrationError(`Migration failed. State has been restored. ${err.message}`, {
                    cause: err.cause,
                });
            }
            finally {
                yield this.cleanBackup();
            }
        });
    }
    updateKeys() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.store) {
                throw new IndySdkToAskarMigrationError_1.IndySdkToAskarMigrationError('Update keys can not be called outside of the `update()` function');
            }
            const category = 'Indy::Key';
            this.agent.config.logger.info(`Migrating category: ${category}`);
            let updateCount = 0;
            const session = this.store.transaction();
            for (;;) {
                const txn = yield session.open();
                const keys = yield txn.fetchAll({ category, limit: 50 });
                if (!keys || keys.length === 0) {
                    yield txn.close();
                    break;
                }
                for (const row of keys) {
                    this.agent.config.logger.debug(`Migrating ${row.name} to the new askar format`);
                    const signKey = JSON.parse(row.value).signkey;
                    const keySk = core_1.TypedArrayEncoder.fromBase58(signKey);
                    const key = aries_askar_shared_1.Key.fromSecretBytes({
                        algorithm: aries_askar_shared_1.KeyAlgs.Ed25519,
                        secretKey: new Uint8Array(keySk.slice(0, 32)),
                    });
                    yield txn.insertKey({ name: row.name, key });
                    yield txn.remove({ category, name: row.name });
                    key.handle.free();
                    updateCount++;
                }
                yield txn.commit();
            }
            this.agent.config.logger.info(`Migrated ${updateCount} records of type ${category}`);
        });
    }
    updateCredentialDefinitions() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.store) {
                throw new IndySdkToAskarMigrationError_1.IndySdkToAskarMigrationError('Update keys can not be called outside of the `update()` function');
            }
            const category = 'Indy::CredentialDefinition';
            this.agent.config.logger.info(`Migrating category: ${category}`);
            const session = this.store.transaction();
            for (;;) {
                const txn = yield session.open();
                const keys = yield txn.fetchAll({ category, limit: 50 });
                if (!keys || keys.length === 0) {
                    yield txn.close();
                    break;
                }
                else {
                    // This will be entered if there are credential definitions in the wallet
                    yield txn.close();
                    throw new IndySdkToAskarMigrationError_1.IndySdkToAskarMigrationError('Migration of Credential Definitions is not yet supported');
                }
            }
        });
    }
    updateMasterSecret() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.store) {
                throw new IndySdkToAskarMigrationError_1.IndySdkToAskarMigrationError('Update master secret can not be called outside of the `update()` function');
            }
            const category = 'Indy::MasterSecret';
            this.agent.config.logger.info(`Migrating category: ${category}`);
            let updateCount = 0;
            const session = this.store.transaction();
            for (;;) {
                const txn = yield session.open();
                const masterSecrets = yield txn.fetchAll({ category, limit: 50 });
                if (!masterSecrets || masterSecrets.length === 0) {
                    yield txn.close();
                    break;
                }
                if (!masterSecrets.some((ms) => ms.name === this.defaultLinkSecretId)) {
                    throw new IndySdkToAskarMigrationError_1.IndySdkToAskarMigrationError('defaultLinkSecretId can not be established.');
                }
                this.agent.config.logger.info(`Default link secret id for migration is ${this.defaultLinkSecretId}`);
                for (const row of masterSecrets) {
                    this.agent.config.logger.debug(`Migrating ${row.name} to the new askar format`);
                    const isDefault = masterSecrets.length === 0 || row.name === this.walletConfig.id;
                    const { value: { ms }, } = JSON.parse(row.value);
                    const record = new anoncreds_1.AnonCredsLinkSecretRecord({ linkSecretId: row.name, value: ms });
                    record.setTag('isDefault', isDefault);
                    const value = core_1.JsonTransformer.serialize(record);
                    const tags = (0, utils_1.transformFromRecordTagValues)(record.getTags());
                    yield txn.insert({ category: record.type, name: record.id, value, tags });
                    yield txn.remove({ category, name: row.name });
                    updateCount++;
                }
                yield txn.commit();
            }
            this.agent.config.logger.info(`Migrated ${updateCount} records of type ${category}`);
        });
    }
    updateCredentials() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.store) {
                throw new IndySdkToAskarMigrationError_1.IndySdkToAskarMigrationError('Update credentials can not be called outside of the `update()` function');
            }
            const category = 'Indy::Credential';
            this.agent.config.logger.info(`Migrating category: ${category}`);
            let updateCount = 0;
            const session = this.store.transaction();
            for (;;) {
                const txn = yield session.open();
                const credentials = yield txn.fetchAll({ category, limit: 50 });
                if (!credentials || credentials.length === 0) {
                    yield txn.close();
                    break;
                }
                for (const row of credentials) {
                    this.agent.config.logger.debug(`Migrating ${row.name} to the new askar format`);
                    const data = JSON.parse(row.value);
                    const [issuerId] = data.cred_def_id.split(':');
                    const [schemaIssuerId, , schemaName, schemaVersion] = data.schema_id.split(':');
                    const record = new anoncreds_1.AnonCredsCredentialRecord({
                        credential: data,
                        issuerId,
                        schemaName,
                        schemaIssuerId,
                        schemaVersion,
                        credentialId: row.name,
                        linkSecretId: this.defaultLinkSecretId,
                        // Hardcode methodName to indy as all IndySDK credentials are indy credentials
                        methodName: 'indy',
                    });
                    const tags = (0, utils_1.transformFromRecordTagValues)(record.getTags());
                    const value = core_1.JsonTransformer.serialize(record);
                    yield txn.insert({ category: record.type, name: record.id, value, tags });
                    yield txn.remove({ category, name: row.name });
                    updateCount++;
                }
                yield txn.commit();
            }
            this.agent.config.logger.info(`Migrated ${updateCount} records of type ${category}`);
        });
    }
}
exports.IndySdkToAskarMigrationUpdater = IndySdkToAskarMigrationUpdater;
