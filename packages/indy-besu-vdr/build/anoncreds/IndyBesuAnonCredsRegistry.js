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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.IndyBesuAnonCredsRegistry = void 0;
var core_1 = require("@credo-ts/core");
var ledger_1 = require("../ledger");
var AnonCredsUtils_1 = require("./AnonCredsUtils");
var Trasformers_1 = require("./Trasformers");
var IndyBesuAnonCredsRegistry = /** @class */ (function () {
    function IndyBesuAnonCredsRegistry() {
        this.methodName = 'indy2';
        this.supportedIdentifier = new RegExp('');
    }
    IndyBesuAnonCredsRegistry.prototype.getSchema = function (agentContext, schemaId) {
        return __awaiter(this, void 0, void 0, function () {
            var schemaRegistry, schema, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        schemaRegistry = agentContext.dependencyManager.resolve(ledger_1.SchemaRegistry);
                        return [4 /*yield*/, schemaRegistry.resolveSchema(schemaId)];
                    case 1:
                        schema = (_a.sent());
                        return [2 /*return*/, {
                                schema: schema,
                                schemaId: schemaId,
                                resolutionMetadata: {},
                                schemaMetadata: {}
                            }];
                    case 2:
                        error_1 = _a.sent();
                        return [2 /*return*/, {
                                schemaId: schemaId,
                                resolutionMetadata: {
                                    error: 'unknownError',
                                    message: "unable to resolve schema: ".concat(error_1.message)
                                },
                                schemaMetadata: {}
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    IndyBesuAnonCredsRegistry.prototype.registerSchema = function (agentContext, options) {
        return __awaiter(this, void 0, void 0, function () {
            var schemaRegistry, signer, schemaId, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        schemaRegistry = agentContext.dependencyManager.resolve(ledger_1.SchemaRegistry);
                        signer = new ledger_1.IndyBesuSigner(options.options.accountKey, agentContext.wallet);
                        schemaId = (0, AnonCredsUtils_1.buildSchemaId)(options.schema);
                        return [4 /*yield*/, schemaRegistry.createSchema(schemaId, options.schema, signer)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, {
                                schemaState: {
                                    state: 'finished',
                                    schema: options.schema,
                                    schemaId: schemaId
                                },
                                registrationMetadata: {},
                                schemaMetadata: {}
                            }];
                    case 2:
                        error_2 = _a.sent();
                        return [2 /*return*/, {
                                schemaMetadata: {},
                                registrationMetadata: {},
                                schemaState: {
                                    state: 'failed',
                                    schema: options.schema,
                                    reason: "Faield registering schema: ".concat(error_2.message)
                                }
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    IndyBesuAnonCredsRegistry.prototype.getCredentialDefinition = function (agentContext, credentialDefinitionId) {
        return __awaiter(this, void 0, void 0, function () {
            var credentialDefinitionRegistry, credentialDefinition, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        credentialDefinitionRegistry = agentContext.dependencyManager.resolve(ledger_1.CredentialDefinitionRegistry);
                        return [4 /*yield*/, credentialDefinitionRegistry.resolveCredentialDefinition(credentialDefinitionId)];
                    case 1:
                        credentialDefinition = _a.sent();
                        return [2 /*return*/, {
                                credentialDefinition: {
                                    issuerId: credentialDefinition.issuerId,
                                    schemaId: credentialDefinition.schemaId,
                                    type: 'CL',
                                    tag: credentialDefinition.tag,
                                    value: core_1.JsonTransformer.deserialize(credentialDefinition.value, Trasformers_1.CredentialDefinitionValue)
                                },
                                credentialDefinitionId: credentialDefinitionId,
                                resolutionMetadata: {},
                                credentialDefinitionMetadata: {}
                            }];
                    case 2:
                        error_3 = _a.sent();
                        return [2 /*return*/, {
                                credentialDefinitionId: credentialDefinitionId,
                                resolutionMetadata: {
                                    error: 'unknownError',
                                    message: "unable to resolve credential definition: ".concat(error_3.message)
                                },
                                credentialDefinitionMetadata: {}
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    IndyBesuAnonCredsRegistry.prototype.registerCredentialDefinition = function (agentContext, options) {
        return __awaiter(this, void 0, void 0, function () {
            var credentialDefinitionRegistry, createCredentialDefinition, schema, signer, createCredentialDefinitionId, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        credentialDefinitionRegistry = agentContext.dependencyManager.resolve(ledger_1.CredentialDefinitionRegistry);
                        createCredentialDefinition = options.credentialDefinition;
                        return [4 /*yield*/, this.getSchema(agentContext, createCredentialDefinition.schemaId)];
                    case 1:
                        schema = _a.sent();
                        if (!schema.schema) {
                            throw new core_1.CredoError("Schema not found for schemaId: ".concat(createCredentialDefinition.schemaId));
                        }
                        signer = new ledger_1.IndyBesuSigner(options.options.accountKey, agentContext.wallet);
                        createCredentialDefinitionId = (0, AnonCredsUtils_1.buildCredentialDefinitionId)(createCredentialDefinition);
                        return [4 /*yield*/, credentialDefinitionRegistry.createCredentialDefinition(createCredentialDefinitionId, {
                                issuerId: createCredentialDefinition.issuerId,
                                schemaId: createCredentialDefinition.schemaId,
                                credDefType: 'CL',
                                tag: createCredentialDefinition.tag,
                                value: core_1.JsonTransformer.serialize(createCredentialDefinition.value)
                            }, signer)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, {
                                credentialDefinitionState: {
                                    state: 'finished',
                                    credentialDefinition: options.credentialDefinition,
                                    credentialDefinitionId: createCredentialDefinitionId
                                },
                                registrationMetadata: {},
                                credentialDefinitionMetadata: {}
                            }];
                    case 3:
                        error_4 = _a.sent();
                        return [2 /*return*/, {
                                credentialDefinitionMetadata: {},
                                registrationMetadata: {},
                                credentialDefinitionState: {
                                    state: 'failed',
                                    credentialDefinition: options.credentialDefinition,
                                    reason: "unknownError: ".concat(error_4.message)
                                }
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    IndyBesuAnonCredsRegistry.prototype.getRevocationRegistryDefinition = function (agentContext, revocationRegistryDefinitionId) {
        throw new Error('Method not implemented.');
    };
    IndyBesuAnonCredsRegistry.prototype.getRevocationStatusList = function (agentContext, revocationRegistryId, timestamp) {
        throw new Error('Method not implemented.');
    };
    return IndyBesuAnonCredsRegistry;
}());
exports.IndyBesuAnonCredsRegistry = IndyBesuAnonCredsRegistry;
