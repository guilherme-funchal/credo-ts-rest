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
exports.migrateAnonCredsSchemaRecordToV0_4 = migrateAnonCredsSchemaRecordToV0_4;
const repository_1 = require("../../repository");
/**
 * Migrates the {@link AnonCredsSchemaRecord} to 0.4 compatible format. It fetches all schema records from
 * storage and updates the format based on the new ledger agnostic anoncreds models. After a record has been transformed,
 * it is updated in storage and the next record will be transformed.
 */
function migrateAnonCredsSchemaRecordToV0_4(agent) {
    return __awaiter(this, void 0, void 0, function* () {
        agent.config.logger.info('Migrating AnonCredsSchemaRecord records to storage version 0.4');
        const schemaRepository = agent.dependencyManager.resolve(repository_1.AnonCredsSchemaRepository);
        agent.config.logger.debug(`Fetching all schema records from storage`);
        const schemaRecords = yield schemaRepository.getAll(agent.context);
        agent.config.logger.debug(`Found a total of ${schemaRecords.length} schema records to update.`);
        for (const schemaRecord of schemaRecords) {
            const oldSchema = schemaRecord.schema;
            // If askar migration script is ran, it could be that the credential definition record is already in 0.4 format
            if (oldSchema.id === undefined) {
                agent.config.logger.info(`Schema record with id ${schemaRecord.id} and schema id ${schemaRecord.schemaId} is already in storage version 0.4 format. Probably due to Indy SDK to Askar migration. Skipping...`);
                continue;
            }
            agent.config.logger.debug(`Migrating anoncreds schema record with id ${schemaRecord.id} and schema id ${oldSchema.id} to storage version 0.4`);
            const newSchema = {
                attrNames: oldSchema.attrNames,
                name: oldSchema.name,
                version: oldSchema.version,
                issuerId: oldSchema.id.split('/')[0],
            };
            schemaRecord.schema = newSchema;
            schemaRecord.schemaId = oldSchema.id;
            schemaRecord.methodName = 'indy';
            // schemaIssuerDid was set as tag, but is now replaced by issuerId. It was also always set
            // to the value `did` as it incorrectly parsed the schemaId.
            schemaRecord.setTag('schemaIssuerDid', undefined);
            // Save updated schema record
            yield schemaRepository.update(agent.context, schemaRecord);
            agent.config.logger.debug(`Successfully migrated schema record with id ${schemaRecord.id} to storage version 0.4`);
        }
    });
}
