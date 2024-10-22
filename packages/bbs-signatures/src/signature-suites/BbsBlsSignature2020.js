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
exports.BbsBlsSignature2020 = void 0;
const core_1 = require("@aries-framework/core");
const { jsonld, jsonldSignatures } = core_1.vcLibraries;
const LinkedDataProof = jsonldSignatures.suites.LinkedDataProof;
/**
 * A BBS+ signature suite for use with BLS12-381 key pairs
 */
class BbsBlsSignature2020 extends LinkedDataProof {
    /**
     * Default constructor
     * @param options {SignatureSuiteOptions} options for constructing the signature suite
     */
    constructor(options = {}) {
        const { verificationMethod, signer, key, date, useNativeCanonize, LDKeyClass } = options;
        // validate common options
        if (verificationMethod !== undefined && typeof verificationMethod !== 'string') {
            throw new TypeError('"verificationMethod" must be a URL string.');
        }
        super({
            type: 'BbsBlsSignature2020',
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
                core_1.SECURITY_CONTEXT_BBS_URL,
            ],
            type: 'BbsBlsSignature2020',
        };
        this.LDKeyClass = LDKeyClass;
        this.signer = signer;
        this.verificationMethod = verificationMethod;
        this.proofSignatureKey = 'proofValue';
        if (key) {
            if (verificationMethod === undefined) {
                this.verificationMethod = key.id;
            }
            this.key = key;
            if (typeof key.signer === 'function') {
                this.signer = key.signer();
            }
            if (typeof key.verifier === 'function') {
                this.verifier = key.verifier();
            }
        }
        if (date) {
            this.date = new Date(date);
            if (isNaN(this.date)) {
                throw TypeError(`"date" "${date}" is not a valid date.`);
            }
        }
        this.useNativeCanonize = useNativeCanonize;
    }
    ensureSuiteContext({ document }) {
        if (document['@context'] === core_1.SECURITY_CONTEXT_BBS_URL ||
            (Array.isArray(document['@context']) && document['@context'].includes(core_1.SECURITY_CONTEXT_BBS_URL))) {
            // document already includes the required context
            return;
        }
        throw new TypeError(`The document to be signed must contain this suite's @context, ` + `"${core_1.SECURITY_CONTEXT_BBS_URL}".`);
    }
    /**
     * @param options {CreateProofOptions} options for creating the proof
     *
     * @returns {Promise<object>} Resolves with the created proof object.
     */
    createProof(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { document, purpose, documentLoader, expansionMap, compactProof } = options;
            let proof;
            // use proof JSON-LD document passed to API
            if (this.proof) {
                proof = yield jsonld.compact(this.proof, core_1.SECURITY_CONTEXT_URL, {
                    documentLoader,
                    expansionMap,
                    compactToRelative: true,
                });
            }
            else {
                // create proof JSON-LD document
                proof = { '@context': core_1.SECURITY_CONTEXT_URL };
            }
            // ensure proof type is set
            proof.type = this.type;
            // set default `now` date if not given in `proof` or `options`
            let date = this.date;
            if (proof.created === undefined && date === undefined) {
                date = new Date();
            }
            // ensure date is in string format
            if (date !== undefined && typeof date !== 'string') {
                date = (0, core_1.w3cDate)(date);
            }
            // add API overrides
            if (date !== undefined) {
                proof.created = date;
            }
            if (this.verificationMethod !== undefined) {
                proof.verificationMethod = this.verificationMethod;
            }
            // allow purpose to update the proof; the `proof` is in the
            // SECURITY_CONTEXT_URL `@context` -- therefore the `purpose` must
            // ensure any added fields are also represented in that same `@context`
            proof = yield purpose.update(proof, {
                document,
                suite: this,
                documentLoader,
                expansionMap,
            });
            // create data to sign
            const verifyData = (yield this.createVerifyData({
                document,
                proof,
                documentLoader,
                expansionMap,
                compactProof,
            })).map((item) => new Uint8Array(core_1.TypedArrayEncoder.fromString(item)));
            // sign data
            proof = yield this.sign({
                verifyData,
                document,
                proof,
                documentLoader,
                expansionMap,
            });
            delete proof['@context'];
            return proof;
        });
    }
    /**
     * @param options {object} options for verifying the proof.
     *
     * @returns {Promise<{object}>} Resolves with the verification result.
     */
    verifyProof(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { proof, document, documentLoader, expansionMap, purpose } = options;
            try {
                // create data to verify
                const verifyData = (yield this.createVerifyData({
                    document,
                    proof,
                    documentLoader,
                    expansionMap,
                    compactProof: false,
                })).map((item) => new Uint8Array(core_1.TypedArrayEncoder.fromString(item)));
                // fetch verification method
                const verificationMethod = yield this.getVerificationMethod({
                    proof,
                    documentLoader,
                });
                // verify signature on data
                const verified = yield this.verifySignature({
                    verifyData,
                    verificationMethod,
                    document,
                    proof,
                    documentLoader,
                    expansionMap,
                });
                if (!verified) {
                    throw new Error('Invalid signature.');
                }
                // ensure proof was performed for a valid purpose
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
                return { verified: true };
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
            delete proof[this.proofSignatureKey];
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
            const proof2 = Object.assign(Object.assign({}, proof), { '@context': document['@context'] });
            const proofStatements = yield this.createVerifyProofData(proof2, {
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
    /**
     * @param document {object} to be signed.
     * @param proof {object}
     * @param documentLoader {function}
     * @param expansionMap {function}
     */
    getVerificationMethod(_a) {
        return __awaiter(this, arguments, void 0, function* ({ proof, documentLoader, }) {
            let { verificationMethod } = proof;
            if (typeof verificationMethod === 'object' && verificationMethod !== null) {
                verificationMethod = verificationMethod.id;
            }
            if (!verificationMethod) {
                throw new Error('No "verificationMethod" found in proof.');
            }
            if (!documentLoader) {
                throw new core_1.AriesFrameworkError('Missing custom document loader. This is required for resolving verification methods.');
            }
            const { document } = yield documentLoader(verificationMethod);
            if (!document) {
                throw new Error(`Verification method ${verificationMethod} not found.`);
            }
            // ensure verification method has not been revoked
            if (document.revoked !== undefined) {
                throw new Error('The verification method has been revoked.');
            }
            return document;
        });
    }
    /**
     * @param options {SuiteSignOptions} Options for signing.
     *
     * @returns {Promise<{object}>} the proof containing the signature value.
     */
    sign(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { verifyData, proof } = options;
            if (!(this.signer && typeof this.signer.sign === 'function')) {
                throw new Error('A signer API with sign function has not been specified.');
            }
            const proofValue = yield this.signer.sign({
                data: verifyData,
            });
            proof[this.proofSignatureKey] = core_1.TypedArrayEncoder.toBase64(proofValue);
            return proof;
        });
    }
    /**
     * @param verifyData {VerifySignatureOptions} Options to verify the signature.
     *
     * @returns {Promise<boolean>}
     */
    verifySignature(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { verificationMethod, verifyData, proof } = options;
            let { verifier } = this;
            if (!verifier) {
                const key = yield this.LDKeyClass.from(verificationMethod);
                verifier = key.verifier(key, this.alg, this.type);
            }
            return yield verifier.verify({
                data: verifyData,
                signature: new Uint8Array(core_1.TypedArrayEncoder.fromBase64(proof[this.proofSignatureKey])),
            });
        });
    }
}
exports.BbsBlsSignature2020 = BbsBlsSignature2020;
BbsBlsSignature2020.proofType = [
    'BbsBlsSignature2020',
    'sec:BbsBlsSignature2020',
    'https://w3id.org/security#BbsBlsSignature2020',
];
