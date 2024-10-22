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
exports.indyDidDocumentFromDid = indyDidDocumentFromDid;
exports.createKeyAgreementKey = createKeyAgreementKey;
exports.verificationKeyForIndyDid = verificationKeyForIndyDid;
const core_1 = require("@aries-framework/core");
// Create a base DIDDoc template according to https://hyperledger.github.io/indy-did-method/#base-diddoc-template
function indyDidDocumentFromDid(did, publicKeyBase58) {
    const verificationMethodId = `${did}#verkey`;
    const builder = new core_1.DidDocumentBuilder(did)
        .addContext('https://w3id.org/security/suites/ed25519-2018/v1')
        .addVerificationMethod({
        controller: did,
        id: verificationMethodId,
        publicKeyBase58,
        type: 'Ed25519VerificationKey2018',
    })
        .addAuthentication(verificationMethodId);
    return builder;
}
function createKeyAgreementKey(verkey) {
    return core_1.TypedArrayEncoder.toBase58((0, core_1.convertPublicKeyToX25519)(core_1.TypedArrayEncoder.fromBase58(verkey)));
}
/**
 * Fetches the verification key for a given did:indy did and returns the key as a {@link Key} object.
 *
 * @throws {@link AriesFrameworkError} if the did could not be resolved or the key could not be extracted
 */
function verificationKeyForIndyDid(agentContext, did) {
    return __awaiter(this, void 0, void 0, function* () {
        // FIXME: we should store the didDocument in the DidRecord so we don't have to fetch our own did
        // from the ledger to know which key is associated with the did
        const didsApi = agentContext.dependencyManager.resolve(core_1.DidsApi);
        const didResult = yield didsApi.resolve(did);
        if (!didResult.didDocument) {
            throw new core_1.AriesFrameworkError(`Could not resolve did ${did}. ${didResult.didResolutionMetadata.error} ${didResult.didResolutionMetadata.message}`);
        }
        // did:indy dids MUST have a verificationMethod with #verkey
        const verificationMethod = didResult.didDocument.dereferenceKey(`${did}#verkey`);
        const key = (0, core_1.getKeyFromVerificationMethod)(verificationMethod);
        return key;
    });
}
