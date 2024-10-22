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
exports.IndyBesuDidRegistrar = void 0;
const core_1 = require("@credo-ts/core");
const ledger_1 = require("../ledger");
const DidUtils_1 = require("./DidUtils");
class IndyBesuDidRegistrar {
    constructor() {
        this.supportedMethods = ['ethr'];
    }
    create(agentContext, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const didRegistry = agentContext.dependencyManager.resolve(ledger_1.DidRegistry);
            const didKey = yield agentContext.wallet.createKey({
                keyType: core_1.KeyType.K256,
                privateKey: (_a = options.secret) === null || _a === void 0 ? void 0 : _a.didPrivateKey,
            });
            const did = (0, DidUtils_1.buildDid)(options.method, didKey.publicKey);
            const signer = new ledger_1.IndyBesuSigner(didKey, agentContext.wallet);
            try {
                if ((_b = options === null || options === void 0 ? void 0 : options.options) === null || _b === void 0 ? void 0 : _b.verificationKeys) {
                    for (const verificationKey of options.options.verificationKeys) {
                        const materialPropertyName = (0, DidUtils_1.getVerificationMaterialPropertyName)(verificationKey.type);
                        const material = (0, DidUtils_1.getVerificationMaterial)(verificationKey.type, verificationKey.key);
                        const purpose = (0, DidUtils_1.getVerificationPurpose)(verificationKey.purpose);
                        const keyAttribute = {
                            [`${materialPropertyName}`]: material,
                            purpose,
                            type: DidUtils_1.VerificationKeyType[verificationKey.type],
                        };
                        yield didRegistry.setAttribute(did, keyAttribute, BigInt(100000), signer);
                    }
                }
                if ((_c = options === null || options === void 0 ? void 0 : options.options) === null || _c === void 0 ? void 0 : _c.endpoints) {
                    for (const endpoint of options.options.endpoints) {
                        const serviceAttribute = {
                            serviceEndpoint: endpoint.endpoint,
                            type: endpoint.type,
                        };
                        yield didRegistry.setAttribute(did, serviceAttribute, BigInt(100000), signer);
                    }
                }
                const didDocument = (0, DidUtils_1.buildDidDocument)(did, didKey, (_d = options === null || options === void 0 ? void 0 : options.options) === null || _d === void 0 ? void 0 : _d.endpoints, (_e = options === null || options === void 0 ? void 0 : options.options) === null || _e === void 0 ? void 0 : _e.verificationKeys);
                return {
                    didDocumentMetadata: {},
                    didRegistrationMetadata: {},
                    didState: {
                        state: 'finished',
                        did: didDocument.id,
                        didDocument: didDocument,
                        secret: { didKey },
                    },
                };
            }
            catch (error) {
                console.log(error);
                return (0, DidUtils_1.failedResult)(`unknownError: ${error.message}`);
            }
        });
    }
    update(agentContext, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'failed',
                    reason: `notImplemented: updating did:indy not implemented yet`,
                },
            };
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
        });
    }
    deactivate(agentContext, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                didDocumentMetadata: {},
                didRegistrationMetadata: {},
                didState: {
                    state: 'failed',
                    reason: `notImplemented: updating did:indy not implemented yet`,
                },
            };
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
        });
    }
}
exports.IndyBesuDidRegistrar = IndyBesuDidRegistrar;
