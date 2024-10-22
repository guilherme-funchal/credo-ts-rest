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
exports.OutOfBandService = void 0;
const error_1 = require("../../error");
const plugins_1 = require("../../plugins");
const dids_1 = require("../dids");
const parse_1 = require("../dids/domain/parse");
const OutOfBandEvents_1 = require("./domain/OutOfBandEvents");
const OutOfBandRole_1 = require("./domain/OutOfBandRole");
const OutOfBandState_1 = require("./domain/OutOfBandState");
const messages_1 = require("./messages");
const HandshakeReuseAcceptedMessage_1 = require("./messages/HandshakeReuseAcceptedMessage");
const repository_1 = require("./repository");
let OutOfBandService = (() => {
    let _classDecorators = [(0, plugins_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var OutOfBandService = _classThis = class {
        constructor(outOfBandRepository, eventEmitter, didCommDocumentService) {
            this.outOfBandRepository = outOfBandRepository;
            this.eventEmitter = eventEmitter;
            this.didCommDocumentService = didCommDocumentService;
        }
        /**
         * Creates an Out of Band record from a Connection/DIDExchange request started by using
         * a publicly resolvable DID this agent can control
         */
        createFromImplicitInvitation(agentContext, config) {
            return __awaiter(this, void 0, void 0, function* () {
                const { did, threadId, handshakeProtocols, autoAcceptConnection, recipientKey } = config;
                // Verify it is a valid did and it is present in the wallet
                const publicDid = (0, parse_1.parseDid)(did);
                const didsApi = agentContext.dependencyManager.resolve(dids_1.DidsApi);
                const [createdDid] = yield didsApi.getCreatedDids({ did: publicDid.did });
                if (!createdDid) {
                    throw new error_1.AriesFrameworkError(`Referenced public did ${did} not found.`);
                }
                // Recreate an 'implicit invitation' matching the parameters used by the invitee when
                // initiating the flow
                const outOfBandInvitation = new messages_1.OutOfBandInvitation({
                    id: did,
                    label: '',
                    services: [did],
                    handshakeProtocols,
                });
                outOfBandInvitation.setThread({ threadId });
                const outOfBandRecord = new repository_1.OutOfBandRecord({
                    role: OutOfBandRole_1.OutOfBandRole.Sender,
                    state: OutOfBandState_1.OutOfBandState.AwaitResponse,
                    reusable: true,
                    autoAcceptConnection: autoAcceptConnection !== null && autoAcceptConnection !== void 0 ? autoAcceptConnection : false,
                    outOfBandInvitation,
                    tags: {
                        recipientKeyFingerprints: [recipientKey.fingerprint],
                    },
                });
                yield this.save(agentContext, outOfBandRecord);
                this.emitStateChangedEvent(agentContext, outOfBandRecord, null);
                return outOfBandRecord;
            });
        }
        processHandshakeReuse(messageContext) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c;
                const reuseMessage = messageContext.message;
                const parentThreadId = (_a = reuseMessage.thread) === null || _a === void 0 ? void 0 : _a.parentThreadId;
                if (!parentThreadId) {
                    throw new error_1.AriesFrameworkError('handshake-reuse message must have a parent thread id');
                }
                const outOfBandRecord = yield this.findByCreatedInvitationId(messageContext.agentContext, parentThreadId);
                if (!outOfBandRecord) {
                    throw new error_1.AriesFrameworkError('No out of band record found for handshake-reuse message');
                }
                // Assert
                outOfBandRecord.assertRole(OutOfBandRole_1.OutOfBandRole.Sender);
                outOfBandRecord.assertState(OutOfBandState_1.OutOfBandState.AwaitResponse);
                const requestLength = (_c = (_b = outOfBandRecord.outOfBandInvitation.getRequests()) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0;
                if (requestLength > 0) {
                    throw new error_1.AriesFrameworkError('Handshake reuse should only be used when no requests are present');
                }
                const reusedConnection = messageContext.assertReadyConnection();
                this.eventEmitter.emit(messageContext.agentContext, {
                    type: OutOfBandEvents_1.OutOfBandEventTypes.HandshakeReused,
                    payload: {
                        reuseThreadId: reuseMessage.threadId,
                        connectionRecord: reusedConnection,
                        outOfBandRecord,
                    },
                });
                // If the out of band record is not reusable we can set the state to done
                if (!outOfBandRecord.reusable) {
                    yield this.updateState(messageContext.agentContext, outOfBandRecord, OutOfBandState_1.OutOfBandState.Done);
                }
                const reuseAcceptedMessage = new HandshakeReuseAcceptedMessage_1.HandshakeReuseAcceptedMessage({
                    threadId: reuseMessage.threadId,
                    parentThreadId,
                });
                return reuseAcceptedMessage;
            });
        }
        processHandshakeReuseAccepted(messageContext) {
            return __awaiter(this, void 0, void 0, function* () {
                var _a;
                const reuseAcceptedMessage = messageContext.message;
                const parentThreadId = (_a = reuseAcceptedMessage.thread) === null || _a === void 0 ? void 0 : _a.parentThreadId;
                if (!parentThreadId) {
                    throw new error_1.AriesFrameworkError('handshake-reuse-accepted message must have a parent thread id');
                }
                const outOfBandRecord = yield this.findByReceivedInvitationId(messageContext.agentContext, parentThreadId);
                if (!outOfBandRecord) {
                    throw new error_1.AriesFrameworkError('No out of band record found for handshake-reuse-accepted message');
                }
                // Assert
                outOfBandRecord.assertRole(OutOfBandRole_1.OutOfBandRole.Receiver);
                outOfBandRecord.assertState(OutOfBandState_1.OutOfBandState.PrepareResponse);
                const reusedConnection = messageContext.assertReadyConnection();
                // Checks whether the connection associated with reuse accepted message matches with the connection
                // associated with the reuse message.
                // FIXME: not really a fan of the reuseConnectionId, but it's the only way I can think of now to get the connection
                // associated with the reuse message. Maybe we can at least move it to the metadata and remove it directly afterwards?
                // But this is an issue in general that has also come up for ACA-Py. How do I find the connection associated with an oob record?
                // Because it doesn't work really well with connection reuse.
                if (outOfBandRecord.reuseConnectionId !== reusedConnection.id) {
                    throw new error_1.AriesFrameworkError('handshake-reuse-accepted is not in response to a handshake-reuse message.');
                }
                this.eventEmitter.emit(messageContext.agentContext, {
                    type: OutOfBandEvents_1.OutOfBandEventTypes.HandshakeReused,
                    payload: {
                        reuseThreadId: reuseAcceptedMessage.threadId,
                        connectionRecord: reusedConnection,
                        outOfBandRecord,
                    },
                });
                // receiver role is never reusable, so we can set the state to done
                yield this.updateState(messageContext.agentContext, outOfBandRecord, OutOfBandState_1.OutOfBandState.Done);
            });
        }
        createHandShakeReuse(agentContext, outOfBandRecord, connectionRecord) {
            return __awaiter(this, void 0, void 0, function* () {
                const reuseMessage = new messages_1.HandshakeReuseMessage({ parentThreadId: outOfBandRecord.outOfBandInvitation.id });
                // Store the reuse connection id
                outOfBandRecord.reuseConnectionId = connectionRecord.id;
                yield this.outOfBandRepository.update(agentContext, outOfBandRecord);
                return reuseMessage;
            });
        }
        save(agentContext, outOfBandRecord) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.outOfBandRepository.save(agentContext, outOfBandRecord);
            });
        }
        updateState(agentContext, outOfBandRecord, newState) {
            return __awaiter(this, void 0, void 0, function* () {
                const previousState = outOfBandRecord.state;
                outOfBandRecord.state = newState;
                yield this.outOfBandRepository.update(agentContext, outOfBandRecord);
                this.emitStateChangedEvent(agentContext, outOfBandRecord, previousState);
            });
        }
        emitStateChangedEvent(agentContext, outOfBandRecord, previousState) {
            this.eventEmitter.emit(agentContext, {
                type: OutOfBandEvents_1.OutOfBandEventTypes.OutOfBandStateChanged,
                payload: {
                    outOfBandRecord: outOfBandRecord.clone(),
                    previousState,
                },
            });
        }
        findById(agentContext, outOfBandRecordId) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.outOfBandRepository.findById(agentContext, outOfBandRecordId);
            });
        }
        getById(agentContext, outOfBandRecordId) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.outOfBandRepository.getById(agentContext, outOfBandRecordId);
            });
        }
        findByReceivedInvitationId(agentContext, receivedInvitationId) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.outOfBandRepository.findSingleByQuery(agentContext, {
                    invitationId: receivedInvitationId,
                    role: OutOfBandRole_1.OutOfBandRole.Receiver,
                });
            });
        }
        findByCreatedInvitationId(agentContext, createdInvitationId, threadId) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.outOfBandRepository.findSingleByQuery(agentContext, {
                    invitationId: createdInvitationId,
                    role: OutOfBandRole_1.OutOfBandRole.Sender,
                    threadId,
                });
            });
        }
        findCreatedByRecipientKey(agentContext, recipientKey) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.outOfBandRepository.findSingleByQuery(agentContext, {
                    recipientKeyFingerprints: [recipientKey.fingerprint],
                    role: OutOfBandRole_1.OutOfBandRole.Sender,
                });
            });
        }
        getAll(agentContext) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.outOfBandRepository.getAll(agentContext);
            });
        }
        findAllByQuery(agentContext, query) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.outOfBandRepository.findByQuery(agentContext, query);
            });
        }
        deleteById(agentContext, outOfBandId) {
            return __awaiter(this, void 0, void 0, function* () {
                const outOfBandRecord = yield this.getById(agentContext, outOfBandId);
                return this.outOfBandRepository.delete(agentContext, outOfBandRecord);
            });
        }
        /**
         * Extract a resolved didcomm service from an out of band invitation.
         *
         * Currently the first service that can be resolved is returned.
         */
        getResolvedServiceForOutOfBandServices(agentContext, services) {
            return __awaiter(this, void 0, void 0, function* () {
                for (const service of services) {
                    if (typeof service === 'string') {
                        const [didService] = yield this.didCommDocumentService.resolveServicesFromDid(agentContext, service);
                        if (didService)
                            return didService;
                    }
                    else {
                        return service.resolvedDidCommService;
                    }
                }
                throw new error_1.AriesFrameworkError('Could not extract a service from the out of band invitation.');
            });
        }
    };
    __setFunctionName(_classThis, "OutOfBandService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        OutOfBandService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return OutOfBandService = _classThis;
})();
exports.OutOfBandService = OutOfBandService;
