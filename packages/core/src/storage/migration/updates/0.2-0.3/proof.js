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
exports.ProofRole = void 0;
exports.migrateProofExchangeRecordToV0_3 = migrateProofExchangeRecordToV0_3;
exports.getProofRole = getProofRole;
exports.migrateInternalProofExchangeRecordProperties = migrateInternalProofExchangeRecordProperties;
exports.moveDidCommMessages = moveDidCommMessages;
const models_1 = require("../../../../modules/proofs/models");
const ProofRepository_1 = require("../../../../modules/proofs/repository/ProofRepository");
const didcomm_1 = require("../../../didcomm");
/**
 * Migrates the {@link ProofExchangeRecord} to 0.3 compatible format. It fetches all records from storage
 * and applies the needed updates to the records. After a record has been transformed, it is updated
 * in storage and the next record will be transformed.
 *
 * The following transformations are applied:
 *  - {@link migrateInternalProofExchangeRecordProperties}
 *  - {@link moveDidCommMessages}
 */
function migrateProofExchangeRecordToV0_3(agent) {
    return __awaiter(this, void 0, void 0, function* () {
        agent.config.logger.info('Migrating proof records to storage version 0.3');
        const proofRepository = agent.dependencyManager.resolve(ProofRepository_1.ProofRepository);
        agent.config.logger.debug(`Fetching all proof records from storage`);
        const allProofs = yield proofRepository.getAll(agent.context);
        agent.config.logger.debug(`Found a total of ${allProofs.length} proof records to update.`);
        for (const proofRecord of allProofs) {
            agent.config.logger.debug(`Migrating proof record with id ${proofRecord.id} to storage version 0.3`);
            yield migrateInternalProofExchangeRecordProperties(agent, proofRecord);
            yield moveDidCommMessages(agent, proofRecord);
            yield proofRepository.update(agent.context, proofRecord);
            agent.config.logger.debug(`Successfully migrated proof record with id ${proofRecord.id} to storage version 0.3`);
        }
    });
}
var ProofRole;
(function (ProofRole) {
    ProofRole[ProofRole["Verifier"] = 0] = "Verifier";
    ProofRole[ProofRole["Prover"] = 1] = "Prover";
})(ProofRole || (exports.ProofRole = ProofRole = {}));
const proverProofStates = [
    models_1.ProofState.Declined,
    models_1.ProofState.ProposalSent,
    models_1.ProofState.RequestReceived,
    models_1.ProofState.PresentationSent,
    models_1.ProofState.Done,
];
const didCommMessageRoleMapping = {
    [ProofRole.Verifier]: {
        proposalMessage: didcomm_1.DidCommMessageRole.Receiver,
        requestMessage: didcomm_1.DidCommMessageRole.Sender,
        presentationMessage: didcomm_1.DidCommMessageRole.Receiver,
    },
    [ProofRole.Prover]: {
        proposalMessage: didcomm_1.DidCommMessageRole.Sender,
        requestMessage: didcomm_1.DidCommMessageRole.Receiver,
        presentationMessage: didcomm_1.DidCommMessageRole.Sender,
    },
};
const proofRecordMessageKeys = ['proposalMessage', 'requestMessage', 'presentationMessage'];
function getProofRole(proofRecord) {
    // Proofs will only have an isVerified value when a presentation is verified, meaning we're the verifier
    if (proofRecord.isVerified !== undefined) {
        return ProofRole.Verifier;
    }
    // If proofRecord.isVerified doesn't have any value, and we're also not in state done it means we're the prover.
    else if (proofRecord.state === models_1.ProofState.Done) {
        return ProofRole.Prover;
    }
    // For these states we know for certain that we're the prover
    else if (proverProofStates.includes(proofRecord.state)) {
        return ProofRole.Prover;
    }
    // For all other states we can be certain we're the verifier
    return ProofRole.Verifier;
}
/**
 * With the addition of support for different protocol versions the proof record now stores the protocol version.
 *
 * The following 0.2.0 proof record structure (unrelated keys omitted):
 *
 * ```json
 * {
 * }
 * ```
 *
 * Will be transformed into the following 0.3.0 structure (unrelated keys omitted):
 *
 * ```json
 * {
 *  "protocolVersion: "v1"
 * }
 * ```
 */
function migrateInternalProofExchangeRecordProperties(agent, proofRecord) {
    return __awaiter(this, void 0, void 0, function* () {
        agent.config.logger.debug(`Migrating internal proof record ${proofRecord.id} properties to storage version 0.3`);
        if (!proofRecord.protocolVersion) {
            agent.config.logger.debug(`Setting protocolVersion to v1`);
            proofRecord.protocolVersion = 'v1';
        }
        agent.config.logger.debug(`Successfully migrated internal proof record ${proofRecord.id} properties to storage version 0.3`);
    });
}
/**
 * In 0.3.0 the v1 didcomm messages have been moved out of the proof record into separate record using the DidCommMessageRepository.
 * This migration scripts extracts all message (proposalMessage, requestMessage, presentationMessage) and moves
 * them into the DidCommMessageRepository.
 */
function moveDidCommMessages(agent, proofRecord) {
    return __awaiter(this, void 0, void 0, function* () {
        agent.config.logger.debug(`Moving didcomm messages from proof record with id ${proofRecord.id} to DidCommMessageRecord`);
        const didCommMessageRepository = agent.dependencyManager.resolve(didcomm_1.DidCommMessageRepository);
        for (const messageKey of proofRecordMessageKeys) {
            agent.config.logger.debug(`Starting move of ${messageKey} from proof record with id ${proofRecord.id} to DIDCommMessageRecord`);
            const proofRecordJson = proofRecord;
            const message = proofRecordJson[messageKey];
            if (message) {
                const proofRole = getProofRole(proofRecord);
                const didCommMessageRole = didCommMessageRoleMapping[proofRole][messageKey];
                const didCommMessageRecord = new didcomm_1.DidCommMessageRecord({
                    role: didCommMessageRole,
                    associatedRecordId: proofRecord.id,
                    message,
                });
                yield didCommMessageRepository.save(agent.context, didCommMessageRecord);
                agent.config.logger.debug(`Successfully moved ${messageKey} from proof record with id ${proofRecord.id} to DIDCommMessageRecord`);
                delete proofRecordJson[messageKey];
            }
            else {
                agent.config.logger.debug(`Proof record with id ${proofRecord.id} does not have a ${messageKey}. Not creating a DIDCommMessageRecord`);
            }
        }
        agent.config.logger.debug(`Successfully moved didcomm messages from proof record with id ${proofRecord.id} to DIDCommMessageRecord`);
    });
}
