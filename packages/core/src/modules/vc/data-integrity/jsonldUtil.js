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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTypeInfo = exports.getProofs = exports._includesContext = void 0;
exports.assertOnlyW3cJsonLdVerifiableCredentials = assertOnlyW3cJsonLdVerifiableCredentials;
const error_1 = require("../../../error");
const constants_1 = require("../constants");
const jsonld_1 = __importDefault(require("./libraries/jsonld"));
const W3cJsonLdVerifiableCredential_1 = require("./models/W3cJsonLdVerifiableCredential");
const _includesContext = (options) => {
    const context = options.document['@context'];
    return context === options.contextUrl || (Array.isArray(context) && context.includes(options.contextUrl));
};
exports._includesContext = _includesContext;
function assertOnlyW3cJsonLdVerifiableCredentials(credentials) {
    if (credentials.some((c) => !(c instanceof W3cJsonLdVerifiableCredential_1.W3cJsonLdVerifiableCredential))) {
        throw new error_1.AriesFrameworkError('JSON-LD VPs can only contain JSON-LD VCs');
    }
}
/*
 * The code in this file originated from
 * @see https://github.com/digitalbazaar/jsonld-signatures
 * Hence the following copyright notice applies
 *
 * Copyright (c) 2017-2018 Digital Bazaar, Inc. All rights reserved.
 */
/**
 * The property identifying the linked data proof
 * Note - this will not work for legacy systems that
 * relying on `signature`
 */
const PROOF_PROPERTY = 'proof';
/**
 * Gets a supported linked data proof from a JSON-LD Document
 * Note - unless instructed not to the document will be compacted
 * against the security v2 context @see https://w3id.org/security/v2
 *
 * @param options Options for extracting the proof from the document
 *
 * @returns {GetProofsResult} An object containing the matched proofs and the JSON-LD document
 */
const getProofs = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const { proofType, skipProofCompaction, documentLoader, expansionMap } = options;
    let { document } = options;
    let proofs;
    if (!skipProofCompaction) {
        // If we must compact the proof then we must first compact the input
        // document to find the proof
        document = yield jsonld_1.default.compact(document, constants_1.SECURITY_CONTEXT_URL, {
            documentLoader,
            expansionMap,
            compactToRelative: false,
        });
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - needed because getValues is not part of the public API.
    proofs = jsonld_1.default.getValues(document, PROOF_PROPERTY);
    delete document[PROOF_PROPERTY];
    if (typeof proofType === 'string') {
        proofs = proofs.filter((_) => _.type == proofType);
    }
    if (Array.isArray(proofType)) {
        proofs = proofs.filter((_) => proofType.includes(_.type));
    }
    proofs = proofs.map((matchedProof) => (Object.assign({ '@context': constants_1.SECURITY_CONTEXT_URL }, matchedProof)));
    return {
        proofs,
        document,
    };
});
exports.getProofs = getProofs;
/**
 * Gets the JSON-LD type information for a document
 * @param document {any} JSON-LD document to extract the type information from
 * @param options {GetTypeInfoOptions} Options for extracting the JSON-LD document
 *
 * @returns {object} Type info for the JSON-LD document
 */
const getTypeInfo = (document, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { documentLoader, expansionMap } = options;
    // determine `@type` alias, if any
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - needed because getValues is not part of the public API.
    const context = jsonld_1.default.getValues(document, '@context');
    const compacted = yield jsonld_1.default.compact({ '@type': '_:b0' }, context, {
        documentLoader,
        expansionMap,
    });
    delete compacted['@context'];
    const alias = Object.keys(compacted)[0];
    // optimize: expand only `@type` and `type` values
    /* eslint-disable prefer-const */
    let toExpand = { '@context': context };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - needed because getValues is not part of the public API.
    toExpand['@type'] = jsonld_1.default.getValues(document, '@type').concat(jsonld_1.default.getValues(document, alias));
    const expanded = (yield jsonld_1.default.expand(toExpand, { documentLoader, expansionMap }))[0] || {};
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - needed because getValues is not part of the public API.
    return { types: jsonld_1.default.getValues(expanded, '@type'), alias };
});
exports.getTypeInfo = getTypeInfo;
