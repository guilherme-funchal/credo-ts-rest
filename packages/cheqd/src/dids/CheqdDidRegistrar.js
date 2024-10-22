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
exports.CheqdDidRegistrar = void 0;
const core_1 = require("@aries-framework/core");
const sdk_1 = require("@cheqd/sdk");
const v2_1 = require("@cheqd/ts-proto/cheqd/resource/v2");
const ledger_1 = require("../ledger");
const didCheqdUtil_1 = require("./didCheqdUtil");
class CheqdDidRegistrar {
    constructor() {
        this.supportedMethods = ['cheqd'];
    }
    create(agentContext, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const didRepository = agentContext.dependencyManager.resolve(core_1.DidRepository);
            const cheqdLedgerService = agentContext.dependencyManager.resolve(ledger_1.CheqdLedgerService);
            const { methodSpecificIdAlgo, network, versionId = core_1.utils.uuid() } = options.options;
            const verificationMethod = (_a = options.secret) === null || _a === void 0 ? void 0 : _a.verificationMethod;
            let didDocument;
            try {
                if (options.didDocument && (0, didCheqdUtil_1.validateSpecCompliantPayload)(options.didDocument)) {
                    didDocument = options.didDocument;
                }
                else if (verificationMethod) {
                    const privateKey = verificationMethod.privateKey;
                    if (privateKey && !(0, core_1.isValidPrivateKey)(privateKey, core_1.KeyType.Ed25519)) {
                        return {
                            didDocumentMetadata: {},
                            didRegistrationMetadata: {},
                            didState: {
                                state: 'failed',
                                reason: 'Invalid private key provided',
                            },
                        };
                    }
                    const key = yield agentContext.wallet.createKey({
                        keyType: core_1.KeyType.Ed25519,
                        privateKey: privateKey,
                    });
                    didDocument = (0, didCheqdUtil_1.generateDidDoc)({
                        verificationMethod: verificationMethod.type,
                        verificationMethodId: verificationMethod.id || 'key-1',
                        methodSpecificIdAlgo: methodSpecificIdAlgo || sdk_1.MethodSpecificIdAlgo.Uuid,
                        network: network,
                        publicKey: core_1.TypedArrayEncoder.toHex(key.publicKey),
                    });
                    const contextMapping = {
                        Ed25519VerificationKey2018: 'https://w3id.org/security/suites/ed25519-2018/v1',
                        Ed25519VerificationKey2020: 'https://w3id.org/security/suites/ed25519-2020/v1',
                        JsonWebKey2020: 'https://w3id.org/security/suites/jws-2020/v1',
                    };
                    const contextUrl = contextMapping[verificationMethod.type];
                    // Add the context to the did document
                    // NOTE: cheqd sdk uses https://www.w3.org/ns/did/v1 while AFJ did doc uses https://w3id.org/did/v1
                    // We should align these at some point. For now we just return a consistent value.
                    didDocument.context = ['https://www.w3.org/ns/did/v1', contextUrl];
                }
                else {
                    return {
                        didDocumentMetadata: {},
                        didRegistrationMetadata: {},
                        didState: {
                            state: 'failed',
                            reason: 'Provide a didDocument or at least one verificationMethod with seed in secret',
                        },
                    };
                }
                const didDocumentJson = didDocument.toJSON();
                const payloadToSign = yield (0, didCheqdUtil_1.createMsgCreateDidDocPayloadToSign)(didDocumentJson, versionId);
                const signInputs = yield this.signPayload(agentContext, payloadToSign, didDocument.verificationMethod);
                const response = yield cheqdLedgerService.create(didDocumentJson, signInputs, versionId);
                if (response.code !== 0) {
                    throw new Error(`${response.rawLog}`);
                }
                // Save the did so we know we created it and can issue with it
                const didRecord = new core_1.DidRecord({
                    did: didDocument.id,
                    role: core_1.DidDocumentRole.Created,
                    didDocument,
                });
                yield didRepository.save(agentContext, didRecord);
                return {
                    didDocumentMetadata: {},
                    didRegistrationMetadata: {},
                    didState: {
                        state: 'finished',
                        did: didDocument.id,
                        didDocument,
                        secret: options.secret,
                    },
                };
            }
            catch (error) {
                agentContext.config.logger.error(`Error registering DID`, error);
                return {
                    didDocumentMetadata: {},
                    didRegistrationMetadata: {},
                    didState: {
                        state: 'failed',
                        reason: `unknownError: ${error.message}`,
                    },
                };
            }
        });
    }
    update(agentContext, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const didRepository = agentContext.dependencyManager.resolve(core_1.DidRepository);
            const cheqdLedgerService = agentContext.dependencyManager.resolve(ledger_1.CheqdLedgerService);
            const versionId = ((_a = options.options) === null || _a === void 0 ? void 0 : _a.versionId) || core_1.utils.uuid();
            const verificationMethod = (_b = options.secret) === null || _b === void 0 ? void 0 : _b.verificationMethod;
            let didDocument;
            let didRecord;
            try {
                if (options.didDocument && (0, didCheqdUtil_1.validateSpecCompliantPayload)(options.didDocument)) {
                    didDocument = options.didDocument;
                    const resolvedDocument = yield cheqdLedgerService.resolve(didDocument.id);
                    didRecord = yield didRepository.findCreatedDid(agentContext, didDocument.id);
                    if (!resolvedDocument.didDocument || resolvedDocument.didDocumentMetadata.deactivated || !didRecord) {
                        return {
                            didDocumentMetadata: {},
                            didRegistrationMetadata: {},
                            didState: {
                                state: 'failed',
                                reason: 'Did not found',
                            },
                        };
                    }
                    if (verificationMethod) {
                        const privateKey = verificationMethod.privateKey;
                        if (privateKey && !(0, core_1.isValidPrivateKey)(privateKey, core_1.KeyType.Ed25519)) {
                            return {
                                didDocumentMetadata: {},
                                didRegistrationMetadata: {},
                                didState: {
                                    state: 'failed',
                                    reason: 'Invalid private key provided',
                                },
                            };
                        }
                        const key = yield agentContext.wallet.createKey({
                            keyType: core_1.KeyType.Ed25519,
                            privateKey: privateKey,
                        });
                        (_c = didDocument.verificationMethod) === null || _c === void 0 ? void 0 : _c.concat(core_1.JsonTransformer.fromJSON((0, sdk_1.createDidVerificationMethod)([verificationMethod.type], [
                            {
                                methodSpecificId: didDocument.id.split(':')[3],
                                didUrl: didDocument.id,
                                keyId: `${didDocument.id}#${verificationMethod.id}`,
                                publicKey: core_1.TypedArrayEncoder.toHex(key.publicKey),
                            },
                        ]), core_1.VerificationMethod));
                    }
                }
                else {
                    return {
                        didDocumentMetadata: {},
                        didRegistrationMetadata: {},
                        didState: {
                            state: 'failed',
                            reason: 'Provide a valid didDocument',
                        },
                    };
                }
                const payloadToSign = yield (0, didCheqdUtil_1.createMsgCreateDidDocPayloadToSign)(didDocument, versionId);
                const signInputs = yield this.signPayload(agentContext, payloadToSign, didDocument.verificationMethod);
                const response = yield cheqdLedgerService.update(didDocument, signInputs, versionId);
                if (response.code !== 0) {
                    throw new Error(`${response.rawLog}`);
                }
                // Save the did so we know we created it and can issue with it
                didRecord.didDocument = didDocument;
                yield didRepository.update(agentContext, didRecord);
                return {
                    didDocumentMetadata: {},
                    didRegistrationMetadata: {},
                    didState: {
                        state: 'finished',
                        did: didDocument.id,
                        didDocument,
                        secret: options.secret,
                    },
                };
            }
            catch (error) {
                agentContext.config.logger.error(`Error updating DID`, error);
                return {
                    didDocumentMetadata: {},
                    didRegistrationMetadata: {},
                    didState: {
                        state: 'failed',
                        reason: `unknownError: ${error.message}`,
                    },
                };
            }
        });
    }
    deactivate(agentContext, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const didRepository = agentContext.dependencyManager.resolve(core_1.DidRepository);
            const cheqdLedgerService = agentContext.dependencyManager.resolve(ledger_1.CheqdLedgerService);
            const did = options.did;
            const versionId = ((_a = options.options) === null || _a === void 0 ? void 0 : _a.versionId) || core_1.utils.uuid();
            try {
                const { didDocument, didDocumentMetadata } = yield cheqdLedgerService.resolve(did);
                const didRecord = yield didRepository.findCreatedDid(agentContext, did);
                if (!didDocument || didDocumentMetadata.deactivated || !didRecord) {
                    return {
                        didDocumentMetadata: {},
                        didRegistrationMetadata: {},
                        didState: {
                            state: 'failed',
                            reason: 'Did not found',
                        },
                    };
                }
                const payloadToSign = (0, didCheqdUtil_1.createMsgDeactivateDidDocPayloadToSign)(didDocument, versionId);
                const didDocumentInstance = core_1.JsonTransformer.fromJSON(didDocument, core_1.DidDocument);
                const signInputs = yield this.signPayload(agentContext, payloadToSign, didDocumentInstance.verificationMethod);
                const response = yield cheqdLedgerService.deactivate(didDocument, signInputs, versionId);
                if (response.code !== 0) {
                    throw new Error(`${response.rawLog}`);
                }
                yield didRepository.update(agentContext, didRecord);
                return {
                    didDocumentMetadata: {},
                    didRegistrationMetadata: {},
                    didState: {
                        state: 'finished',
                        did: didDocument.id,
                        didDocument: core_1.JsonTransformer.fromJSON(didDocument, core_1.DidDocument),
                        secret: options.secret,
                    },
                };
            }
            catch (error) {
                agentContext.config.logger.error(`Error deactivating DID`, error);
                return {
                    didDocumentMetadata: {},
                    didRegistrationMetadata: {},
                    didState: {
                        state: 'failed',
                        reason: `unknownError: ${error.message}`,
                    },
                };
            }
        });
    }
    createResource(agentContext, did, resource) {
        return __awaiter(this, void 0, void 0, function* () {
            const didRepository = agentContext.dependencyManager.resolve(core_1.DidRepository);
            const cheqdLedgerService = agentContext.dependencyManager.resolve(ledger_1.CheqdLedgerService);
            const { didDocument, didDocumentMetadata } = yield cheqdLedgerService.resolve(did);
            const didRecord = yield didRepository.findCreatedDid(agentContext, did);
            if (!didDocument || didDocumentMetadata.deactivated || !didRecord) {
                return {
                    resourceMetadata: {},
                    resourceRegistrationMetadata: {},
                    resourceState: {
                        state: 'failed',
                        reason: `DID: ${did} not found`,
                    },
                };
            }
            try {
                let data;
                if (typeof resource.data === 'string') {
                    data = core_1.TypedArrayEncoder.fromBase64(resource.data);
                }
                else if (typeof resource.data == 'object') {
                    data = core_1.TypedArrayEncoder.fromString(JSON.stringify(resource.data));
                }
                else {
                    data = resource.data;
                }
                const resourcePayload = v2_1.MsgCreateResourcePayload.fromPartial({
                    collectionId: did.split(':')[3],
                    id: resource.id,
                    resourceType: resource.resourceType,
                    name: resource.name,
                    version: resource.version,
                    alsoKnownAs: resource.alsoKnownAs,
                    data,
                });
                const payloadToSign = v2_1.MsgCreateResourcePayload.encode(resourcePayload).finish();
                const didDocumentInstance = core_1.JsonTransformer.fromJSON(didDocument, core_1.DidDocument);
                const signInputs = yield this.signPayload(agentContext, payloadToSign, didDocumentInstance.verificationMethod);
                const response = yield cheqdLedgerService.createResource(did, resourcePayload, signInputs);
                if (response.code !== 0) {
                    throw new Error(`${response.rawLog}`);
                }
                return {
                    resourceMetadata: {},
                    resourceRegistrationMetadata: {},
                    resourceState: {
                        state: 'finished',
                        resourceId: resourcePayload.id,
                        resource: resourcePayload,
                    },
                };
            }
            catch (error) {
                return {
                    resourceMetadata: {},
                    resourceRegistrationMetadata: {},
                    resourceState: {
                        state: 'failed',
                        reason: `unknownError: ${error.message}`,
                    },
                };
            }
        });
    }
    signPayload(agentContext_1, payload_1) {
        return __awaiter(this, arguments, void 0, function* (agentContext, payload, verificationMethod = []) {
            return yield Promise.all(verificationMethod.map((method) => __awaiter(this, void 0, void 0, function* () {
                const key = (0, core_1.getKeyFromVerificationMethod)(method);
                return {
                    verificationMethodId: method.id,
                    signature: yield agentContext.wallet.sign({ data: core_1.Buffer.from(payload), key }),
                };
            })));
        });
    }
}
exports.CheqdDidRegistrar = CheqdDidRegistrar;
