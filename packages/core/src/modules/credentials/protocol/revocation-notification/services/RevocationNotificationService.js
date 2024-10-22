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
exports.RevocationNotificationService = void 0;
const AriesFrameworkError_1 = require("../../../../../error/AriesFrameworkError");
const plugins_1 = require("../../../../../plugins");
const CredentialEvents_1 = require("../../../CredentialEvents");
const RevocationNotification_1 = require("../../../models/RevocationNotification");
const handlers_1 = require("../handlers");
const revocationIdentifier_1 = require("../util/revocationIdentifier");
let RevocationNotificationService = (() => {
    let _classDecorators = [(0, plugins_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var RevocationNotificationService = _classThis = class {
        constructor(credentialRepository, eventEmitter, messageHandlerRegistry, logger) {
            this.credentialRepository = credentialRepository;
            this.eventEmitter = eventEmitter;
            this.logger = logger;
            this.registerMessageHandlers(messageHandlerRegistry);
        }
        processRevocationNotification(agentContext, anonCredsRevocationRegistryId, anonCredsCredentialRevocationId, connection, comment) {
            return __awaiter(this, void 0, void 0, function* () {
                // TODO: can we extract support for this revocation notification handler to the anoncreds module?
                const query = { anonCredsRevocationRegistryId, anonCredsCredentialRevocationId, connectionId: connection.id };
                this.logger.trace(`Getting record by query for revocation notification:`, query);
                const credentialRecord = yield this.credentialRepository.getSingleByQuery(agentContext, query);
                credentialRecord.revocationNotification = new RevocationNotification_1.RevocationNotification(comment);
                yield this.credentialRepository.update(agentContext, credentialRecord);
                this.logger.trace('Emitting RevocationNotificationReceivedEvent');
                this.eventEmitter.emit(agentContext, {
                    type: CredentialEvents_1.CredentialEventTypes.RevocationNotificationReceived,
                    payload: {
                        // Clone record to prevent mutations after emitting event.
                        credentialRecord: credentialRecord.clone(),
                    },
                });
            });
        }
        /**
         * Process a received {@link V1RevocationNotificationMessage}. This will create a
         * {@link RevocationNotification} and store it in the corresponding {@link CredentialRecord}
         *
         * @param messageContext message context of RevocationNotificationMessageV1
         */
        v1ProcessRevocationNotification(messageContext) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.info('Processing revocation notification v1', { message: messageContext.message });
                // ThreadID = indy::<revocation_registry_id>::<credential_revocation_id>
                const threadId = messageContext.message.issueThread;
                try {
                    const threadIdGroups = threadId.match(revocationIdentifier_1.v1ThreadRegex);
                    if (!threadIdGroups) {
                        throw new AriesFrameworkError_1.AriesFrameworkError(`Incorrect revocation notification threadId format: \n${threadId}\ndoes not match\n"indy::<revocation_registry_id>::<credential_revocation_id>"`);
                    }
                    const [, , anonCredsRevocationRegistryId, anonCredsCredentialRevocationId] = threadIdGroups;
                    const comment = messageContext.message.comment;
                    const connection = messageContext.assertReadyConnection();
                    yield this.processRevocationNotification(messageContext.agentContext, anonCredsRevocationRegistryId, anonCredsCredentialRevocationId, connection, comment);
                }
                catch (error) {
                    this.logger.warn('Failed to process revocation notification message', { error, threadId });
                }
            });
        }
        /**
         * Process a received {@link V2RevocationNotificationMessage}. This will create a
         * {@link RevocationNotification} and store it in the corresponding {@link CredentialRecord}
         *
         * @param messageContext message context of RevocationNotificationMessageV2
         */
        v2ProcessRevocationNotification(messageContext) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger.info('Processing revocation notification v2', { message: messageContext.message });
                const credentialId = messageContext.message.credentialId;
                if (messageContext.message.revocationFormat !== revocationIdentifier_1.v2IndyRevocationFormat) {
                    throw new AriesFrameworkError_1.AriesFrameworkError(`Unknown revocation format: ${messageContext.message.revocationFormat}. Supported formats are indy-anoncreds`);
                }
                try {
                    const credentialIdGroups = credentialId.match(revocationIdentifier_1.v2IndyRevocationIdentifierRegex);
                    if (!credentialIdGroups) {
                        throw new AriesFrameworkError_1.AriesFrameworkError(`Incorrect revocation notification credentialId format: \n${credentialId}\ndoes not match\n"<revocation_registry_id>::<credential_revocation_id>"`);
                    }
                    const [, anonCredsRevocationRegistryId, anonCredsCredentialRevocationId] = credentialIdGroups;
                    const comment = messageContext.message.comment;
                    const connection = messageContext.assertReadyConnection();
                    yield this.processRevocationNotification(messageContext.agentContext, anonCredsRevocationRegistryId, anonCredsCredentialRevocationId, connection, comment);
                }
                catch (error) {
                    this.logger.warn('Failed to process revocation notification message', { error, credentialId });
                }
            });
        }
        registerMessageHandlers(messageHandlerRegistry) {
            messageHandlerRegistry.registerMessageHandler(new handlers_1.V1RevocationNotificationHandler(this));
            messageHandlerRegistry.registerMessageHandler(new handlers_1.V2RevocationNotificationHandler(this));
        }
    };
    __setFunctionName(_classThis, "RevocationNotificationService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RevocationNotificationService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RevocationNotificationService = _classThis;
})();
exports.RevocationNotificationService = RevocationNotificationService;
