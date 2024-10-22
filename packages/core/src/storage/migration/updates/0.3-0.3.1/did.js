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
exports.migrateDidRecordToV0_3_1 = migrateDidRecordToV0_3_1;
const dids_1 = require("../../../../modules/dids");
const uuid_1 = require("../../../../utils/uuid");
/**
 * Migrates the {@link DidRecord} to 0.3 compatible format. It fetches all records from storage
 * and applies the needed updates to the records. After a record has been transformed, it is updated
 * in storage and the next record will be transformed.
 *
 * The following transformations are applied:
 *  - {@link extractDidAsSeparateProperty}
 */
function migrateDidRecordToV0_3_1(agent) {
    return __awaiter(this, void 0, void 0, function* () {
        agent.config.logger.info('Migrating did records to storage version 0.3.1');
        const didRepository = agent.dependencyManager.resolve(dids_1.DidRepository);
        agent.config.logger.debug(`Fetching all did records from storage`);
        const allDids = yield didRepository.getAll(agent.context);
        agent.config.logger.debug(`Found a total of ${allDids.length} did records to update.`);
        for (const didRecord of allDids) {
            agent.config.logger.debug(`Migrating did record with id ${didRecord.id} to storage version 0.3.1`);
            const newId = (0, uuid_1.uuid)();
            agent.config.logger.debug(`Updating id ${didRecord.id} to ${newId} for did record`);
            // The id of the didRecord was previously the did itself. This prevented us from connecting to ourselves
            didRecord.did = didRecord.id;
            didRecord.id = newId;
            // Save new did record
            yield didRepository.save(agent.context, didRecord);
            // Delete old did record
            yield didRepository.deleteById(agent.context, didRecord.did);
            agent.config.logger.debug(`Successfully migrated did record with old id ${didRecord.did} to new id ${didRecord.id} to storage version 0.3.1`);
        }
    });
}
