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
exports.CredentialsApi = void 0;
const getOutboundMessageContext_1 = require("../../agent/getOutboundMessageContext");
const error_1 = require("../../error");
const plugins_1 = require("../../plugins");
const CredentialState_1 = require("./models/CredentialState");
let CredentialsApi = (() => {
    let _classDecorators = [(0, plugins_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var CredentialsApi = _classThis = class {
        constructor(messageSender, connectionService, agentContext, logger, credentialRepository, mediationRecipientService, didCommMessageRepository, 
        // only injected so the handlers will be registered
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _revocationNotificationService, config) {
            this.messageSender = messageSender;
            this.connectionService = connectionService;
            this.credentialRepository = credentialRepository;
            this.routingService = mediationRecipientService;
            this.agentContext = agentContext;
            this.didCommMessageRepository = didCommMessageRepository;
            this.logger = logger;
            this.config = config;
        }
        getProtocol(protocolVersion) {
            const credentialProtocol = this.config.credentialProtocols.find((protocol) => protocol.version === protocolVersion);
            if (!credentialProtocol) {
                throw new error_1.AriesFrameworkError(`No credential protocol registered for protocol version ${protocolVersion}`);
            }
            return credentialProtocol;
        }
        /**
         * Initiate a new credential exchange as holder by sending a credential proposal message
         * to the connection with the specified connection id.
         *
         * @param options configuration to use for the proposal
         * @returns Credential exchange record associated with the sent proposal message
         */
        proposeCredential(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const protocol = this.getProtocol(options.protocolVersion);
                const connectionRecord = yield this.connectionService.getById(this.agentContext, options.connectionId);
                // Assert
                connectionRecord.assertReady();
                // will get back a credential record -> map to Credential Exchange Record
                const { credentialRecord, message } = yield protocol.createProposal(this.agentContext, {
                    connectionRecord,
                    credentialFormats: options.credentialFormats,
                    comment: options.comment,
                    autoAcceptCredential: options.autoAcceptCredential,
                });
                const outboundMessageContext = yield (0, getOutboundMessageContext_1.getOutboundMessageContext)(this.agentContext, {
                    message,
                    associatedRecord: credentialRecord,
                    connectionRecord,
                });
                yield this.messageSender.sendMessage(outboundMessageContext);
                return credentialRecord;
            });
        }
        /**
         * Accept a credential proposal as issuer (by sending a credential offer message) to the connection
         * associated with the credential record.
         *
         * @param options config object for accepting the proposal
         * @returns Credential exchange record associated with the credential offer
         *
         */
        acceptProposal(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const credentialRecord = yield this.getById(options.credentialRecordId);
                if (!credentialRecord.connectionId) {
                    throw new error_1.AriesFrameworkError(`No connectionId found for credential record '${credentialRecord.id}'. Connection-less issuance does not support credential proposal or negotiation.`);
                }
                // with version we can get the protocol
                const protocol = this.getProtocol(credentialRecord.protocolVersion);
                const connectionRecord = yield this.connectionService.getById(this.agentContext, credentialRecord.connectionId);
                // Assert
                connectionRecord.assertReady();
                // will get back a credential record -> map to Credential Exchange Record
                const { message } = yield protocol.acceptProposal(this.agentContext, {
                    credentialRecord,
                    credentialFormats: options.credentialFormats,
                    comment: options.comment,
                    autoAcceptCredential: options.autoAcceptCredential,
                });
                // send the message
                const outboundMessageContext = yield (0, getOutboundMessageContext_1.getOutboundMessageContext)(this.agentContext, {
                    message,
                    associatedRecord: credentialRecord,
                    connectionRecord,
                });
                yield this.messageSender.sendMessage(outboundMessageContext);
                return credentialRecord;
            });
        }
        /**
         * Negotiate a credential proposal as issuer (by sending a credential offer message) to the connection
         * associated with the credential record.
         *
         * @param options configuration for the offer see {@link NegotiateCredentialProposalOptions}
         * @returns Credential exchange record associated with the credential offer
         *
         */
        negotiateProposal(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const credentialRecord = yield this.getById(options.credentialRecordId);
                if (!credentialRecord.connectionId) {
                    throw new error_1.AriesFrameworkError(`No connection id for credential record ${credentialRecord.id} not found. Connection-less issuance does not support negotiation`);
                }
                // with version we can get the Service
                const protocol = this.getProtocol(credentialRecord.protocolVersion);
                const { message } = yield protocol.negotiateProposal(this.agentContext, {
                    credentialRecord,
                    credentialFormats: options.credentialFormats,
                    comment: options.comment,
                    autoAcceptCredential: options.autoAcceptCredential,
                });
                const connectionRecord = yield this.connectionService.getById(this.agentContext, credentialRecord.connectionId);
                const outboundMessageContext = yield (0, getOutboundMessageContext_1.getOutboundMessageContext)(this.agentContext, {
                    message,
                    associatedRecord: credentialRecord,
                    connectionRecord,
                });
                yield this.messageSender.sendMessage(outboundMessageContext);
                return credentialRecord;
            });
        }
        /**
         * Initiate a new credential exchange as issuer by sending a credential offer message
         * to the connection with the specified connection id.
         *
         * @param options config options for the credential offer
         * @returns Credential exchange record associated with the sent credential offer message
         */
        offerCredential(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const connectionRecord = yield this.connectionService.getById(this.agentContext, options.connectionId);
                const protocol = this.getProtocol(options.protocolVersion);
                this.logger.debug(`Got a credentialProtocol object for version ${options.protocolVersion}`);
                const { message, credentialRecord } = yield protocol.createOffer(this.agentContext, {
                    credentialFormats: options.credentialFormats,
                    autoAcceptCredential: options.autoAcceptCredential,
                    comment: options.comment,
                    connectionRecord,
                });
                this.logger.debug('Offer Message successfully created; message= ', message);
                const outboundMessageContext = yield (0, getOutboundMessageContext_1.getOutboundMessageContext)(this.agentContext, {
                    message,
                    associatedRecord: credentialRecord,
                    connectionRecord,
                });
                yield this.messageSender.sendMessage(outboundMessageContext);
                return credentialRecord;
            });
        }
        /**
         * Accept a credential offer as holder (by sending a credential request message) to the connection
         * associated with the credential record.
         *
         * @param options The object containing config options of the offer to be accepted
         * @returns Object containing offer associated credential record
         */
        acceptOffer(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const credentialRecord = yield this.getById(options.credentialRecordId);
                const protocol = this.getProtocol(credentialRecord.protocolVersion);
                this.logger.debug(`Got a credentialProtocol object for this version; version = ${protocol.version}`);
                const offerMessage = yield protocol.findOfferMessage(this.agentContext, credentialRecord.id);
                if (!offerMessage) {
                    throw new error_1.AriesFrameworkError(`No offer message found for credential record with id '${credentialRecord.id}'`);
                }
                // Use connection if present
                const connectionRecord = credentialRecord.connectionId
                    ? yield this.connectionService.getById(this.agentContext, credentialRecord.connectionId)
                    : undefined;
                connectionRecord === null || connectionRecord === void 0 ? void 0 : connectionRecord.assertReady();
                const { message } = yield protocol.acceptOffer(this.agentContext, {
                    credentialRecord,
                    credentialFormats: options.credentialFormats,
                    comment: options.comment,
                    autoAcceptCredential: options.autoAcceptCredential,
                });
                const outboundMessageContext = yield (0, getOutboundMessageContext_1.getOutboundMessageContext)(this.agentContext, {
                    message,
                    connectionRecord,
                    associatedRecord: credentialRecord,
                    lastReceivedMessage: offerMessage,
                });
                yield this.messageSender.sendMessage(outboundMessageContext);
                return credentialRecord;
            });
        }
        declineOffer(credentialRecordId) {
            return __awaiter(this, void 0, void 0, function* () {
                const credentialRecord = yield this.getById(credentialRecordId);
                credentialRecord.assertState(CredentialState_1.CredentialState.OfferReceived);
                // with version we can get the Service
                const protocol = this.getProtocol(credentialRecord.protocolVersion);
                yield protocol.updateState(this.agentContext, credentialRecord, CredentialState_1.CredentialState.Declined);
                return credentialRecord;
            });
        }
        negotiateOffer(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const credentialRecord = yield this.getById(options.credentialRecordId);
                if (!credentialRecord.connectionId) {
                    throw new error_1.AriesFrameworkError(`No connection id for credential record ${credentialRecord.id} not found. Connection-less issuance does not support negotiation`);
                }
                const connectionRecord = yield this.connectionService.getById(this.agentContext, credentialRecord.connectionId);
                // Assert
                connectionRecord.assertReady();
                const protocol = this.getProtocol(credentialRecord.protocolVersion);
                const { message } = yield protocol.negotiateOffer(this.agentContext, {
                    credentialFormats: options.credentialFormats,
                    credentialRecord,
                    comment: options.comment,
                    autoAcceptCredential: options.autoAcceptCredential,
                });
                const outboundMessageContext = yield (0, getOutboundMessageContext_1.getOutboundMessageContext)(this.agentContext, {
                    message,
                    associatedRecord: credentialRecord,
                    connectionRecord,
                });
                yield this.messageSender.sendMessage(outboundMessageContext);
                return credentialRecord;
            });
        }
        /**
         * Initiate a new credential exchange as issuer by creating a credential offer
         * not bound to any connection. The offer must be delivered out-of-band to the holder
         * @param options The credential options to use for the offer
         * @returns The credential record and credential offer message
         */
        createOffer(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const protocol = this.getProtocol(options.protocolVersion);
                this.logger.debug(`Got a credentialProtocol object for version ${options.protocolVersion}`);
                const { message, credentialRecord } = yield protocol.createOffer(this.agentContext, {
                    credentialFormats: options.credentialFormats,
                    comment: options.comment,
                    autoAcceptCredential: options.autoAcceptCredential,
                });
                this.logger.debug('Offer Message successfully created', { message });
                return { message, credentialRecord };
            });
        }
        /**
         * Accept a credential request as holder (by sending a credential request message) to the connection
         * associated with the credential record.
         *
         * @param options The object containing config options of the request
         * @returns CredentialExchangeRecord updated with information pertaining to this request
         */
        acceptRequest(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const credentialRecord = yield this.getById(options.credentialRecordId);
                // with version we can get the Service
                const protocol = this.getProtocol(credentialRecord.protocolVersion);
                this.logger.debug(`Got a credentialProtocol object for version ${credentialRecord.protocolVersion}`);
                // Use connection if present
                const connectionRecord = credentialRecord.connectionId
                    ? yield this.connectionService.getById(this.agentContext, credentialRecord.connectionId)
                    : undefined;
                connectionRecord === null || connectionRecord === void 0 ? void 0 : connectionRecord.assertReady();
                const requestMessage = yield protocol.findRequestMessage(this.agentContext, credentialRecord.id);
                if (!requestMessage) {
                    throw new error_1.AriesFrameworkError(`No request message found for credential record with id '${credentialRecord.id}'`);
                }
                const offerMessage = yield protocol.findOfferMessage(this.agentContext, credentialRecord.id);
                if (!offerMessage) {
                    throw new error_1.AriesFrameworkError(`No offer message found for proof record with id '${credentialRecord.id}'`);
                }
                const { message } = yield protocol.acceptRequest(this.agentContext, {
                    credentialRecord,
                    credentialFormats: options.credentialFormats,
                    comment: options.comment,
                    autoAcceptCredential: options.autoAcceptCredential,
                });
                this.logger.debug('We have a credential message (sending outbound): ', message);
                const outboundMessageContext = yield (0, getOutboundMessageContext_1.getOutboundMessageContext)(this.agentContext, {
                    message,
                    connectionRecord,
                    associatedRecord: credentialRecord,
                    lastReceivedMessage: requestMessage,
                    lastSentMessage: offerMessage,
                });
                yield this.messageSender.sendMessage(outboundMessageContext);
                return credentialRecord;
            });
        }
        /**
         * Accept a credential as holder (by sending a credential acknowledgement message) to the connection
         * associated with the credential record.
         *
         * @param credentialRecordId The id of the credential record for which to accept the credential
         * @returns credential exchange record associated with the sent credential acknowledgement message
         *
         */
        acceptCredential(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const credentialRecord = yield this.getById(options.credentialRecordId);
                // with version we can get the Service
                const protocol = this.getProtocol(credentialRecord.protocolVersion);
                this.logger.debug(`Got a credentialProtocol object for version ${credentialRecord.protocolVersion}`);
                // Use connection if present
                const connectionRecord = credentialRecord.connectionId
                    ? yield this.connectionService.getById(this.agentContext, credentialRecord.connectionId)
                    : undefined;
                connectionRecord === null || connectionRecord === void 0 ? void 0 : connectionRecord.assertReady();
                const requestMessage = yield protocol.findRequestMessage(this.agentContext, credentialRecord.id);
                if (!requestMessage) {
                    throw new error_1.AriesFrameworkError(`No request message found for credential record with id '${credentialRecord.id}'`);
                }
                const credentialMessage = yield protocol.findCredentialMessage(this.agentContext, credentialRecord.id);
                if (!credentialMessage) {
                    throw new error_1.AriesFrameworkError(`No credential message found for credential record with id '${credentialRecord.id}'`);
                }
                const { message } = yield protocol.acceptCredential(this.agentContext, {
                    credentialRecord,
                });
                const outboundMessageContext = yield (0, getOutboundMessageContext_1.getOutboundMessageContext)(this.agentContext, {
                    message,
                    connectionRecord,
                    associatedRecord: credentialRecord,
                    lastReceivedMessage: credentialMessage,
                });
                yield this.messageSender.sendMessage(outboundMessageContext);
                return credentialRecord;
            });
        }
        /**
         * Send problem report message for a credential record
         * @param credentialRecordId The id of the credential record for which to send problem report
         * @param message message to send
         * @returns credential record associated with the credential problem report message
         */
        sendProblemReport(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const credentialRecord = yield this.getById(options.credentialRecordId);
                if (!credentialRecord.connectionId) {
                    throw new error_1.AriesFrameworkError(`No connectionId found for credential record '${credentialRecord.id}'.`);
                }
                const connectionRecord = yield this.connectionService.getById(this.agentContext, credentialRecord.connectionId);
                const protocol = this.getProtocol(credentialRecord.protocolVersion);
                const { message } = yield protocol.createProblemReport(this.agentContext, {
                    description: options.description,
                    credentialRecord,
                });
                message.setThread({
                    threadId: credentialRecord.threadId,
                    parentThreadId: credentialRecord.parentThreadId,
                });
                const outboundMessageContext = yield (0, getOutboundMessageContext_1.getOutboundMessageContext)(this.agentContext, {
                    message,
                    associatedRecord: credentialRecord,
                    connectionRecord,
                });
                yield this.messageSender.sendMessage(outboundMessageContext);
                return credentialRecord;
            });
        }
        getFormatData(credentialRecordId) {
            return __awaiter(this, void 0, void 0, function* () {
                const credentialRecord = yield this.getById(credentialRecordId);
                const protocol = this.getProtocol(credentialRecord.protocolVersion);
                return protocol.getFormatData(this.agentContext, credentialRecordId);
            });
        }
        /**
         * Retrieve a credential record by id
         *
         * @param credentialRecordId The credential record id
         * @throws {RecordNotFoundError} If no record is found
         * @return The credential record
         *
         */
        getById(credentialRecordId) {
            return this.credentialRepository.getById(this.agentContext, credentialRecordId);
        }
        /**
         * Retrieve all credential records
         *
         * @returns List containing all credential records
         */
        getAll() {
            return this.credentialRepository.getAll(this.agentContext);
        }
        /**
         * Retrieve all credential records by specified query params
         *
         * @returns List containing all credential records matching specified query paramaters
         */
        findAllByQuery(query) {
            return this.credentialRepository.findByQuery(this.agentContext, query);
        }
        /**
         * Find a credential record by id
         *
         * @param credentialRecordId the credential record id
         * @returns The credential record or null if not found
         */
        findById(credentialRecordId) {
            return this.credentialRepository.findById(this.agentContext, credentialRecordId);
        }
        /**
         * Delete a credential record by id, also calls service to delete from wallet
         *
         * @param credentialId the credential record id
         * @param options the delete credential options for the delete operation
         */
        deleteById(credentialId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const credentialRecord = yield this.getById(credentialId);
                const protocol = this.getProtocol(credentialRecord.protocolVersion);
                return protocol.delete(this.agentContext, credentialRecord, options);
            });
        }
        /**
         * Update a credential exchange record
         *
         * @param credentialRecord the credential exchange record
         */
        update(credentialRecord) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.credentialRepository.update(this.agentContext, credentialRecord);
            });
        }
        findProposalMessage(credentialExchangeId) {
            return __awaiter(this, void 0, void 0, function* () {
                const protocol = yield this.getServiceForCredentialExchangeId(credentialExchangeId);
                return protocol.findProposalMessage(this.agentContext, credentialExchangeId);
            });
        }
        findOfferMessage(credentialExchangeId) {
            return __awaiter(this, void 0, void 0, function* () {
                const protocol = yield this.getServiceForCredentialExchangeId(credentialExchangeId);
                return protocol.findOfferMessage(this.agentContext, credentialExchangeId);
            });
        }
        findRequestMessage(credentialExchangeId) {
            return __awaiter(this, void 0, void 0, function* () {
                const protocol = yield this.getServiceForCredentialExchangeId(credentialExchangeId);
                return protocol.findRequestMessage(this.agentContext, credentialExchangeId);
            });
        }
        findCredentialMessage(credentialExchangeId) {
            return __awaiter(this, void 0, void 0, function* () {
                const protocol = yield this.getServiceForCredentialExchangeId(credentialExchangeId);
                return protocol.findCredentialMessage(this.agentContext, credentialExchangeId);
            });
        }
        getServiceForCredentialExchangeId(credentialExchangeId) {
            return __awaiter(this, void 0, void 0, function* () {
                const credentialExchangeRecord = yield this.getById(credentialExchangeId);
                return this.getProtocol(credentialExchangeRecord.protocolVersion);
            });
        }
    };
    __setFunctionName(_classThis, "CredentialsApi");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CredentialsApi = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CredentialsApi = _classThis;
})();
exports.CredentialsApi = CredentialsApi;
