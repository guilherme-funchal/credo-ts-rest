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
exports.Repository = void 0;
const error_1 = require("../error");
const RepositoryEvents_1 = require("./RepositoryEvents");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class Repository {
    constructor(recordClass, storageService, eventEmitter) {
        this.storageService = storageService;
        this.recordClass = recordClass;
        this.eventEmitter = eventEmitter;
    }
    /** @inheritDoc {StorageService#save} */
    save(agentContext, record) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.storageService.save(agentContext, record);
            this.eventEmitter.emit(agentContext, {
                type: RepositoryEvents_1.RepositoryEventTypes.RecordSaved,
                payload: {
                    // Record in event should be static
                    record: record.clone(),
                },
            });
        });
    }
    /** @inheritDoc {StorageService#update} */
    update(agentContext, record) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.storageService.update(agentContext, record);
            this.eventEmitter.emit(agentContext, {
                type: RepositoryEvents_1.RepositoryEventTypes.RecordUpdated,
                payload: {
                    // Record in event should be static
                    record: record.clone(),
                },
            });
        });
    }
    /** @inheritDoc {StorageService#delete} */
    delete(agentContext, record) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.storageService.delete(agentContext, record);
            this.eventEmitter.emit(agentContext, {
                type: RepositoryEvents_1.RepositoryEventTypes.RecordDeleted,
                payload: {
                    // Record in event should be static
                    record: record.clone(),
                },
            });
        });
    }
    /**
     * Delete record by id. Throws {RecordNotFoundError} if no record is found
     * @param id the id of the record to delete
     * @returns
     */
    deleteById(agentContext, id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.storageService.deleteById(agentContext, this.recordClass, id);
            this.eventEmitter.emit(agentContext, {
                type: RepositoryEvents_1.RepositoryEventTypes.RecordDeleted,
                payload: {
                    record: { id, type: this.recordClass.type },
                },
            });
        });
    }
    /** @inheritDoc {StorageService#getById} */
    getById(agentContext, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.storageService.getById(agentContext, this.recordClass, id);
        });
    }
    /**
     * Find record by id. Returns null if no record is found
     * @param id the id of the record to retrieve
     * @returns
     */
    findById(agentContext, id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.storageService.getById(agentContext, this.recordClass, id);
            }
            catch (error) {
                if (error instanceof error_1.RecordNotFoundError)
                    return null;
                throw error;
            }
        });
    }
    /** @inheritDoc {StorageService#getAll} */
    getAll(agentContext) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.storageService.getAll(agentContext, this.recordClass);
        });
    }
    /** @inheritDoc {StorageService#findByQuery} */
    findByQuery(agentContext, query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.storageService.findByQuery(agentContext, this.recordClass, query);
        });
    }
    /**
     * Find a single record by query. Returns null if not found.
     * @param query the query
     * @returns the record, or null if not found
     * @throws {RecordDuplicateError} if multiple records are found for the given query
     */
    findSingleByQuery(agentContext, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const records = yield this.findByQuery(agentContext, query);
            if (records.length > 1) {
                throw new error_1.RecordDuplicateError(`Multiple records found for given query '${JSON.stringify(query)}'`, {
                    recordType: this.recordClass.type,
                });
            }
            if (records.length < 1) {
                return null;
            }
            return records[0];
        });
    }
    /**
     * Find a single record by query. Throws if not found
     * @param query the query
     * @returns the record
     * @throws {RecordDuplicateError} if multiple records are found for the given query
     * @throws {RecordNotFoundError} if no record is found for the given query
     */
    getSingleByQuery(agentContext, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const record = yield this.findSingleByQuery(agentContext, query);
            if (!record) {
                throw new error_1.RecordNotFoundError(`No record found for given query '${JSON.stringify(query)}'`, {
                    recordType: this.recordClass.type,
                });
            }
            return record;
        });
    }
}
exports.Repository = Repository;
