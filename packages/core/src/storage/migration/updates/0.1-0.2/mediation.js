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
exports.migrateMediationRecordToV0_2 = migrateMediationRecordToV0_2;
exports.updateMediationRole = updateMediationRole;
const routing_1 = require("../../../../modules/routing");
/**
 * Migrates the {@link MediationRecord} to 0.2 compatible format. It fetches all records from storage
 * and applies the needed updates to the records. After a record has been transformed, it is updated
 * in storage and the next record will be transformed.
 *
 * The following transformations are applied:
 *  - {@link updateMediationRole}
 */
function migrateMediationRecordToV0_2(agent, upgradeConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        agent.config.logger.info('Migrating mediation records to storage version 0.2');
        const mediationRepository = agent.dependencyManager.resolve(routing_1.MediationRepository);
        agent.config.logger.debug(`Fetching all mediation records from storage`);
        const allMediationRecords = yield mediationRepository.getAll(agent.context);
        agent.config.logger.debug(`Found a total of ${allMediationRecords.length} mediation records to update.`);
        for (const mediationRecord of allMediationRecords) {
            agent.config.logger.debug(`Migrating mediation record with id ${mediationRecord.id} to storage version 0.2`);
            yield updateMediationRole(agent, mediationRecord, upgradeConfig);
            yield mediationRepository.update(agent.context, mediationRecord);
            agent.config.logger.debug(`Successfully migrated mediation record with id ${mediationRecord.id} to storage version 0.2`);
        }
    });
}
/**
 * The role in the mediation record was always being set to {@link MediationRole.Mediator} for both mediators and recipients. This didn't cause any issues, but would return the wrong role for recipients.
 *
 * In 0.2 a check is added to make sure the role of a mediation record matches with actions (e.g. a recipient can't grant mediation), which means it will throw an error if the role is not set correctly.
 *
 * Because it's not always possible detect whether the role should actually be mediator or recipient, a number of configuration options are provided on how the role should be updated:
 *
 * - `allMediator`: The role is set to {@link MediationRole.Mediator} for both mediators and recipients
 * - `allRecipient`: The role is set to {@link MediationRole.Recipient} for both mediators and recipients
 * - `recipientIfEndpoint`: The role is set to {@link MediationRole.Recipient} if their is an `endpoint` configured on the record otherwise it is set to {@link MediationRole.Mediator}.
 *      The endpoint is not set when running as a mediator, so in theory this allows to determine the role of the record.
 *      There is one case where this could be problematic when the role should be recipient, if the mediation grant hasn't actually occurred (meaning the endpoint is not set).
 * - `doNotChange`: The role is not changed
 *
 * Most agents only act as either the role of mediator or recipient, in which case the `allMediator` or `allRecipient` configuration is the most appropriate. If your agent acts as both a recipient and mediator, the `recipientIfEndpoint` configuration is the most appropriate. The `doNotChange` options is not recommended and can lead to errors if the role is not set correctly.
 *
 */
function updateMediationRole(agent_1, mediationRecord_1, _a) {
    return __awaiter(this, arguments, void 0, function* (agent, mediationRecord, { mediationRoleUpdateStrategy }) {
        agent.config.logger.debug(`Updating mediation record role using strategy '${mediationRoleUpdateStrategy}'`);
        switch (mediationRoleUpdateStrategy) {
            case 'allMediator':
                mediationRecord.role = routing_1.MediationRole.Mediator;
                break;
            case 'allRecipient':
                mediationRecord.role = routing_1.MediationRole.Recipient;
                break;
            case 'recipientIfEndpoint':
                if (mediationRecord.endpoint) {
                    agent.config.logger.debug('Mediation record endpoint is set, setting mediation role to recipient');
                    mediationRecord.role = routing_1.MediationRole.Recipient;
                }
                else {
                    agent.config.logger.debug('Mediation record endpoint is not set, setting mediation role to mediator');
                    mediationRecord.role = routing_1.MediationRole.Mediator;
                }
                break;
            case 'doNotChange':
                break;
        }
    });
}
