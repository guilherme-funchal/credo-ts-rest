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
exports.LegacyIndyProofFormatService = void 0;
const core_1 = require("@aries-framework/core");
const AnonCredsProofRequest_1 = require("../models/AnonCredsProofRequest");
const services_1 = require("../services");
const AnonCredsRegistryService_1 = require("../services/registry/AnonCredsRegistryService");
const utils_1 = require("../utils");
const indyIdentifiers_1 = require("../utils/indyIdentifiers");
const V2_INDY_PRESENTATION_PROPOSAL = 'hlindy/proof-req@v2.0';
const V2_INDY_PRESENTATION_REQUEST = 'hlindy/proof-req@v2.0';
const V2_INDY_PRESENTATION = 'hlindy/proof@v2.0';
class LegacyIndyProofFormatService {
    constructor() {
        this.formatKey = 'indy';
    }
    createProposal(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { attachmentId, proofFormats }) {
            var _b, _c, _d, _e;
            const format = new core_1.ProofFormatSpec({
                format: V2_INDY_PRESENTATION_PROPOSAL,
                attachmentId,
            });
            const indyFormat = proofFormats.indy;
            if (!indyFormat) {
                throw Error('Missing indy format to create proposal attachment format');
            }
            const proofRequest = (0, utils_1.createRequestFromPreview)({
                attributes: (_b = indyFormat.attributes) !== null && _b !== void 0 ? _b : [],
                predicates: (_c = indyFormat.predicates) !== null && _c !== void 0 ? _c : [],
                name: (_d = indyFormat.name) !== null && _d !== void 0 ? _d : 'Proof request',
                version: (_e = indyFormat.version) !== null && _e !== void 0 ? _e : '1.0',
                nonce: yield agentContext.wallet.generateNonce(),
            });
            const attachment = this.getFormatData(proofRequest, format.attachmentId);
            return { attachment, format };
        });
    }
    processProposal(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { attachment }) {
            const proposalJson = attachment.getDataAsJson();
            // fromJson also validates
            core_1.JsonTransformer.fromJSON(proposalJson, AnonCredsProofRequest_1.AnonCredsProofRequest);
            // Assert attribute and predicate (group) names do not match
            (0, utils_1.assertNoDuplicateGroupsNamesInProofRequest)(proposalJson);
        });
    }
    acceptProposal(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { proposalAttachment, attachmentId }) {
            const format = new core_1.ProofFormatSpec({
                format: V2_INDY_PRESENTATION_REQUEST,
                attachmentId,
            });
            const proposalJson = proposalAttachment.getDataAsJson();
            const request = Object.assign(Object.assign({}, proposalJson), { 
                // We never want to reuse the nonce from the proposal, as this will allow replay attacks
                nonce: yield agentContext.wallet.generateNonce() });
            const attachment = this.getFormatData(request, format.attachmentId);
            return { attachment, format };
        });
    }
    createRequest(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { attachmentId, proofFormats }) {
            var _b, _c;
            const format = new core_1.ProofFormatSpec({
                format: V2_INDY_PRESENTATION_REQUEST,
                attachmentId,
            });
            const indyFormat = proofFormats.indy;
            if (!indyFormat) {
                throw Error('Missing indy format in create request attachment format');
            }
            const request = {
                name: indyFormat.name,
                version: indyFormat.version,
                nonce: yield agentContext.wallet.generateNonce(),
                requested_attributes: (_b = indyFormat.requested_attributes) !== null && _b !== void 0 ? _b : {},
                requested_predicates: (_c = indyFormat.requested_predicates) !== null && _c !== void 0 ? _c : {},
                non_revoked: indyFormat.non_revoked,
            };
            // Assert attribute and predicate (group) names do not match
            (0, utils_1.assertNoDuplicateGroupsNamesInProofRequest)(request);
            const attachment = this.getFormatData(request, format.attachmentId);
            return { attachment, format };
        });
    }
    processRequest(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { attachment }) {
            const requestJson = attachment.getDataAsJson();
            // fromJson also validates
            core_1.JsonTransformer.fromJSON(requestJson, AnonCredsProofRequest_1.AnonCredsProofRequest);
            // Assert attribute and predicate (group) names do not match
            (0, utils_1.assertNoDuplicateGroupsNamesInProofRequest)(requestJson);
        });
    }
    acceptRequest(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { proofFormats, requestAttachment, attachmentId }) {
            const format = new core_1.ProofFormatSpec({
                format: V2_INDY_PRESENTATION,
                attachmentId,
            });
            const requestJson = requestAttachment.getDataAsJson();
            const indyFormat = proofFormats === null || proofFormats === void 0 ? void 0 : proofFormats.indy;
            const selectedCredentials = indyFormat !== null && indyFormat !== void 0 ? indyFormat : (yield this._selectCredentialsForRequest(agentContext, requestJson, {
                filterByNonRevocationRequirements: true,
            }));
            const proof = yield this.createProof(agentContext, requestJson, selectedCredentials);
            const attachment = this.getFormatData(proof, format.attachmentId);
            return {
                attachment,
                format,
            };
        });
    }
    processPresentation(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { requestAttachment, attachment }) {
            var _b;
            const verifierService = agentContext.dependencyManager.resolve(services_1.AnonCredsVerifierServiceSymbol);
            const proofRequestJson = requestAttachment.getDataAsJson();
            // NOTE: we don't do validation here, as this is handled by the AnonCreds implementation, however
            // this can lead to confusing error messages. We should consider doing validation here as well.
            // Defining a class-transformer/class-validator class seems a bit overkill, and the usage of interfaces
            // for the anoncreds package keeps things simple. Maybe we can try to use something like zod to validate
            const proofJson = attachment.getDataAsJson();
            for (const [referent, attribute] of Object.entries(proofJson.requested_proof.revealed_attrs)) {
                if (!(0, utils_1.checkValidCredentialValueEncoding)(attribute.raw, attribute.encoded)) {
                    throw new core_1.AriesFrameworkError(`The encoded value for '${referent}' is invalid. ` +
                        `Expected '${(0, utils_1.encodeCredentialValue)(attribute.raw)}'. ` +
                        `Actual '${attribute.encoded}'`);
                }
            }
            for (const [, attributeGroup] of Object.entries((_b = proofJson.requested_proof.revealed_attr_groups) !== null && _b !== void 0 ? _b : {})) {
                for (const [attributeName, attribute] of Object.entries(attributeGroup.values)) {
                    if (!(0, utils_1.checkValidCredentialValueEncoding)(attribute.raw, attribute.encoded)) {
                        throw new core_1.AriesFrameworkError(`The encoded value for '${attributeName}' is invalid. ` +
                            `Expected '${(0, utils_1.encodeCredentialValue)(attribute.raw)}'. ` +
                            `Actual '${attribute.encoded}'`);
                    }
                }
            }
            // TODO: pre verify proof json
            // I'm not 100% sure how much indy does. Also if it checks whether the proof requests matches the proof
            // @see https://github.com/hyperledger/aries-cloudagent-python/blob/master/aries_cloudagent/indy/sdk/verifier.py#L79-L164
            const schemas = yield this.getSchemas(agentContext, new Set(proofJson.identifiers.map((i) => i.schema_id)));
            const credentialDefinitions = yield this.getCredentialDefinitions(agentContext, new Set(proofJson.identifiers.map((i) => i.cred_def_id)));
            const revocationRegistries = yield (0, utils_1.getRevocationRegistriesForProof)(agentContext, proofJson);
            return yield verifierService.verifyProof(agentContext, {
                proofRequest: proofRequestJson,
                proof: proofJson,
                schemas,
                credentialDefinitions,
                revocationRegistries,
            });
        });
    }
    getCredentialsForRequest(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { requestAttachment, proofFormats }) {
            var _b;
            const proofRequestJson = requestAttachment.getDataAsJson();
            // Set default values
            const { filterByNonRevocationRequirements = true } = (_b = proofFormats === null || proofFormats === void 0 ? void 0 : proofFormats.indy) !== null && _b !== void 0 ? _b : {};
            const credentialsForRequest = yield this._getCredentialsForRequest(agentContext, proofRequestJson, {
                filterByNonRevocationRequirements,
            });
            return credentialsForRequest;
        });
    }
    selectCredentialsForRequest(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { requestAttachment, proofFormats }) {
            var _b;
            const proofRequestJson = requestAttachment.getDataAsJson();
            // Set default values
            const { filterByNonRevocationRequirements = true } = (_b = proofFormats === null || proofFormats === void 0 ? void 0 : proofFormats.indy) !== null && _b !== void 0 ? _b : {};
            const selectedCredentials = this._selectCredentialsForRequest(agentContext, proofRequestJson, {
                filterByNonRevocationRequirements,
            });
            return selectedCredentials;
        });
    }
    shouldAutoRespondToProposal(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { proposalAttachment, requestAttachment }) {
            const proposalJson = proposalAttachment.getDataAsJson();
            const requestJson = requestAttachment.getDataAsJson();
            const areRequestsEqual = (0, utils_1.areAnonCredsProofRequestsEqual)(proposalJson, requestJson);
            agentContext.config.logger.debug(`AnonCreds request and proposal are are equal: ${areRequestsEqual}`, {
                proposalJson,
                requestJson,
            });
            return areRequestsEqual;
        });
    }
    shouldAutoRespondToRequest(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { proposalAttachment, requestAttachment }) {
            const proposalJson = proposalAttachment.getDataAsJson();
            const requestJson = requestAttachment.getDataAsJson();
            return (0, utils_1.areAnonCredsProofRequestsEqual)(proposalJson, requestJson);
        });
    }
    shouldAutoRespondToPresentation(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _agentContext, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options) {
        return __awaiter(this, void 0, void 0, function* () {
            // The presentation is already verified in processPresentation, so we can just return true here.
            // It's only an ack, so it's just that we received the presentation.
            return true;
        });
    }
    supportsFormat(formatIdentifier) {
        const supportedFormats = [V2_INDY_PRESENTATION_PROPOSAL, V2_INDY_PRESENTATION_REQUEST, V2_INDY_PRESENTATION];
        return supportedFormats.includes(formatIdentifier);
    }
    _getCredentialsForRequest(agentContext, proofRequest, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const credentialsForProofRequest = {
                attributes: {},
                predicates: {},
            };
            for (const [referent, requestedAttribute] of Object.entries(proofRequest.requested_attributes)) {
                const credentials = yield this.getCredentialsForProofRequestReferent(agentContext, proofRequest, referent);
                credentialsForProofRequest.attributes[referent] = (0, utils_1.sortRequestedCredentialsMatches)(yield Promise.all(credentials.map((credential) => __awaiter(this, void 0, void 0, function* () {
                    const { isRevoked, timestamp } = yield this.getRevocationStatus(agentContext, proofRequest, requestedAttribute, credential.credentialInfo);
                    return {
                        credentialId: credential.credentialInfo.credentialId,
                        revealed: true,
                        credentialInfo: credential.credentialInfo,
                        timestamp,
                        revoked: isRevoked,
                    };
                }))));
                // We only attach revoked state if non-revocation is requested. So if revoked is true it means
                // the credential is not applicable to the proof request
                if (options.filterByNonRevocationRequirements) {
                    credentialsForProofRequest.attributes[referent] = credentialsForProofRequest.attributes[referent].filter((r) => !r.revoked);
                }
            }
            for (const [referent, requestedPredicate] of Object.entries(proofRequest.requested_predicates)) {
                const credentials = yield this.getCredentialsForProofRequestReferent(agentContext, proofRequest, referent);
                credentialsForProofRequest.predicates[referent] = (0, utils_1.sortRequestedCredentialsMatches)(yield Promise.all(credentials.map((credential) => __awaiter(this, void 0, void 0, function* () {
                    const { isRevoked, timestamp } = yield this.getRevocationStatus(agentContext, proofRequest, requestedPredicate, credential.credentialInfo);
                    return {
                        credentialId: credential.credentialInfo.credentialId,
                        credentialInfo: credential.credentialInfo,
                        timestamp,
                        revoked: isRevoked,
                    };
                }))));
                // We only attach revoked state if non-revocation is requested. So if revoked is true it means
                // the credential is not applicable to the proof request
                if (options.filterByNonRevocationRequirements) {
                    credentialsForProofRequest.predicates[referent] = credentialsForProofRequest.predicates[referent].filter((r) => !r.revoked);
                }
            }
            return credentialsForProofRequest;
        });
    }
    _selectCredentialsForRequest(agentContext, proofRequest, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const credentialsForRequest = yield this._getCredentialsForRequest(agentContext, proofRequest, options);
            const selectedCredentials = {
                attributes: {},
                predicates: {},
                selfAttestedAttributes: {},
            };
            Object.keys(credentialsForRequest.attributes).forEach((attributeName) => {
                const attributeArray = credentialsForRequest.attributes[attributeName];
                if (attributeArray.length === 0) {
                    throw new core_1.AriesFrameworkError('Unable to automatically select requested attributes.');
                }
                selectedCredentials.attributes[attributeName] = attributeArray[0];
            });
            Object.keys(credentialsForRequest.predicates).forEach((attributeName) => {
                if (credentialsForRequest.predicates[attributeName].length === 0) {
                    throw new core_1.AriesFrameworkError('Unable to automatically select requested predicates.');
                }
                else {
                    selectedCredentials.predicates[attributeName] = credentialsForRequest.predicates[attributeName][0];
                }
            });
            return selectedCredentials;
        });
    }
    getCredentialsForProofRequestReferent(agentContext, proofRequest, attributeReferent) {
        return __awaiter(this, void 0, void 0, function* () {
            const holderService = agentContext.dependencyManager.resolve(services_1.AnonCredsHolderServiceSymbol);
            const credentials = yield holderService.getCredentialsForProofRequest(agentContext, {
                proofRequest,
                attributeReferent,
            });
            return credentials;
        });
    }
    /**
     * Build schemas object needed to create and verify proof objects.
     *
     * Creates object with `{ schemaId: AnonCredsSchema }` mapping
     *
     * @param schemaIds List of schema ids
     * @returns Object containing schemas for specified schema ids
     *
     */
    getSchemas(agentContext, schemaIds) {
        return __awaiter(this, void 0, void 0, function* () {
            const registryService = agentContext.dependencyManager.resolve(AnonCredsRegistryService_1.AnonCredsRegistryService);
            const schemas = {};
            for (const schemaId of schemaIds) {
                if (!(0, indyIdentifiers_1.isUnqualifiedSchemaId)(schemaId)) {
                    throw new core_1.AriesFrameworkError(`${schemaId} is not a valid legacy indy schema id`);
                }
                const schemaRegistry = registryService.getRegistryForIdentifier(agentContext, schemaId);
                const schemaResult = yield schemaRegistry.getSchema(agentContext, schemaId);
                if (!schemaResult.schema) {
                    throw new core_1.AriesFrameworkError(`Schema not found for id ${schemaId}: ${schemaResult.resolutionMetadata.message}`);
                }
                schemas[schemaId] = schemaResult.schema;
            }
            return schemas;
        });
    }
    /**
     * Build credential definitions object needed to create and verify proof objects.
     *
     * Creates object with `{ credentialDefinitionId: AnonCredsCredentialDefinition }` mapping
     *
     * @param credentialDefinitionIds List of credential definition ids
     * @returns Object containing credential definitions for specified credential definition ids
     *
     */
    getCredentialDefinitions(agentContext, credentialDefinitionIds) {
        return __awaiter(this, void 0, void 0, function* () {
            const registryService = agentContext.dependencyManager.resolve(AnonCredsRegistryService_1.AnonCredsRegistryService);
            const credentialDefinitions = {};
            for (const credentialDefinitionId of credentialDefinitionIds) {
                if (!(0, indyIdentifiers_1.isUnqualifiedCredentialDefinitionId)(credentialDefinitionId)) {
                    throw new core_1.AriesFrameworkError(`${credentialDefinitionId} is not a valid legacy indy credential definition id`);
                }
                const credentialDefinitionRegistry = registryService.getRegistryForIdentifier(agentContext, credentialDefinitionId);
                const credentialDefinitionResult = yield credentialDefinitionRegistry.getCredentialDefinition(agentContext, credentialDefinitionId);
                if (!credentialDefinitionResult.credentialDefinition) {
                    throw new core_1.AriesFrameworkError(`Credential definition not found for id ${credentialDefinitionId}: ${credentialDefinitionResult.resolutionMetadata.message}`);
                }
                credentialDefinitions[credentialDefinitionId] = credentialDefinitionResult.credentialDefinition;
            }
            return credentialDefinitions;
        });
    }
    getRevocationStatus(agentContext, proofRequest, requestedItem, credentialInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const requestNonRevoked = (_a = requestedItem.non_revoked) !== null && _a !== void 0 ? _a : proofRequest.non_revoked;
            const credentialRevocationId = credentialInfo.credentialRevocationId;
            const revocationRegistryId = credentialInfo.revocationRegistryId;
            // If revocation interval is not present or the credential is not revocable then we
            // don't need to fetch the revocation status
            if (!requestNonRevoked || !credentialRevocationId || !revocationRegistryId) {
                return { isRevoked: undefined, timestamp: undefined };
            }
            agentContext.config.logger.trace(`Fetching credential revocation status for credential revocation id '${credentialRevocationId}' with revocation interval with from '${requestNonRevoked.from}' and to '${requestNonRevoked.to}'`);
            // Make sure the revocation interval follows best practices from Aries RFC 0441
            (0, utils_1.assertBestPracticeRevocationInterval)(requestNonRevoked);
            const registryService = agentContext.dependencyManager.resolve(AnonCredsRegistryService_1.AnonCredsRegistryService);
            const registry = registryService.getRegistryForIdentifier(agentContext, revocationRegistryId);
            const revocationStatusResult = yield registry.getRevocationStatusList(agentContext, revocationRegistryId, (_b = requestNonRevoked.to) !== null && _b !== void 0 ? _b : Date.now());
            if (!revocationStatusResult.revocationStatusList) {
                throw new core_1.AriesFrameworkError(`Could not retrieve revocation status list for revocation registry ${revocationRegistryId}: ${revocationStatusResult.resolutionMetadata.message}`);
            }
            // Item is revoked when the value at the index is 1
            const isRevoked = revocationStatusResult.revocationStatusList.revocationList[parseInt(credentialRevocationId)] === 1;
            agentContext.config.logger.trace(`Credential with credential revocation index '${credentialRevocationId}' is ${isRevoked ? '' : 'not '}revoked with revocation interval with to '${requestNonRevoked.to}' & from '${requestNonRevoked.from}'`);
            return {
                isRevoked,
                timestamp: revocationStatusResult.revocationStatusList.timestamp,
            };
        });
    }
    /**
     * Create indy proof from a given proof request and requested credential object.
     *
     * @param proofRequest The proof request to create the proof for
     * @param requestedCredentials The requested credentials object specifying which credentials to use for the proof
     * @returns indy proof object
     */
    createProof(agentContext, proofRequest, selectedCredentials) {
        return __awaiter(this, void 0, void 0, function* () {
            const holderService = agentContext.dependencyManager.resolve(services_1.AnonCredsHolderServiceSymbol);
            const credentialObjects = yield Promise.all([...Object.values(selectedCredentials.attributes), ...Object.values(selectedCredentials.predicates)].map((c) => __awaiter(this, void 0, void 0, function* () { var _a; return (_a = c.credentialInfo) !== null && _a !== void 0 ? _a : holderService.getCredential(agentContext, { credentialId: c.credentialId }); })));
            const schemas = yield this.getSchemas(agentContext, new Set(credentialObjects.map((c) => c.schemaId)));
            const credentialDefinitions = yield this.getCredentialDefinitions(agentContext, new Set(credentialObjects.map((c) => c.credentialDefinitionId)));
            // selectedCredentials are overridden with specified timestamps of the revocation status list that
            // should be used for the selected credentials.
            const { revocationRegistries, updatedSelectedCredentials } = yield (0, utils_1.getRevocationRegistriesForRequest)(agentContext, proofRequest, selectedCredentials);
            return yield holderService.createProof(agentContext, {
                proofRequest,
                selectedCredentials: updatedSelectedCredentials,
                schemas,
                credentialDefinitions,
                revocationRegistries,
            });
        });
    }
    /**
     * Returns an object of type {@link Attachment} for use in credential exchange messages.
     * It looks up the correct format identifier and encodes the data as a base64 attachment.
     *
     * @param data The data to include in the attach object
     * @param id the attach id from the formats component of the message
     */
    getFormatData(data, id) {
        const attachment = new core_1.Attachment({
            id,
            mimeType: 'application/json',
            data: new core_1.AttachmentData({
                base64: core_1.JsonEncoder.toBase64(data),
            }),
        });
        return attachment;
    }
}
exports.LegacyIndyProofFormatService = LegacyIndyProofFormatService;
