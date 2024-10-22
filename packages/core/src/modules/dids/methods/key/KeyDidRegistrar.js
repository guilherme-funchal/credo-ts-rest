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
exports.KeyDidRegistrar = void 0;
const DidDocumentRole_1 = require("../../domain/DidDocumentRole");
const repository_1 = require("../../repository");
const DidKey_1 = require("./DidKey");
class KeyDidRegistrar {
    constructor() {
        this.supportedMethods = ['key'];
    }
    create(agentContext, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const didRepository = agentContext.dependencyManager.resolve(repository_1.DidRepository);
            const keyType = options.options.keyType;
            const seed = (_a = options.secret) === null || _a === void 0 ? void 0 : _a.seed;
            const privateKey = (_b = options.secret) === null || _b === void 0 ? void 0 : _b.privateKey;
            if (!keyType) {
                return {
                    didDocumentMetadata: {},
                    didRegistrationMetadata: {},
                    didState: {
                        state: 'failed',
                        reason: 'Missing key type',
                    },
                };
            }
            try {
                const key = yield agentContext.wallet.createKey({
                    keyType,
                    seed,
                    privateKey,
                });
                const didKey = new DidKey_1.DidKey(key);
                // Save the did so we know we created it and can issue with it
                const didRecord = new repository_1.DidRecord({
                    did: didKey.did,
                    role: DidDocumentRole_1.DidDocumentRole.Created,
                });
                yield didRepository.save(agentContext, didRecord);
                return {
                    didDocumentMetadata: {},
                    didRegistrationMetadata: {},
                    didState: {
                        state: 'finished',
                        did: didKey.did,
                        didDocument: didKey.didDocument,
                        secret: {
                            // FIXME: the uni-registrar creates the seed in the registrar method
                            // if it doesn't exist so the seed can always be returned. Currently
                            // we can only return it if the seed was passed in by the user. Once
                            // we have a secure method for generating seeds we should use the same
                            // approach
                            seed: (_c = options.secret) === null || _c === void 0 ? void 0 : _c.seed,
                            privateKey: (_d = options.secret) === null || _d === void 0 ? void 0 : _d.privateKey,
                        },
                    },
                };
            }
            catch (error) {
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
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'failed',
                    reason: `notSupported: cannot update did:key did`,
                },
            };
        });
    }
    deactivate() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'failed',
                    reason: `notSupported: cannot deactivate did:key did`,
                },
            };
        });
    }
}
exports.KeyDidRegistrar = KeyDidRegistrar;
