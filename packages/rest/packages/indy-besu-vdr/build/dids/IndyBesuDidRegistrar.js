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
exports.IndyBesuDidRegistrar = void 0;
var core_1 = require("@credo-ts/core");
var ledger_1 = require("../ledger");
var DidUtils_1 = require("./DidUtils");
var IndyBesuDidRegistrar = /** @class */ (function () {
    function IndyBesuDidRegistrar() {
        this.supportedMethods = ['ethr'];
    }
    IndyBesuDidRegistrar.prototype.create = function (agentContext, options) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function () {
            var didRegistry, didKey, did, signer, _i, _f, verificationKey, materialPropertyName, material, purpose, keyAttribute, _g, _h, endpoint, serviceAttribute, didDocument, error_1;
            var _j;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        didRegistry = agentContext.dependencyManager.resolve(ledger_1.DidRegistry);
                        return [4 /*yield*/, agentContext.wallet.createKey({
                                keyType: core_1.KeyType.K256,
                                privateKey: (_a = options.secret) === null || _a === void 0 ? void 0 : _a.didPrivateKey
                            })];
                    case 1:
                        didKey = _k.sent();
                        did = (0, DidUtils_1.buildDid)(options.method, didKey.publicKey);
                        signer = new ledger_1.IndyBesuSigner(didKey, agentContext.wallet);
                        _k.label = 2;
                    case 2:
                        _k.trys.push([2, 11, , 12]);
                        if (!((_b = options === null || options === void 0 ? void 0 : options.options) === null || _b === void 0 ? void 0 : _b.verificationKeys)) return [3 /*break*/, 6];
                        _i = 0, _f = options.options.verificationKeys;
                        _k.label = 3;
                    case 3:
                        if (!(_i < _f.length)) return [3 /*break*/, 6];
                        verificationKey = _f[_i];
                        materialPropertyName = (0, DidUtils_1.getVerificationMaterialPropertyName)(verificationKey.type);
                        material = (0, DidUtils_1.getVerificationMaterial)(verificationKey.type, verificationKey.key);
                        purpose = (0, DidUtils_1.getVerificationPurpose)(verificationKey.purpose);
                        keyAttribute = (_j = {},
                            _j["".concat(materialPropertyName)] = material,
                            _j.purpose = purpose,
                            _j.type = DidUtils_1.VerificationKeyType[verificationKey.type],
                            _j);
                        return [4 /*yield*/, didRegistry.setAttribute(did, keyAttribute, BigInt(100000), signer)];
                    case 4:
                        _k.sent();
                        _k.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6:
                        if (!((_c = options === null || options === void 0 ? void 0 : options.options) === null || _c === void 0 ? void 0 : _c.endpoints)) return [3 /*break*/, 10];
                        _g = 0, _h = options.options.endpoints;
                        _k.label = 7;
                    case 7:
                        if (!(_g < _h.length)) return [3 /*break*/, 10];
                        endpoint = _h[_g];
                        serviceAttribute = {
                            serviceEndpoint: endpoint.endpoint,
                            type: endpoint.type
                        };
                        return [4 /*yield*/, didRegistry.setAttribute(did, serviceAttribute, BigInt(100000), signer)];
                    case 8:
                        _k.sent();
                        _k.label = 9;
                    case 9:
                        _g++;
                        return [3 /*break*/, 7];
                    case 10:
                        didDocument = (0, DidUtils_1.buildDidDocument)(did, didKey, (_d = options === null || options === void 0 ? void 0 : options.options) === null || _d === void 0 ? void 0 : _d.endpoints, (_e = options === null || options === void 0 ? void 0 : options.options) === null || _e === void 0 ? void 0 : _e.verificationKeys);
                        return [2 /*return*/, {
                                didDocumentMetadata: {},
                                didRegistrationMetadata: {},
                                didState: {
                                    state: 'finished',
                                    did: didDocument.id,
                                    didDocument: didDocument,
                                    secret: { didKey: didKey }
                                }
                            }];
                    case 11:
                        error_1 = _k.sent();
                        console.log(error_1);
                        return [2 /*return*/, (0, DidUtils_1.failedResult)("unknownError: ".concat(error_1.message))];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    IndyBesuDidRegistrar.prototype.update = function (agentContext, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        didDocumentMetadata: {},
                        didRegistrationMetadata: {},
                        didState: {
                            state: 'failed',
                            reason: "notImplemented: updating did:indy not implemented yet"
                        }
                    }
                    // const didRegistry = agentContext.dependencyManager.resolve(DidRegistry)
                    // const signer = new IndyBesuSigner(options.options.accountKey, agentContext.wallet)
                    // try {
                    //   const resolvedDocument = await didRegistry.resolveDid(options.did)
                    //   if (!resolvedDocument) return failedResult('DID not found')
                    //   let didDocument: DidDocument
                    //   switch (options.didDocumentOperation) {
                    //     case 'addToDidDocument':
                    //       didDocument = this.addToDidDocument(resolvedDocument, options.didDocument)
                    //       break
                    //     case 'removeFromDidDocument':
                    //       didDocument = this.removeFromDidDocument(resolvedDocument, options.didDocument)
                    //     default:
                    //       const providedDocument = options.didDocument as DidDocument
                    //       if (providedDocument) {
                    //         didDocument = providedDocument
                    //       } else {
                    //         return failedResult('Provide a valid didDocument')
                    //       }
                    //   }
                    //   const error = validateSpecCompliantPayload(didDocument)
                    //   if (error) return failedResult(error)
                    //   await didRegistry.updateDid(toIndyBesuDidDocument(didDocument), signer)
                    //   return {
                    //     didDocumentMetadata: {},
                    //     didRegistrationMetadata: {},
                    //     didState: {
                    //       state: 'finished',
                    //       did: didDocument.id,
                    //       didDocument: didDocument,
                    //       secret: options.secret,
                    //     },
                    //   }
                    // } catch (error) {
                    //   return failedResult(`unknownError: ${error.message}`)
                    // }
                ];
            });
        });
    };
    IndyBesuDidRegistrar.prototype.deactivate = function (agentContext, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        didDocumentMetadata: {},
                        didRegistrationMetadata: {},
                        didState: {
                            state: 'failed',
                            reason: "notImplemented: updating did:indy not implemented yet"
                        }
                    }
                    // const didRegistry = agentContext.dependencyManager.resolve(DidRegistry)
                    // const signer = new IndyBesuSigner(options.options.accountKey, agentContext.wallet)
                    // try {
                    //   const resolvedDocument = await didRegistry.resolveDid(options.did)
                    //   if (!resolvedDocument) return failedResult('DID not found')
                    //   await didRegistry.deactivateDid(options.did, signer)
                    //   return {
                    //     didDocumentMetadata: {},
                    //     didRegistrationMetadata: {},
                    //     didState: {
                    //       state: 'finished',
                    //       did: options.did,
                    //       didDocument: fromIndyBesuDidDocument(resolvedDocument),
                    //       secret: options.secret,
                    //     },
                    //   }
                    // } catch (error) {
                    //   return failedResult(`unknownError: ${error.message}`)
                    // }
                ];
            });
        });
    };
    return IndyBesuDidRegistrar;
}());
exports.IndyBesuDidRegistrar = IndyBesuDidRegistrar;
