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
exports.CheqdDidResolver = void 0;
const core_1 = require("@aries-framework/core");
const identifiers_1 = require("../anoncreds/utils/identifiers");
const ledger_1 = require("../ledger");
const didCheqdUtil_1 = require("./didCheqdUtil");
class CheqdDidResolver {
    constructor() {
        this.supportedMethods = ['cheqd'];
    }
    resolve(agentContext, did, parsed) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const didDocumentMetadata = {};
            try {
                const parsedDid = (0, identifiers_1.parseCheqdDid)(parsed.didUrl);
                if (!parsedDid) {
                    throw new Error('Invalid DID');
                }
                switch (did) {
                    case (_a = did.match(identifiers_1.cheqdDidRegex)) === null || _a === void 0 ? void 0 : _a.input:
                        return yield this.resolveDidDoc(agentContext, parsedDid.did);
                    case (_b = did.match(identifiers_1.cheqdDidVersionRegex)) === null || _b === void 0 ? void 0 : _b.input: {
                        const version = did.split('/')[2];
                        return yield this.resolveDidDoc(agentContext, parsedDid.did, version);
                    }
                    case (_c = did.match(identifiers_1.cheqdDidVersionsRegex)) === null || _c === void 0 ? void 0 : _c.input:
                        return yield this.resolveAllDidDocVersions(agentContext, parsedDid);
                    case (_d = did.match(identifiers_1.cheqdDidMetadataRegex)) === null || _d === void 0 ? void 0 : _d.input:
                        return yield this.dereferenceCollectionResources(agentContext, parsedDid);
                    case (_e = did.match(identifiers_1.cheqdResourceMetadataRegex)) === null || _e === void 0 ? void 0 : _e.input:
                        return yield this.dereferenceResourceMetadata(agentContext, parsedDid);
                    default:
                        return {
                            didDocument: null,
                            didDocumentMetadata,
                            didResolutionMetadata: {
                                error: 'Invalid request',
                                message: `Unsupported did Url: '${did}'`,
                            },
                        };
                }
            }
            catch (error) {
                return {
                    didDocument: null,
                    didDocumentMetadata,
                    didResolutionMetadata: {
                        error: 'notFound',
                        message: `resolver_error: Unable to resolve did '${did}': ${error}`,
                    },
                };
            }
        });
    }
    resolveResource(agentContext, did) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const cheqdLedgerService = agentContext.dependencyManager.resolve(ledger_1.CheqdLedgerService);
            try {
                const parsedDid = (0, identifiers_1.parseCheqdDid)(did);
                if (!parsedDid) {
                    throw new Error('Invalid DID');
                }
                const { params, id } = parsedDid;
                let resourceId;
                if ((_a = did.match(identifiers_1.cheqdResourceRegex)) === null || _a === void 0 ? void 0 : _a.input) {
                    resourceId = did.split('/')[2];
                }
                else if (params && params.resourceName && params.resourceType) {
                    let resources = (yield cheqdLedgerService.resolveCollectionResources(parsedDid.did, id)).resources;
                    resources = (0, didCheqdUtil_1.filterResourcesByNameAndType)(resources, params.resourceName, params.resourceType);
                    if (!resources.length) {
                        throw new Error(`No resources found`);
                    }
                    let resource;
                    if (params.version) {
                        resource = resources.find((resource) => resource.version == params.version);
                    }
                    else {
                        const date = params.resourceVersionTime ? new Date(Number(params.resourceVersionTime) * 1000) : new Date();
                        // find the resourceId closest to the created time
                        resource = (0, didCheqdUtil_1.getClosestResourceVersion)(resources, date);
                    }
                    if (!resource) {
                        throw new Error(`No resources found`);
                    }
                    resourceId = resource.id;
                }
                else {
                    return {
                        error: 'notFound',
                        message: `resolver_error: Invalid did url '${did}'`,
                    };
                }
                if (!core_1.utils.isValidUuid(resourceId)) {
                    throw new Error('Invalid resource Id');
                }
                const { resource, metadata } = yield cheqdLedgerService.resolveResource(parsedDid.did, id, resourceId);
                if (!resource || !metadata) {
                    throw new Error('resolver_error: Unable to resolve resource, Please try again');
                }
                const result = yield (0, didCheqdUtil_1.renderResourceData)(resource.data, metadata.mediaType);
                return {
                    resource: result,
                    resourceMetadata: metadata,
                    resourceResolutionMetadata: {},
                };
            }
            catch (error) {
                return {
                    error: 'notFound',
                    message: `resolver_error: Unable to resolve resource '${did}': ${error}`,
                };
            }
        });
    }
    resolveAllDidDocVersions(agentContext, parsedDid) {
        return __awaiter(this, void 0, void 0, function* () {
            const cheqdLedgerService = agentContext.dependencyManager.resolve(ledger_1.CheqdLedgerService);
            const { did } = parsedDid;
            const { didDocumentVersionsMetadata } = yield cheqdLedgerService.resolveMetadata(did);
            return {
                didDocument: new core_1.DidDocument({ id: did }),
                didDocumentMetadata: didDocumentVersionsMetadata,
                didResolutionMetadata: {},
            };
        });
    }
    dereferenceCollectionResources(agentContext, parsedDid) {
        return __awaiter(this, void 0, void 0, function* () {
            const cheqdLedgerService = agentContext.dependencyManager.resolve(ledger_1.CheqdLedgerService);
            const { did, id } = parsedDid;
            const metadata = yield cheqdLedgerService.resolveCollectionResources(did, id);
            return {
                didDocument: new core_1.DidDocument({ id: did }),
                didDocumentMetadata: {
                    linkedResourceMetadata: metadata,
                },
                didResolutionMetadata: {},
            };
        });
    }
    dereferenceResourceMetadata(agentContext, parsedDid) {
        return __awaiter(this, void 0, void 0, function* () {
            const cheqdLedgerService = agentContext.dependencyManager.resolve(ledger_1.CheqdLedgerService);
            const { did, id } = parsedDid;
            if (!parsedDid.path) {
                throw new core_1.AriesFrameworkError(`Missing path in did ${parsedDid.did}`);
            }
            const [, , resourceId] = parsedDid.path.split('/');
            if (!resourceId) {
                throw new core_1.AriesFrameworkError(`Missing resource id in didUrl ${parsedDid.didUrl}`);
            }
            const metadata = yield cheqdLedgerService.resolveResourceMetadata(did, id, resourceId);
            return {
                didDocument: new core_1.DidDocument({ id: did }),
                didDocumentMetadata: {
                    linkedResourceMetadata: metadata,
                },
                didResolutionMetadata: {},
            };
        });
    }
    resolveDidDoc(agentContext, did, version) {
        return __awaiter(this, void 0, void 0, function* () {
            const cheqdLedgerService = agentContext.dependencyManager.resolve(ledger_1.CheqdLedgerService);
            const { didDocument, didDocumentMetadata } = yield cheqdLedgerService.resolve(did, version);
            const { resources } = yield cheqdLedgerService.resolveCollectionResources(did, did.split(':')[3]);
            didDocumentMetadata.linkedResourceMetadata = resources;
            return {
                didDocument: core_1.JsonTransformer.fromJSON(didDocument, core_1.DidDocument),
                didDocumentMetadata,
                didResolutionMetadata: {},
            };
        });
    }
}
exports.CheqdDidResolver = CheqdDidResolver;
