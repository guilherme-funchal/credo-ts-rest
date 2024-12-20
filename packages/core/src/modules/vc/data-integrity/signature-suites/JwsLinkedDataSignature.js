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
exports.JwsLinkedDataSignature = void 0;
const error_1 = require("../../../../error");
const utils_1 = require("../../../../utils");
const jsonld_signatures_1 = require("../libraries/jsonld-signatures");
const LinkedDataSignature = jsonld_signatures_1.suites.LinkedDataSignature;
class JwsLinkedDataSignature extends LinkedDataSignature {
    /**
     * @param options - Options hashmap.
     * @param options.type - Provided by subclass.
     * @param options.alg - JWS alg provided by subclass.
     * @param [options.LDKeyClass] - Provided by subclass or subclass
     *   overrides `getVerificationMethod`.
     *
     * Either a `key` OR at least one of `signer`/`verifier` is required.
     *
     * @param [options.key] - An optional key object (containing an
     *   `id` property, and either `signer` or `verifier`, depending on the
     *   intended operation. Useful for when the application is managing keys
     *   itself (when using a KMS, you never have access to the private key,
     *   and so should use the `signer` param instead).
     *
     * Advanced optional parameters and overrides.
     *
     * @param [options.proof] - A JSON-LD document with options to use
     *   for the `proof` node. Any other custom fields can be provided here
     *   using a context different from `security-v2`.
     * @param [options.date] - Signing date to use if not passed.
     * @param options.contextUrl - JSON-LD context url that corresponds
     *   to this signature suite. Used for enforcing suite context during the
     *   `sign()` operation.
     * @param [options.useNativeCanonize] - Whether to use a native
     *   canonize algorithm.
     */
    constructor(options) {
        super({
            type: options.type,
            LDKeyClass: options.LDKeyClass,
            contextUrl: options.contextUrl,
            key: options.key,
            signer: undefined,
            verifier: undefined,
            proof: options.proof,
            date: options.date,
            useNativeCanonize: options.useNativeCanonize,
        });
        this.alg = options.algorithm;
    }
    /**
     * @param options - Options hashmap.
     * @param options.verifyData - The data to sign.
     * @param options.proof - A JSON-LD document with options to use
     *   for the `proof` node. Any other custom fields can be provided here
     *   using a context different from `security-v2`.
     *
     * @returns The proof containing the signature value.
     */
    sign(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(this.signer && typeof this.signer.sign === 'function')) {
                throw new Error('A signer API has not been specified.');
            }
            // JWS header
            const header = {
                alg: this.alg,
                b64: false,
                crit: ['b64'],
            };
            /*
            +-------+-----------------------------------------------------------+
            | "b64" | JWS Signing Input Formula                                 |
            +-------+-----------------------------------------------------------+
            | true  | ASCII(BASE64URL(UTF8(JWS Protected Header)) || '.' ||     |
            |       | BASE64URL(JWS Payload))                                   |
            |       |                                                           |
            | false | ASCII(BASE64URL(UTF8(JWS Protected Header)) || '.') ||    |
            |       | JWS Payload                                               |
            +-------+-----------------------------------------------------------+
            */
            // create JWS data and sign
            const encodedHeader = utils_1.JsonEncoder.toBase64URL(header);
            const data = _createJws({ encodedHeader, verifyData: options.verifyData });
            const signature = yield this.signer.sign({ data });
            // create detached content signature
            const encodedSignature = utils_1.TypedArrayEncoder.toBase64URL(signature);
            options.proof.jws = encodedHeader + '..' + encodedSignature;
            return options.proof;
        });
    }
    /**
     * @param options - Options hashmap.
     * @param options.verifyData - The data to verify.
     * @param options.verificationMethod - A verification method.
     * @param options.proof - The proof to be verified.
     *
     * @returns Resolves with the verification result.
     */
    verifySignature(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(options.proof.jws && typeof options.proof.jws === 'string' && options.proof.jws.includes('.'))) {
                throw new TypeError('The proof does not include a valid "jws" property.');
            }
            // add payload into detached content signature
            const [encodedHeader /*payload*/, , encodedSignature] = options.proof.jws.split('.');
            let header;
            try {
                header = utils_1.JsonEncoder.fromBase64(encodedHeader);
            }
            catch (e) {
                throw new Error('Could not parse JWS header; ' + e);
            }
            if (!(header && typeof header === 'object')) {
                throw new Error('Invalid JWS header.');
            }
            // confirm header matches all expectations
            if (!(header.alg === this.alg &&
                header.b64 === false &&
                Array.isArray(header.crit) &&
                header.crit.length === 1 &&
                header.crit[0] === 'b64') &&
                Object.keys(header).length === 3) {
                throw new Error(`Invalid JWS header parameters for ${this.type}.`);
            }
            // do signature verification
            const signature = utils_1.TypedArrayEncoder.fromBase64(encodedSignature);
            const data = _createJws({ encodedHeader, verifyData: options.verifyData });
            let { verifier } = this;
            if (!verifier) {
                const key = yield this.LDKeyClass.from(options.verificationMethod);
                verifier = key.verifier();
            }
            return verifier.verify({ data, signature });
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
                throw new error_1.AriesFrameworkError('Missing custom document loader. This is required for resolving verification methods.');
            }
            const { document } = yield options.documentLoader(verificationMethod);
            verificationMethod = typeof document === 'string' ? JSON.parse(document) : document;
            yield this.assertVerificationMethod(verificationMethod);
            return verificationMethod;
        });
    }
    /**
     * Checks whether a given proof exists in the document.
     *
     * @param options - Options hashmap.
     * @param options.proof - A proof.
     * @param options.document - A JSON-LD document.
     * @param options.purpose - A jsonld-signatures ProofPurpose
     *  instance (e.g. AssertionProofPurpose, AuthenticationProofPurpose, etc).
     * @param options.documentLoader  - A secure document loader (it is
     *   recommended to use one that provides static known documents, instead of
     *   fetching from the web) for returning contexts, controller documents,
     *   keys, and other relevant URLs needed for the proof.
     * @param [options.expansionMap] - A custom expansion map that is
     *   passed to the JSON-LD processor; by default a function that will throw
     *   an error when unmapped properties are detected in the input, use `false`
     *   to turn this off and allow unmapped properties to be dropped or use a
     *   custom function.
     *
     * @returns Whether a match for the proof was found.
     */
    matchProof(options) {
        const _super = Object.create(null, {
            matchProof: { get: () => super.matchProof }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const proofMatches = yield _super.matchProof.call(this, {
                proof: options.proof,
                document: options.document,
                purpose: options.purpose,
                documentLoader: options.documentLoader,
                expansionMap: options.expansionMap,
            });
            if (!proofMatches) {
                return false;
            }
            // NOTE: When subclassing this suite: Extending suites will need to check
            if (!this.key) {
                // no key specified, so assume this suite matches and it can be retrieved
                return true;
            }
            const { verificationMethod } = options.proof;
            // only match if the key specified matches the one in the proof
            if (typeof verificationMethod === 'object') {
                return verificationMethod.id === this.key.id;
            }
            return verificationMethod === this.key.id;
        });
    }
}
exports.JwsLinkedDataSignature = JwsLinkedDataSignature;
/**
 * Creates the bytes ready for signing.
 *
 * @param {object} options -  Options hashmap.
 * @param {string} options.encodedHeader - A base64url encoded JWT header.
 * @param {Uint8Array} options.verifyData - Payload to sign/verify.
 * @returns {Uint8Array} A combined byte array for signing.
 */
function _createJws(options) {
    const encodedHeaderBytes = utils_1.TypedArrayEncoder.fromString(options.encodedHeader + '.');
    // concatenate the two uint8arrays
    const data = new Uint8Array(encodedHeaderBytes.length + options.verifyData.length);
    data.set(encodedHeaderBytes, 0);
    data.set(options.verifyData, encodedHeaderBytes.length);
    return data;
}
