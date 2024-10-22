"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProofsApi = void 0;
const tsyringe_1 = require("tsyringe");
const getOutboundMessageContext_1 = require("../../agent/getOutboundMessageContext");
const error_1 = require("../../error");
const ProofState_1 = require("./models/ProofState");
let ProofsApi = (() => {
    let _classDecorators = [(0, tsyringe_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ProofsApi = _classThis = class {
        constructor(messageSender, connectionService, agentContext, proofRepository, config) {
            this.messageSender = messageSender;
            this.connectionService = connectionService;
            this.proofRepository = proofRepository;
            this.agentContext = agentContext;
            this.config = config;
        }
        getProtocol(protocolVersion) {
            const proofProtocol = this.config.proofProtocols.find((protocol) => protocol.version === protocolVersion);
            if (!proofProtocol) {
                throw new error_1.AriesFrameworkError(`No proof protocol registered for protocol version ${protocolVersion}`);
            }
            return proofProtocol;
        }
        /**
         * Initiate a new presentation exchange as prover by sending a presentation proposal message
         * to the connection with the specified connection id.
         *
         * @param options configuration to use for the proposal
         * @returns Proof exchange record associated with the sent proposal message
         */
        proposeProof(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const protocol = this.getProtocol(options.protocolVersion);
                const connectionRecord = yield this.connectionService.getById(this.agentContext, options.connectionId);
                // Assert
                connectionRecord.assertReady();
                const { message, proofRecord } = yield protocol.createProposal(this.agentContext, {
                    connectionRecord,
                    proofFormats: options.proofFormats,
                    autoAcceptProof: options.autoAcceptProof,
                    goalCode: options.goalCode,
                    comment: options.comment,
                    parentThreadId: options.parentThreadId,
                });
                const outboundMessageContext = yield (0, getOutboundMessageContext_1.getOutboundMessageContext)(this.agentContext, {
                    message,
                    associatedRecord: proofRecord,
                    connectionRecord,
                });
                yield this.messageSender.sendMessage(outboundMessageContext);
                return proofRecord;
            });
        }
        /**
         * Accept a presentation proposal as verifier (by sending a presentation request message) to the connection
         * associated with the proof record.
         *
         * @param options config object for accepting the proposal
         * @returns Proof exchange record associated with the presentation request
         */
        acceptProposal(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const proofRecord = yield this.getById(options.proofRecordId);
                if (!proofRecord.connectionId) {
                    throw new error_1.AriesFrameworkError(`No connectionId found for proof record '${proofRecord.id}'. Connection-less verification does not support presentation proposal or negotiation.`);
                }
                // with version we can get the protocol
                const protocol = this.getProtocol(proofRecord.protocolVersion);
                const connectionRecord = yield this.connectionService.getById(this.agentContext, proofRecord.connectionId);
                // Assert
                connectionRecord.assertReady();
                const { message } = yield protocol.acceptProposal(this.agentContext, {
                    proofRecord,
                    proofFormats: options.proofFormats,
                    goalCode: options.goalCode,
                    willConfirm: options.willConfirm,
                    comment: options.comment,
                    autoAcceptProof: options.autoAcceptProof,
                });
                // send the message
                const outboundMessageContext = yield (0, getOutboundMessageContext_1.getOutboundMessageContext)(this.agentContext, {
                    message,
                    associatedRecord: proofRecord,
                    connectionRecord,
                });
                yield this.messageSender.sendMessage(outboundMessageContext);
                return proofRecord;
            });
        }
        /**
         * Answer with a new presentation request in response to received presentation proposal message
         * to the connection associated with the proof record.
         *
         * @param options multiple properties like proof record id, proof formats to accept requested credentials object
         * specifying which credentials to use for the proof
         * @returns Proof record associated with the sent request message
         */
        negotiateProposal(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const proofRecord = yield this.getById(options.proofRecordId);
                if (!proofRecord.connectionId) {
                    throw new error_1.AriesFrameworkError(`No connectionId found for proof record '${proofRecord.id}'. Connection-less verification does not support negotiation.`);
                }
                const protocol = this.getProtocol(proofRecord.protocolVersion);
                const connectionRecord = yield this.connectionService.getById(this.agentContext, proofRecord.connectionId);
                // Assert
                connectionRecord.assertReady();
                const { message } = yield protocol.negotiateProposal(this.agentContext, {
                    proofRecord,
                    proofFormats: options.proofFormats,
                    autoAcceptProof: options.autoAcceptProof,
                    comment: options.comment,
                    goalCode: options.goalCode,
                    willConfirm: options.willConfirm,
                });
                const outboundMessageContext = yield (0, getOutboundMessageContext_1.getOutboundMessageContext)(this.agentContext, {
                    message,
                    associatedRecord: proofRecord,
                    connectionRecord,
                });
                yield this.messageSender.sendMessage(outboundMessageContext);
                return proofRecord;
            });
        }
        /**
         * Initiate a new presentation exchange as verifier by sending a presentation request message
         * to the connection with the specified connection id
         *
         * @param options multiple properties like connection id, protocol version, proof Formats to build the proof request
         * @returns Proof record associated with the sent request message
         */
        requestProof(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const connectionRecord = yield this.connectionService.getById(this.agentContext, options.connectionId);
                const protocol = this.getProtocol(options.protocolVersion);
                // Assert
                connectionRecord.assertReady();
                const { message, proofRecord } = yield protocol.createRequest(this.agentContext, {
                    connectionRecord,
                    proofFormats: options.proofFormats,
                    autoAcceptProof: options.autoAcceptProof,
                    parentThreadId: options.parentThreadId,
                    comment: options.comment,
                    goalCode: options.goalCode,
                    willConfirm: options.willConfirm,
                });
                const outboundMessageContext = yield (0, getOutboundMessageContext_1.getOutboundMessageContext)(this.agentContext, {
                    message,
                    associatedRecord: proofRecord,
                    connectionRecord,
                });
                yield this.messageSender.sendMessage(outboundMessageContext);
                return proofRecord;
            });
        }
        /**
         * Accept a presentation request as prover (by sending a presentation message) to the connection
         * associated with the proof record.
         *
         * @param options multiple properties like proof record id, proof formats to accept requested credentials object
         * specifying which credentials to use for the proof
         * @returns Proof record associated with the sent presentation message
         */
        acceptRequest(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const proofRecord = yield this.getById(options.proofRecordId);
                const protocol = this.getProtocol(proofRecord.protocolVersion);
                const requestMessage = yield protocol.findRequestMessage(this.agentContext, proofRecord.id);
                if (!requestMessage) {
                    throw new error_1.AriesFrameworkError(`No request message found for proof record with id '${proofRecord.id}'`);
                }
                // Use connection if present
                const connectionRecord = proofRecord.connectionId
                    ? yield this.connectionService.getById(this.agentContext, proofRecord.connectionId)
                    : undefined;
                connectionRecord === null || connectionRecord === void 0 ? void 0 : connectionRecord.assertReady();
                const { message } = yield protocol.acceptRequest(this.agentContext, {
                    proofFormats: options.proofFormats,
                    proofRecord,
                    comment: options.comment,
                    autoAcceptProof: options.autoAcceptProof,
                    goalCode: options.goalCode,
                });
                const outboundMessageContext = yield (0, getOutboundMessageContext_1.getOutboundMessageContext)(this.agentContext, {
                    message,
                    connectionRecord,
                    associatedRecord: proofRecord,
                    lastReceivedMessage: requestMessage,
                });
                yield this.messageSender.sendMessage(outboundMessageContext);
                return proofRecord;
            });
        }
        declineRequest(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const proofRecord = yield this.getById(options.proofRecordId);
                proofRecord.assertState(ProofState_1.ProofState.RequestReceived);
                const protocol = this.getProtocol(proofRecord.protocolVersion);
                if (options.sendProblemReport) {
                    yield this.sendProblemReport({ proofRecordId: options.proofRecordId, description: 'Request declined' });
                }
                yield protocol.updateState(this.agentContext, proofRecord, ProofState_1.ProofState.Declined);
                return proofRecord;
            });
        }
        /**
         * Answer with a new presentation proposal in response to received presentation request message
         * to the connection associated with the proof record.
         *
         * @param options multiple properties like proof record id, proof format (indy/ presentation exchange)
         * to include in the message
         * @returns Proof record associated with the sent proposal message
         */
        negotiateRequest(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const proofRecord = yield this.getById(options.proofRecordId);
                if (!proofRecord.connectionId) {
                    throw new error_1.AriesFrameworkError(`No connectionId found for proof record '${proofRecord.id}'. Connection-less verification does not support presentation proposal or negotiation.`);
                }
                const connectionRecord = yield this.connectionService.getById(this.agentContext, proofRecord.connectionId);
                // Assert
                connectionRecord.assertReady();
                const protocol = this.getProtocol(proofRecord.protocolVersion);
                const { message } = yield protocol.negotiateRequest(this.agentContext, {
                    proofRecord,
                    proofFormats: options.proofFormats,
                    autoAcceptProof: options.autoAcceptProof,
                    goalCode: options.goalCode,
                    comment: options.comment,
                });
                const outboundMessageContext = yield (0, getOutboundMessageContext_1.getOutboundMessageContext)(this.agentContext, {
                    message,
                    connectionRecord,
                    associatedRecord: proofRecord,
                });
                yield this.messageSender.sendMessage(outboundMessageContext);
                return proofRecord;
            });
        }
        /**
         * Initiate a new presentation exchange as verifier by sending an out of band presentation
         * request message
         *
         * @param options multiple properties like protocol version, proof Formats to build the proof request
         * @returns the message itself and the proof record associated with the sent request message
         */
        createRequest(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const protocol = this.getProtocol(options.protocolVersion);
                return yield protocol.createRequest(this.agentContext, {
                    proofFormats: options.proofFormats,
                    autoAcceptProof: options.autoAcceptProof,
                    comment: options.comment,
                    parentThreadId: options.parentThreadId,
                    goalCode: options.goalCode,
                    willConfirm: options.willConfirm,
                });
            });
        }
        /**
         * Accept a presentation as prover (by sending a presentation acknowledgement message) to the connection
         * associated with the proof record.
         *
         * @param proofRecordId The id of the proof exchange record for which to accept the presentation
         * @returns Proof record associated with the sent presentation acknowledgement message
         *
         */
        acceptPresentation(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const proofRecord = yield this.getById(options.proofRecordId);
                const protocol = this.getProtocol(proofRecord.protocolVersion);
                const requestMessage = yield protocol.findRequestMessage(this.agentContext, proofRecord.id);
                if (!requestMessage) {
                    throw new error_1.AriesFrameworkError(`No request message found for proof record with id '${proofRecord.id}'`);
                }
                const presentationMessage = yield protocol.findPresentationMessage(this.agentContext, proofRecord.id);
                if (!presentationMessage) {
                    throw new error_1.AriesFrameworkError(`No presentation message found for proof record with id '${proofRecord.id}'`);
                }
                // Use connection if present
                const connectionRecord = proofRecord.connectionId
                    ? yield this.connectionService.getById(this.agentContext, proofRecord.connectionId)
                    : undefined;
                connectionRecord === null || connectionRecord === void 0 ? void 0 : connectionRecord.assertReady();
                const { message } = yield protocol.acceptPresentation(this.agentContext, {
                    proofRecord,
                });
                // FIXME: returnRoute: false
                const outboundMessageContext = yield (0, getOutboundMessageContext_1.getOutboundMessageContext)(this.agentContext, {
                    message,
                    connectionRecord,
                    associatedRecord: proofRecord,
                    lastSentMessage: requestMessage,
                    lastReceivedMessage: presentationMessage,
                });
                yield this.messageSender.sendMessage(outboundMessageContext);
                return proofRecord;
            });
        }
        /**
         * Create a {@link RetrievedCredentials} object. Given input proof request and presentation proposal,
         * use credentials in the wallet to build indy requested credentials object for input to proof creation.
         * If restrictions allow, self attested attributes will be used.
         *
         * @param options multiple properties like proof record id and optional configuration
         * @returns RequestedCredentials
         */
        selectCredentialsForRequest(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const proofRecord = yield this.getById(options.proofRecordId);
                const protocol = this.getProtocol(proofRecord.protocolVersion);
                return protocol.selectCredentialsForRequest(this.agentContext, {
                    proofFormats: options.proofFormats,
                    proofRecord,
                });
            });
        }
        /**
         * Get credentials in the wallet for a received proof request.
         *
         * @param options multiple properties like proof record id and optional configuration
         */
        getCredentialsForRequest(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const proofRecord = yield this.getById(options.proofRecordId);
                const protocol = this.getProtocol(proofRecord.protocolVersion);
                return protocol.getCredentialsForRequest(this.agentContext, {
                    proofRecord,
                    proofFormats: options.proofFormats,
                });
            });
        }
        /**
         * Send problem report message for a proof record
         *
         * @param proofRecordId  The id of the proof record for which to send problem report
         * @param message message to send
         * @returns proof record associated with the proof problem report message
         */
        sendProblemReport(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const proofRecord = yield this.getById(options.proofRecordId);
                const protocol = this.getProtocol(proofRecord.protocolVersion);
                const requestMessage = yield protocol.findRequestMessage(this.agentContext, proofRecord.id);
                const { message: problemReport } = yield protocol.createProblemReport(this.agentContext, {
                    proofRecord,
                    description: options.description,
                });
                // Use connection if present
                const connectionRecord = proofRecord.connectionId
                    ? yield this.connectionService.getById(this.agentContext, proofRecord.connectionId)
                    : undefined;
                connectionRecord === null || connectionRecord === void 0 ? void 0 : connectionRecord.assertReady();
                // If there's no connection (so connection-less, we require the state to be request received)
                if (!connectionRecord) {
                    proofRecord.assertState(ProofState_1.ProofState.RequestReceived);
                    if (!requestMessage) {
                        throw new error_1.AriesFrameworkError(`No request message found for proof record with id '${proofRecord.id}'`);
                    }
                }
                const outboundMessageContext = yield (0, getOutboundMessageContext_1.getOutboundMessageContext)(this.agentContext, {
                    message: problemReport,
                    connectionRecord,
                    associatedRecord: proofRecord,
                    lastReceivedMessage: requestMessage !== null && requestMessage !== void 0 ? requestMessage : undefined,
                });
                yield this.messageSender.sendMessage(outboundMessageContext);
                return proofRecord;
            });
        }
        getFormatData(proofRecordId) {
            return __awaiter(this, void 0, void 0, function* () {
                const proofRecord = yield this.getById(proofRecordId);
                const protocol = this.getProtocol(proofRecord.protocolVersion);
                return protocol.getFormatData(this.agentContext, proofRecordId);
            });
        }
        /**
         * Retrieve all proof records
         *
         * @returns List containing all proof records
         */
        getAll() {
            return __awaiter(this, void 0, void 0, function* () {
                return this.proofRepository.getAll(this.agentContext);
            });
        }
        /**
         * Retrieve all proof records by specified query params
         *
         * @returns List containing all proof records matching specified params
         */
        findAllByQuery(query) {
            return this.proofRepository.findByQuery(this.agentContext, query);
        }
        /**
         * Retrieve a proof record by id
         *
         * @param proofRecordId The proof record id
         * @throws {RecordNotFoundError} If no record is found
         * @return The proof record
         *
         */
        getById(proofRecordId) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.proofRepository.getById(this.agentContext, proofRecordId);
            });
        }
        /**
         * Retrieve a proof record by id
         *
         * @param proofRecordId The proof record id
         * @return The proof record or null if not found
         *
         */
        findById(proofRecordId) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield this.proofRepository.findById(this.agentContext, proofRecordId);
            });
        }
        /**
         * Delete a proof record by id
         *
         * @param proofId the proof record id
         */
        deleteById(proofId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const proofRecord = yield this.getById(proofId);
                const protocol = this.getProtocol(proofRecord.protocolVersion);
                return protocol.delete(this.agentContext, proofRecord, options);
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
        getByThreadAndConnectionId(threadId, connectionId) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.proofRepository.getByThreadAndConnectionId(this.agentContext, threadId, connectionId);
            });
        }
        /**
         * Retrieve proof records by connection id and parent thread id
         *
         * @param connectionId The connection id
         * @param parentThreadId The parent thread id
         * @returns List containing all proof records matching the given query
         */
        getByParentThreadAndConnectionId(parentThreadId, connectionId) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.proofRepository.getByParentThreadAndConnectionId(this.agentContext, parentThreadId, connectionId);
            });
        }
        /**
         * Update a proof record by
         *
         * @param proofRecord the proof record
         */
        update(proofRecord) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.proofRepository.update(this.agentContext, proofRecord);
            });
        }
        findProposalMessage(proofRecordId) {
            return __awaiter(this, void 0, void 0, function* () {
                const record = yield this.getById(proofRecordId);
                const protocol = this.getProtocol(record.protocolVersion);
                return protocol.findProposalMessage(this.agentContext, proofRecordId);
            });
        }
        findRequestMessage(proofRecordId) {
            return __awaiter(this, void 0, void 0, function* () {
                const record = yield this.getById(proofRecordId);
                const protocol = this.getProtocol(record.protocolVersion);
                return protocol.findRequestMessage(this.agentContext, proofRecordId);
            });
        }
        findPresentationMessage(proofRecordId) {
            return __awaiter(this, void 0, void 0, function* () {
                const record = yield this.getById(proofRecordId);
                const protocol = this.getProtocol(record.protocolVersion);
                return protocol.findPresentationMessage(this.agentContext, proofRecordId);
            });
        }
    };
    __setFunctionName(_classThis, "ProofsApi");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ProofsApi = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ProofsApi = _classThis;
})();
exports.ProofsApi = ProofsApi;
