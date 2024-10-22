"use strict";
/*
 * Copyright 2020 - MATTR Limited
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
exports.BbsBlsSignatureProof2020 = void 0;
const core_1 = require("@aries-framework/core");
const bbs_signatures_1 = require("@mattrglobal/bbs-signatures");
const bls12381_key_pair_1 = require("@mattrglobal/bls12381-key-pair");
const random_1 = require("@stablelib/random");
const BbsBlsSignature2020_1 = require("./BbsBlsSignature2020");
const { jsonld, jsonldSignatures } = core_1.vcLibraries;
const LinkedDataProof = jsonldSignatures.suites.LinkedDataProof;
class BbsBlsSignatureProof2020 extends LinkedDataProof {
    constructor({ useNativeCanonize, key, LDKeyClass } = {}) {
        super({
            type: 'BbsBlsSignatureProof2020',
        });
        this.proof = {
            '@context': [
                {
                    sec: 'https://w3id.org/security#',
                    proof: {
                        '@id': 'sec:proof',
                        '@type': '@id',
                        '@container': '@graph',
                    },
                },
                'https://w3id.org/security/bbs/v1',
            ],
            type: 'BbsBlsSignatureProof2020',
        };
        this.mappedDerivedProofType = 'BbsBlsSignature2020';
        this.supportedDeriveProofType = BbsBlsSignatureProof2020.supportedDerivedProofType;
        this.LDKeyClass = LDKeyClass !== null && LDKeyClass !== void 0 ? LDKeyClass : bls12381_key_pair_1.Bls12381G2KeyPair;
        this.proofSignatureKey = 'proofValue';
        this.key = key;
        this.useNativeCanonize = useNativeCanonize;
    }
    /**
     * Derive a proof from a proof and reveal document
     *
     * @param options {object} options for deriving a proof.
     *
     * @returns {Promise<object>} Resolves with the derived proof object.
     */
    deriveProof(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { document, proof, revealDocument, documentLoader, expansionMap } = options;
            let { nonce } = options;
            const proofType = proof.type;
            if (typeof proofType !== 'string') {
                throw new TypeError(`Expected proof.type to be of type 'string', got ${typeof proofType} instead.`);
            }
            // Validate that the input proof document has a proof compatible with this suite
            if (!BbsBlsSignatureProof2020.supportedDerivedProofType.includes(proofType)) {
                throw new TypeError(`proof document proof incompatible, expected proof types of ${JSON.stringify(BbsBlsSignatureProof2020.supportedDerivedProofType)} received ${proof.type}`);
            }
            const signatureBase58 = proof[this.proofSignatureKey];
            if (typeof signatureBase58 !== 'string') {
                throw new TypeError(`Expected signature to be a base58 encoded string, got ${typeof signatureBase58} instead.`);
            }
            //Extract the BBS signature from the input proof
            const signature = core_1.TypedArrayEncoder.fromBase64(signatureBase58);
            //Initialize the BBS signature suite
            const suite = new BbsBlsSignature2020_1.BbsBlsSignature2020();
            //Initialize the derived proof
            let derivedProof;
            if (this.proof) {
                // use proof JSON-LD document passed to API
                derivedProof = yield jsonld.compact(this.proof, core_1.SECURITY_CONTEXT_URL, {
                    documentLoader,
                    expansionMap,
                    compactToRelative: false,
                });
            }
            else {
                // create proof JSON-LD document
                derivedProof = { '@context': core_1.SECURITY_CONTEXT_URL };
            }
            // ensure proof type is set
            derivedProof.type = this.type;
            // Get the input document statements
            const documentStatements = yield suite.createVerifyDocumentData(document, {
                documentLoader,
                expansionMap,
            });
            // Get the proof statements
            const proofStatements = yield suite.createVerifyProofData(proof, {
                documentLoader,
                expansionMap,
            });
            // Transform any blank node identifiers for the input
            // document statements into actual node identifiers
            // e.g _:c14n0 => urn:bnid:_:c14n0
            const transformedInputDocumentStatements = documentStatements.map((element) => element.replace(/(_:c14n[0-9]+)/g, '<urn:bnid:$1>'));
            //Transform the resulting RDF statements back into JSON-LD
            const compactInputProofDocument = yield jsonld.fromRDF(transformedInputDocumentStatements.join('\n'));
            // Frame the result to create the reveal document result
            const revealDocumentResult = yield jsonld.frame(compactInputProofDocument, revealDocument, { documentLoader });
            // Canonicalize the resulting reveal document
            const revealDocumentStatements = yield suite.createVerifyDocumentData(revealDocumentResult, {
                documentLoader,
                expansionMap,
            });
            //Get the indicies of the revealed statements from the transformed input document offset
            //by the number of proof statements
            const numberOfProofStatements = proofStatements.length;
            //Always reveal all the statements associated to the original proof
            //these are always the first statements in the normalized form
            const proofRevealIndicies = Array.from(Array(numberOfProofStatements).keys());
            //Reveal the statements indicated from the reveal document
            const documentRevealIndicies = revealDocumentStatements.map((key) => transformedInputDocumentStatements.indexOf(key) + numberOfProofStatements);
            // Check there is not a mismatch
            if (documentRevealIndicies.length !== revealDocumentStatements.length) {
                throw new Error('Some statements in the reveal document not found in original proof');
            }
            // Combine all indicies to get the resulting list of revealed indicies
            const revealIndicies = proofRevealIndicies.concat(documentRevealIndicies);
            // Create a nonce if one is not supplied
            if (!nonce) {
                nonce = (0, random_1.randomBytes)(50);
            }
            // Set the nonce on the derived proof
            // derivedProof.nonce = Buffer.from(nonce).toString('base64')
            derivedProof.nonce = core_1.TypedArrayEncoder.toBase64(nonce);
            //Combine all the input statements that
            //were originally signed to generate the proof
            const allInputStatements = proofStatements
                .concat(documentStatements)
                .map((item) => new Uint8Array(core_1.TypedArrayEncoder.fromString(item)));
            // Fetch the verification method
            const verificationMethod = yield this.getVerificationMethod({
                proof,
                documentLoader,
            });
            // Construct a key pair class from the returned verification method
            const key = verificationMethod.publicKeyJwk
                ? yield this.LDKeyClass.fromJwk(verificationMethod)
                : yield this.LDKeyClass.from(verificationMethod);
            // Compute the proof
            const outputProof = yield (0, bbs_signatures_1.blsCreateProof)({
                signature,
                publicKey: Uint8Array.from(key.publicKeyBuffer),
                messages: allInputStatements,
                nonce,
                revealed: revealIndicies,
            });
            // Set the proof value on the derived proof
            derivedProof.proofValue = core_1.TypedArrayEncoder.toBase64(outputProof);
            // Set the relevant proof elements on the derived proof from the input proof
            derivedProof.verificationMethod = proof.verificationMethod;
            derivedProof.proofPurpose = proof.proofPurpose;
            derivedProof.created = proof.created;
            return {
                document: Object.assign({}, revealDocumentResult),
                proof: derivedProof,
            };
        });
    }
    /**
     * @param options {object} options for verifying the proof.
     *
     * @returns {Promise<{object}>} Resolves with the verification result.
     */
    verifyProof(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { document, documentLoader, expansionMap, purpose } = options;
            const { proof } = options;
            try {
                proof.type = this.mappedDerivedProofType;
                const proofIncludingDocumentContext = Object.assign(Object.assign({}, proof), { '@context': document['@context'] });
                // Get the proof statements
                const proofStatements = yield this.createVerifyProofData(proofIncludingDocumentContext, {
                    documentLoader,
                    expansionMap,
                });
                // Get the document statements
                const documentStatements = yield this.createVerifyProofData(document, {
                    documentLoader,
                    expansionMap,
                });
                // Transform the blank node identifier placeholders for the document statements
                // back into actual blank node identifiers
                const transformedDocumentStatements = documentStatements.map((element) => element.replace(/<urn:bnid:(_:c14n[0-9]+)>/g, '$1'));
                // Combine all the statements to be verified
                const statementsToVerify = proofStatements
                    .concat(transformedDocumentStatements)
                    .map((item) => new Uint8Array(core_1.TypedArrayEncoder.fromString(item)));
                // Fetch the verification method
                const verificationMethod = yield this.getVerificationMethod({
                    proof,
                    documentLoader,
                });
                // Construct a key pair class from the returned verification method
                const key = verificationMethod.publicKeyJwk
                    ? yield this.LDKeyClass.fromJwk(verificationMethod)
                    : yield this.LDKeyClass.from(verificationMethod);
                const proofValue = proof.proofValue;
                if (typeof proofValue !== 'string') {
                    throw new core_1.AriesFrameworkError(`Expected proof.proofValue to be of type 'string', got ${typeof proof}`);
                }
                // Verify the proof
                const verified = yield (0, bbs_signatures_1.blsVerifyProof)({
                    proof: core_1.TypedArrayEncoder.fromBase64(proofValue),
                    publicKey: key.publicKeyBuffer,
                    messages: statementsToVerify,
                    nonce: core_1.TypedArrayEncoder.fromBase64(proof.nonce),
                });
                // Ensure proof was performed for a valid purpose
                const { valid, error } = yield purpose.validate(proof, {
                    document,
                    suite: this,
                    verificationMethod,
                    documentLoader,
                    expansionMap,
                });
                if (!valid) {
                    throw error;
                }
                return verified;
            }
            catch (error) {
                return { verified: false, error };
            }
        });
    }
    canonize(input, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { documentLoader, expansionMap, skipExpansion } = options;
            return jsonld.canonize(input, {
                algorithm: 'URDNA2015',
                format: 'application/n-quads',
                documentLoader,
                expansionMap,
                skipExpansion,
                useNative: this.useNativeCanonize,
            });
        });
    }
    canonizeProof(proof, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { documentLoader, expansionMap } = options;
            proof = Object.assign({}, proof);
            delete proof.nonce;
            delete proof.proofValue;
            return this.canonize(proof, {
                documentLoader,
                expansionMap,
                skipExpansion: false,
            });
        });
    }
    /**
     * @param document {CreateVerifyDataOptions} options to create verify data
     *
     * @returns {Promise<{string[]>}.
     */
    createVerifyData(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { proof, document, documentLoader, expansionMap } = options;
            const proofStatements = yield this.createVerifyProofData(proof, {
                documentLoader,
                expansionMap,
            });
            const documentStatements = yield this.createVerifyDocumentData(document, {
                documentLoader,
                expansionMap,
            });
            // concatenate c14n proof options and c14n document
            return proofStatements.concat(documentStatements);
        });
    }
    /**
     * @param proof to canonicalize
     * @param options to create verify data
     *
     * @returns {Promise<{string[]>}.
     */
    createVerifyProofData(proof_1, _a) {
        return __awaiter(this, arguments, void 0, function* (proof, { documentLoader, expansionMap }) {
            const c14nProofOptions = yield this.canonizeProof(proof, {
                documentLoader,
                expansionMap,
            });
            return c14nProofOptions.split('\n').filter((_) => _.length > 0);
        });
    }
    /**
     * @param document to canonicalize
     * @param options to create verify data
     *
     * @returns {Promise<{string[]>}.
     */
    createVerifyDocumentData(document_1, _a) {
        return __awaiter(this, arguments, void 0, function* (document, { documentLoader, expansionMap }) {
            const c14nDocument = yield this.canonize(document, {
                documentLoader,
                expansionMap,
            });
            return c14nDocument.split('\n').filter((_) => _.length > 0);
        });
    }
    getVerificationMethod(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.key) {
                // This happens most often during sign() operations. For verify(),
                // the expectation is that the verification method will be fetched
                // by the documentLoader (below), not provided as a `key` parameter.
                return this.key.export({ publicKey: true });
            }
            let { verificationMethod } = options.proof;
            if (typeof verificationMethod === 'object' && verificationMethod !== null) {
                verificationMethod = verificationMethod.id;
            }
            if (!verificationMethod) {
                throw new Error('No "verificationMethod" found in proof.');
            }
            if (!options.documentLoader) {
                throw new core_1.AriesFrameworkError('Missing custom document loader. This is required for resolving verification methods.');
            }
            const { document } = yield options.documentLoader(verificationMethod);
            verificationMethod = typeof document === 'string' ? JSON.parse(document) : document;
            // await this.assertVerificationMethod(verificationMethod)
            return verificationMethod;
        });
    }
}
exports.BbsBlsSignatureProof2020 = BbsBlsSignatureProof2020;
BbsBlsSignatureProof2020.proofType = [
    'BbsBlsSignatureProof2020',
    'sec:BbsBlsSignatureProof2020',
    'https://w3id.org/security#BbsBlsSignatureProof2020',
];
BbsBlsSignatureProof2020.supportedDerivedProofType = [
    'BbsBlsSignature2020',
    'sec:BbsBlsSignature2020',
    'https://w3id.org/security#BbsBlsSignature2020',
];
