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
exports.migrateCacheToV0_4 = migrateCacheToV0_4;
const constants_1 = require("../../../../constants");
const BaseRecord_1 = require("../../../BaseRecord");
/**
 * removes the all cache records as used in 0.3.0, as they have been updated to use the new cache interface.
 */
function migrateCacheToV0_4(agent) {
    return __awaiter(this, void 0, void 0, function* () {
        agent.config.logger.info('Removing 0.3 cache records from storage');
        const storageService = agent.dependencyManager.resolve(constants_1.InjectionSymbols.StorageService);
        agent.config.logger.debug(`Fetching all cache records`);
        const records = yield storageService.getAll(agent.context, CacheRecord);
        for (const record of records) {
            agent.config.logger.debug(`Removing cache record with id ${record.id}`);
            yield storageService.deleteById(agent.context, CacheRecord, record.id);
            agent.config.logger.debug(`Successfully removed cache record with id ${record.id}`);
        }
    });
}
class CacheRecord extends BaseRecord_1.BaseRecord {
    constructor() {
        super(...arguments);
        this.type = CacheRecord.type;
    }
    getTags() {
        return this._tags;
    }
}
CacheRecord.type = 'CacheRecord';
