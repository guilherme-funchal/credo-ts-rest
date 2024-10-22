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
exports.migrateDidRecordToV0_4 = migrateDidRecordToV0_4;
exports.migrateSovDidToIndyDid = migrateSovDidToIndyDid;
const dids_1 = require("../../../../modules/dids");
/**
 * Migrates the {@link DidRecord} to 0.4 compatible format. It fetches all did records from storage
 * with method sov and applies the needed updates to the records. After a record has been transformed, it is updated
 * in storage and the next record will be transformed.
 *
 * The following transformations are applied:
 *  - {@link migrateSovDidToIndyDid}
 */
function migrateDidRecordToV0_4(agent) {
    return __awaiter(this, void 0, void 0, function* () {
        agent.config.logger.info('Migrating did records to storage version 0.4');
        const didRepository = agent.dependencyManager.resolve(dids_1.DidRepository);
        agent.config.logger.debug(`Fetching all did records with did method did:sov from storage`);
        const allSovDids = yield didRepository.findByQuery(agent.context, {
            method: 'sov',
            role: dids_1.DidDocumentRole.Created,
        });
        agent.config.logger.debug(`Found a total of ${allSovDids.length} did:sov did records to update.`);
        for (const sovDidRecord of allSovDids) {
            agent.config.logger.debug(`Migrating did:sov did record with id ${sovDidRecord.id} to storage version 0.4`);
            const oldDid = sovDidRecord.did;
            migrateSovDidToIndyDid(agent, sovDidRecord);
            // Save updated did record
            yield didRepository.update(agent.context, sovDidRecord);
            agent.config.logger.debug(`Successfully migrated did:sov did record with old did ${oldDid} to new did ${sovDidRecord.did} for storage version 0.4`);
        }
    });
}
function migrateSovDidToIndyDid(agent, didRecord) {
    agent.config.logger.debug(`Migrating did record with id ${didRecord.id} and did ${didRecord.did} to indy did for version 0.4`);
    const qualifiedIndyDid = didRecord.getTag('qualifiedIndyDid');
    didRecord.did = qualifiedIndyDid;
    // Unset qualifiedIndyDid tag
    didRecord.setTag('qualifiedIndyDid', undefined);
}
