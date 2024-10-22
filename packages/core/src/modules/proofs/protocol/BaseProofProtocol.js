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
exports.BaseProofProtocol = void 0;
const EventEmitter_1 = require("../../../agent/EventEmitter");
const storage_1 = require("../../../storage");
const ProofEvents_1 = require("../ProofEvents");
const ProofState_1 = require("../models/ProofState");
const repository_1 = require("../repository");
class BaseProofProtocol {
    processProblemReport(messageContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const { message: proofProblemReportMessage, agentContext, connection } = messageContext;
            agentContext.config.logger.debug(`Processing problem report with message id ${proofProblemReportMessage.id}`);
            const proofRecord = yield this.getByThreadAndConnectionId(agentContext, proofProblemReportMessage.threadId, connection === null || connection === void 0 ? void 0 : connection.id);
            // Update record
            proofRecord.errorMessage = `${proofProblemReportMessage.description.code}: ${proofProblemReportMessage.description.en}`;
            yield this.updateState(agentContext, proofRecord, ProofState_1.ProofState.Abandoned);
            return proofRecord;
        });
    }
    /**
     * Update the record to a new state and emit an state changed event. Also updates the record
     * in storage.
     *
     * @param proofRecord The proof record to update the state for
     * @param newState The state to update to
     *
     */
    updateState(agentContext, proofRecord, newState) {
        return __awaiter(this, void 0, void 0, function* () {
            const proofRepository = agentContext.dependencyManager.resolve(repository_1.ProofRepository);
            agentContext.config.logger.debug(`Updating proof record ${proofRecord.id} to state ${newState} (previous=${proofRecord.state})`);
            const previousState = proofRecord.state;
            proofRecord.state = newState;
            yield proofRepository.update(agentContext, proofRecord);
            this.emitStateChangedEvent(agentContext, proofRecord, previousState);
        });
    }
    emitStateChangedEvent(agentContext, proofRecord, previousState) {
        const eventEmitter = agentContext.dependencyManager.resolve(EventEmitter_1.EventEmitter);
        eventEmitter.emit(agentContext, {
            type: ProofEvents_1.ProofEventTypes.ProofStateChanged,
            payload: {
                proofRecord: proofRecord.clone(),
                previousState: previousState,
            },
        });
    }
    /**
     * Retrieve a proof record by id
     *
     * @param proofRecordId The proof record id
     * @throws {RecordNotFoundError} If no record is found
     * @return The proof record
     *
     */
    getById(agentContext, proofRecordId) {
        const proofRepository = agentContext.dependencyManager.resolve(repository_1.ProofRepository);
        return proofRepository.getById(agentContext, proofRecordId);
    }
    /**
     * Retrieve all proof records
     *
     * @returns List containing all proof records
     */
    getAll(agentContext) {
        const proofRepository = agentContext.dependencyManager.resolve(repository_1.ProofRepository);
        return proofRepository.getAll(agentContext);
    }
    findAllByQuery(agentContext, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const proofRepository = agentContext.dependencyManager.resolve(repository_1.ProofRepository);
            return proofRepository.findByQuery(agentContext, query);
        });
    }
    /**
     * Find a proof record by id
     *
     * @param proofRecordId the proof record id
     * @returns The proof record or null if not found
     */
    findById(agentContext, proofRecordId) {
        const proofRepository = agentContext.dependencyManager.resolve(repository_1.ProofRepository);
        return proofRepository.findById(agentContext, proofRecordId);
    }
    delete(agentContext, proofRecord, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const proofRepository = agentContext.dependencyManager.resolve(repository_1.ProofRepository);
            const didCommMessageRepository = agentContext.dependencyManager.resolve(storage_1.DidCommMessageRepository);
            yield proofRepository.delete(agentContext, proofRecord);
            const deleteAssociatedDidCommMessages = (_a = options === null || options === void 0 ? void 0 : options.deleteAssociatedDidCommMessages) !== null && _a !== void 0 ? _a : true;
            if (deleteAssociatedDidCommMessages) {
                const didCommMessages = yield didCommMessageRepository.findByQuery(agentContext, {
                    associatedRecordId: proofRecord.id,
                });
                for (const didCommMessage of didCommMessages) {
                    yield didCommMessageRepository.delete(agentContext, didCommMessage);
                }
            }
        });
    }
    /**
     * Retrieve a proof record by connection id and thread id
     *
     * @param connectionId The connection id
     * @param threadId The thread id
     * @throws {RecordNotFoundError} If no record is found
     * @throws {RecordDuplicateError} If multiple records are found
     * @returns The proof record
     */
    getByThreadAndConnectionId(agentContext, threadId, connectionId) {
        const proofRepository = agentContext.dependencyManager.resolve(repository_1.ProofRepository);
        return proofRepository.getSingleByQuery(agentContext, {
            connectionId,
            threadId,
        });
    }
    /**
     * Find a proof record by connection id and thread id, returns null if not found
     *
     * @param connectionId The connection id
     * @param threadId The thread id
     * @returns The proof record
     */
    findByThreadAndConnectionId(agentContext, threadId, connectionId) {
        const proofRepository = agentContext.dependencyManager.resolve(repository_1.ProofRepository);
        return proofRepository.findSingleByQuery(agentContext, {
            connectionId,
            threadId,
        });
    }
    update(agentContext, proofRecord) {
        return __awaiter(this, void 0, void 0, function* () {
            const proofRepository = agentContext.dependencyManager.resolve(repository_1.ProofRepository);
            return yield proofRepository.update(agentContext, proofRecord);
        });
    }
}
exports.BaseProofProtocol = BaseProofProtocol;
