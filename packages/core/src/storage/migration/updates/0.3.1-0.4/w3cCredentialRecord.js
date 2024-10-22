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
exports.migrateW3cCredentialRecordToV0_4 = migrateW3cCredentialRecordToV0_4;
const repository_1 = require("../../../../modules/vc/repository");
/**
 * Re-saves the w3c credential records to add the new claimFormat tag.
 */
function migrateW3cCredentialRecordToV0_4(agent) {
    return __awaiter(this, void 0, void 0, function* () {
        agent.config.logger.info('Migration w3c credential records records to storage version 0.4');
        const w3cCredentialRepository = agent.dependencyManager.resolve(repository_1.W3cCredentialRepository);
        agent.config.logger.debug(`Fetching all w3c credential records from storage`);
        const records = yield w3cCredentialRepository.getAll(agent.context);
        agent.config.logger.debug(`Found a total of ${records.length} w3c credential records to update.`);
        for (const record of records) {
            agent.config.logger.debug(`Re-saving w3c credential record with id ${record.id} to add claimFormat tag for storage version 0.4`);
            // Save updated record
            yield w3cCredentialRepository.update(agent.context, record);
            agent.config.logger.debug(`Successfully migrated w3c credential record with id ${record.id} to storage version 0.4`);
        }
    });
}
