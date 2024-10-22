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
exports.IndyBesuDidResolver = void 0;
var core_1 = require("@credo-ts/core");
var ledger_1 = require("../ledger");
var DidUtils_1 = require("./DidUtils");
var IndyBesuDidResolver = /** @class */ (function () {
    function IndyBesuDidResolver() {
        this.supportedMethods = ['ethr'];
    }
    IndyBesuDidResolver.prototype.resolve = function (agentContext, did) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var didRegistry, result, didDocument_1, context, error_1;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        didRegistry = agentContext.dependencyManager.resolve(ledger_1.DidRegistry);
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, didRegistry.resolveDid(did)];
                    case 2:
                        result = _d.sent();
                        agentContext.config.logger.trace("Resolved DID: ".concat(JSON.stringify(result)));
                        didDocument_1 = new core_1.DidDocument(result.didDocument);
                        context = result.didDocument['@context'].filter(function (value) { return value !== 'https://w3id.org/security/v3-unstable'; });
                        didDocument_1.context = context;
                        didDocument_1.verificationMethod = (_a = didDocument_1.verificationMethod) === null || _a === void 0 ? void 0 : _a.map(function (method) {
                            return new core_1.VerificationMethod(method);
                        });
                        (_b = didDocument_1.verificationMethod) === null || _b === void 0 ? void 0 : _b.forEach(function (method) {
                            _this.updateContext(didDocument_1, method);
                        });
                        didDocument_1.service = (_c = didDocument_1.service) === null || _c === void 0 ? void 0 : _c.map(function (service) {
                            return new core_1.DidDocumentService(service);
                        });
                        return [2 /*return*/, {
                                didDocument: didDocument_1,
                                didDocumentMetadata: {},
                                didResolutionMetadata: {}
                            }];
                    case 3:
                        error_1 = _d.sent();
                        return [2 /*return*/, {
                                didDocument: null,
                                didDocumentMetadata: {},
                                didResolutionMetadata: {
                                    error: 'unknownError',
                                    message: "resolver_error: Unable to resolve did '".concat(did, "': ").concat(error_1)
                                }
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    IndyBesuDidResolver.prototype.updateContext = function (didDocument, method) {
        var keyContext = (0, DidUtils_1.getKeyContext)(DidUtils_1.VerificationKeyType[method.type]);
        if (!didDocument.context.includes(keyContext)) {
            if (Array.isArray(didDocument.context)) {
                didDocument.context.push(keyContext);
            }
            else {
                didDocument.context = [didDocument.context, keyContext];
            }
        }
    };
    return IndyBesuDidResolver;
}());
exports.IndyBesuDidResolver = IndyBesuDidResolver;
