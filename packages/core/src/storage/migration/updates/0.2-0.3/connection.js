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
exports.migrateConnectionRecordToV0_3 = migrateConnectionRecordToV0_3;
exports.migrateConnectionRecordTags = migrateConnectionRecordTags;
const connections_1 = require("../../../../modules/connections");
const routing_1 = require("../../../../modules/routing");
/**
 * Migrate the {@link ConnectionRecord} to a 0.3 compatible format.
 *
 * @param agent
 */
function migrateConnectionRecordToV0_3(agent) {
    return __awaiter(this, void 0, void 0, function* () {
        agent.config.logger.info('Migrating connection records to storage version 0.3');
        const connectionRepository = agent.dependencyManager.resolve(connections_1.ConnectionRepository);
        const mediationRepository = agent.dependencyManager.resolve(routing_1.MediationRepository);
        agent.config.logger.debug('Fetching all connection records from storage');
        const allConnections = yield connectionRepository.getAll(agent.context);
        agent.config.logger.debug(`Found a total of ${allConnections.length} connection records to update`);
        agent.config.logger.debug('Fetching all mediation records from storage');
        const allMediators = yield mediationRepository.getAll(agent.context);
        agent.config.logger.debug(`Found a total of ${allMediators.length} mediation records`);
        const mediatorConnectionIds = new Set(allMediators.map((mediator) => mediator.connectionId));
        for (const connectionRecord of allConnections) {
            agent.config.logger.debug(`Migrating connection record with id ${connectionRecord.id} to storage version 0.3`);
            yield migrateConnectionRecordTags(agent, connectionRecord, mediatorConnectionIds);
            yield connectionRepository.update(agent.context, connectionRecord);
            agent.config.logger.debug(`Successfully migrated connection record with id ${connectionRecord.id} to storage version 0.3`);
        }
    });
}
/**
 *
 * @param agent
 * @param connectionRecord
 */
function migrateConnectionRecordTags(agent_1, connectionRecord_1) {
    return __awaiter(this, arguments, void 0, function* (agent, connectionRecord, mediatorConnectionIds = new Set()) {
        agent.config.logger.debug(`Migrating internal connection record type tags ${connectionRecord.id} to storage version 0.3`);
        // Old connection records will have tags set in the 'connectionType' property
        const connectionTypeTags = (connectionRecord.getTags().connectionType || []);
        const connectionTypes = [...connectionTypeTags];
        if (mediatorConnectionIds.has(connectionRecord.id) && !connectionTypes.includes(connections_1.ConnectionType.Mediator)) {
            connectionTypes.push(connections_1.ConnectionType.Mediator);
        }
        connectionRecord.connectionTypes = connectionTypes;
        connectionRecord.setTag('connectionType', undefined);
        agent.config.logger.debug(`Successfully migrated internal connection record type tags ${connectionRecord.id} to storage version 0.3`);
    });
}
