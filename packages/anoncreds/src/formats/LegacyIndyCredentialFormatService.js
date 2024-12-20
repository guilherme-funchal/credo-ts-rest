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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegacyIndyCredentialFormatService = void 0;
const core_1 = require("@aries-framework/core");
const error_1 = require("../error");
const AnonCredsCredentialProposal_1 = require("../models/AnonCredsCredentialProposal");
const services_1 = require("../services");
const AnonCredsRegistryService_1 = require("../services/registry/AnonCredsRegistryService");
const credential_1 = require("../utils/credential");
const indyIdentifiers_1 = require("../utils/indyIdentifiers");
const metadata_1 = require("../utils/metadata");
const proverDid_1 = require("../utils/proverDid");
const INDY_CRED_ABSTRACT = 'hlindy/cred-abstract@v2.0';
const INDY_CRED_REQUEST = 'hlindy/cred-req@v2.0';
const INDY_CRED_FILTER = 'hlindy/cred-filter@v2.0';
const INDY_CRED = 'hlindy/cred@v2.0';
class LegacyIndyCredentialFormatService {
    constructor() {
        /** formatKey is the key used when calling agent.credentials.xxx with credentialFormats.indy */
        this.formatKey = 'indy';
        /**
         * credentialRecordType is the type of record that stores the credential. It is stored in the credential
         * record binding in the credential exchange record.
         */
        this.credentialRecordType = 'anoncreds';
    }
    /**
     * Create a {@link AttachmentFormats} object dependent on the message type.
     *
     * @param options The object containing all the options for the proposed credential
     * @returns object containing associated attachment, format and optionally the credential preview
     *
     */
    createProposal(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { credentialFormats, credentialRecord }) {
            const format = new core_1.CredentialFormatSpec({
                format: INDY_CRED_FILTER,
            });
            const indyFormat = credentialFormats.indy;
            if (!indyFormat) {
                throw new core_1.AriesFrameworkError('Missing indy payload in createProposal');
            }
            // We want all properties except for `attributes` and `linkedAttachments` attributes.
            // The easiest way is to destructure and use the spread operator. But that leaves the other properties unused
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { attributes, linkedAttachments } = indyFormat, indyCredentialProposal = __rest(indyFormat, ["attributes", "linkedAttachments"]);
            const proposal = new AnonCredsCredentialProposal_1.AnonCredsCredentialProposal(indyCredentialProposal);
            try {
                core_1.MessageValidator.validateSync(proposal);
            }
            catch (error) {
                throw new core_1.AriesFrameworkError(`Invalid proposal supplied: ${indyCredentialProposal} in Indy Format Service`);
            }
            const attachment = this.getFormatData(core_1.JsonTransformer.toJSON(proposal), format.attachmentId);
            const { previewAttributes } = this.getCredentialLinkedAttachments(indyFormat.attributes, indyFormat.linkedAttachments);
            // Set the metadata
            credentialRecord.metadata.set(metadata_1.AnonCredsCredentialMetadataKey, {
                schemaId: proposal.schemaId,
                credentialDefinitionId: proposal.credentialDefinitionId,
            });
            return { format, attachment, previewAttributes };
        });
    }
    processProposal(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { attachment }) {
            const proposalJson = attachment.getDataAsJson();
            core_1.JsonTransformer.fromJSON(proposalJson, AnonCredsCredentialProposal_1.AnonCredsCredentialProposal);
        });
    }
    acceptProposal(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { attachmentId, credentialFormats, credentialRecord, proposalAttachment, }) {
            var _b, _c;
            const indyFormat = credentialFormats === null || credentialFormats === void 0 ? void 0 : credentialFormats.indy;
            const proposalJson = proposalAttachment.getDataAsJson();
            const credentialDefinitionId = (_b = indyFormat === null || indyFormat === void 0 ? void 0 : indyFormat.credentialDefinitionId) !== null && _b !== void 0 ? _b : proposalJson.cred_def_id;
            const attributes = (_c = indyFormat === null || indyFormat === void 0 ? void 0 : indyFormat.attributes) !== null && _c !== void 0 ? _c : credentialRecord.credentialAttributes;
            if (!credentialDefinitionId) {
                throw new core_1.AriesFrameworkError('No credential definition id in proposal or provided as input to accept proposal method.');
            }
            if (!(0, indyIdentifiers_1.isUnqualifiedCredentialDefinitionId)(credentialDefinitionId)) {
                throw new core_1.AriesFrameworkError(`${credentialDefinitionId} is not a valid legacy indy credential definition id`);
            }
            if (!attributes) {
                throw new core_1.AriesFrameworkError('No attributes in proposal or provided as input to accept proposal method.');
            }
            const { format, attachment, previewAttributes } = yield this.createIndyOffer(agentContext, {
                credentialRecord,
                attachmentId,
                attributes,
                credentialDefinitionId,
                linkedAttachments: indyFormat === null || indyFormat === void 0 ? void 0 : indyFormat.linkedAttachments,
            });
            return { format, attachment, previewAttributes };
        });
    }
    /**
     * Create a credential attachment format for a credential request.
     *
     * @param options The object containing all the options for the credential offer
     * @returns object containing associated attachment, formats and offersAttach elements
     *
     */
    createOffer(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { credentialFormats, credentialRecord, attachmentId, }) {
            const indyFormat = credentialFormats.indy;
            if (!indyFormat) {
                throw new core_1.AriesFrameworkError('Missing indy credentialFormat data');
            }
            const { format, attachment, previewAttributes } = yield this.createIndyOffer(agentContext, {
                credentialRecord,
                attachmentId,
                attributes: indyFormat.attributes,
                credentialDefinitionId: indyFormat.credentialDefinitionId,
                linkedAttachments: indyFormat.linkedAttachments,
            });
            return { format, attachment, previewAttributes };
        });
    }
    processOffer(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { attachment, credentialRecord }) {
            agentContext.config.logger.debug(`Processing indy credential offer for credential record ${credentialRecord.id}`);
            const credOffer = attachment.getDataAsJson();
            if (!(0, indyIdentifiers_1.isUnqualifiedSchemaId)(credOffer.schema_id) || !(0, indyIdentifiers_1.isUnqualifiedCredentialDefinitionId)(credOffer.cred_def_id)) {
                throw new core_1.ProblemReportError('Invalid credential offer', {
                    problemCode: core_1.CredentialProblemReportReason.IssuanceAbandoned,
                });
            }
        });
    }
    acceptOffer(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { credentialRecord, attachmentId, offerAttachment, credentialFormats, }) {
            var _b;
            const registryService = agentContext.dependencyManager.resolve(AnonCredsRegistryService_1.AnonCredsRegistryService);
            const holderService = agentContext.dependencyManager.resolve(services_1.AnonCredsHolderServiceSymbol);
            const credentialOffer = offerAttachment.getDataAsJson();
            if (!(0, indyIdentifiers_1.isUnqualifiedCredentialDefinitionId)(credentialOffer.cred_def_id)) {
                throw new core_1.AriesFrameworkError(`${credentialOffer.cred_def_id} is not a valid legacy indy credential definition id`);
            }
            // Get credential definition
            const registry = registryService.getRegistryForIdentifier(agentContext, credentialOffer.cred_def_id);
            const { credentialDefinition, resolutionMetadata } = yield registry.getCredentialDefinition(agentContext, credentialOffer.cred_def_id);
            if (!credentialDefinition) {
                throw new error_1.AnonCredsError(`Unable to retrieve credential definition with id ${credentialOffer.cred_def_id}: ${resolutionMetadata.error} ${resolutionMetadata.message}`);
            }
            const { credentialRequest, credentialRequestMetadata } = yield holderService.createCredentialRequest(agentContext, {
                credentialOffer,
                credentialDefinition,
                linkSecretId: (_b = credentialFormats === null || credentialFormats === void 0 ? void 0 : credentialFormats.indy) === null || _b === void 0 ? void 0 : _b.linkSecretId,
                useLegacyProverDid: true,
            });
            if (!credentialRequest.prover_did) {
                // We just generate a prover did like string, as it's not used for anything and we don't need
                // to prove ownership of the did. It's deprecated in AnonCreds v1, but kept for backwards compatibility
                credentialRequest.prover_did = (0, proverDid_1.generateLegacyProverDidLikeString)();
            }
            credentialRecord.metadata.set(metadata_1.AnonCredsCredentialRequestMetadataKey, credentialRequestMetadata);
            credentialRecord.metadata.set(metadata_1.AnonCredsCredentialMetadataKey, {
                credentialDefinitionId: credentialOffer.cred_def_id,
                schemaId: credentialOffer.schema_id,
            });
            const format = new core_1.CredentialFormatSpec({
                attachmentId,
                format: INDY_CRED_REQUEST,
            });
            const attachment = this.getFormatData(credentialRequest, format.attachmentId);
            return { format, attachment };
        });
    }
    /**
     * Starting from a request is not supported for indy credentials, this method only throws an error.
     */
    createRequest() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new core_1.AriesFrameworkError('Starting from a request is not supported for indy credentials');
        });
    }
    /**
     * We don't have any models to validate an indy request object, for now this method does nothing
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    processRequest(agentContext, options) {
        return __awaiter(this, void 0, void 0, function* () {
            // not needed for Indy
        });
    }
    acceptRequest(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { credentialRecord, attachmentId, offerAttachment, requestAttachment, }) {
            // Assert credential attributes
            const credentialAttributes = credentialRecord.credentialAttributes;
            if (!credentialAttributes) {
                throw new core_1.AriesFrameworkError(`Missing required credential attribute values on credential record with id ${credentialRecord.id}`);
            }
            const anonCredsIssuerService = agentContext.dependencyManager.resolve(services_1.AnonCredsIssuerServiceSymbol);
            const credentialOffer = offerAttachment === null || offerAttachment === void 0 ? void 0 : offerAttachment.getDataAsJson();
            if (!credentialOffer)
                throw new core_1.AriesFrameworkError('Missing indy credential offer in createCredential');
            const credentialRequest = requestAttachment.getDataAsJson();
            if (!credentialRequest)
                throw new core_1.AriesFrameworkError('Missing indy credential request in createCredential');
            const { credential, credentialRevocationId } = yield anonCredsIssuerService.createCredential(agentContext, {
                credentialOffer,
                credentialRequest,
                credentialValues: (0, credential_1.convertAttributesToCredentialValues)(credentialAttributes),
            });
            if (credential.rev_reg_id) {
                credentialRecord.metadata.add(metadata_1.AnonCredsCredentialMetadataKey, {
                    credentialRevocationId: credentialRevocationId,
                    revocationRegistryId: credential.rev_reg_id,
                });
                credentialRecord.setTags({
                    anonCredsRevocationRegistryId: credential.rev_reg_id,
                    anonCredsCredentialRevocationId: credentialRevocationId,
                });
            }
            const format = new core_1.CredentialFormatSpec({
                attachmentId,
                format: INDY_CRED,
            });
            const attachment = this.getFormatData(credential, format.attachmentId);
            return { format, attachment };
        });
    }
    /**
     * Processes an incoming credential - retrieve metadata, retrieve payload and store it in the Indy wallet
     * @param options the issue credential message wrapped inside this object
     * @param credentialRecord the credential exchange record for this credential
     */
    processCredential(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { credentialRecord, attachment }) {
            const credentialRequestMetadata = credentialRecord.metadata.get(metadata_1.AnonCredsCredentialRequestMetadataKey);
            const registryService = agentContext.dependencyManager.resolve(AnonCredsRegistryService_1.AnonCredsRegistryService);
            const anonCredsHolderService = agentContext.dependencyManager.resolve(services_1.AnonCredsHolderServiceSymbol);
            if (!credentialRequestMetadata) {
                throw new core_1.AriesFrameworkError(`Missing required request metadata for credential exchange with thread id with id ${credentialRecord.id}`);
            }
            if (!credentialRecord.credentialAttributes) {
                throw new core_1.AriesFrameworkError('Missing credential attributes on credential record. Unable to check credential attributes');
            }
            const anonCredsCredential = attachment.getDataAsJson();
            const credentialDefinitionResult = yield registryService
                .getRegistryForIdentifier(agentContext, anonCredsCredential.cred_def_id)
                .getCredentialDefinition(agentContext, anonCredsCredential.cred_def_id);
            if (!credentialDefinitionResult.credentialDefinition) {
                throw new core_1.AriesFrameworkError(`Unable to resolve credential definition ${anonCredsCredential.cred_def_id}: ${credentialDefinitionResult.resolutionMetadata.error} ${credentialDefinitionResult.resolutionMetadata.message}`);
            }
            const schemaResult = yield registryService
                .getRegistryForIdentifier(agentContext, anonCredsCredential.cred_def_id)
                .getSchema(agentContext, anonCredsCredential.schema_id);
            if (!schemaResult.schema) {
                throw new core_1.AriesFrameworkError(`Unable to resolve schema ${anonCredsCredential.schema_id}: ${schemaResult.resolutionMetadata.error} ${schemaResult.resolutionMetadata.message}`);
            }
            // Resolve revocation registry if credential is revocable
            let revocationRegistryResult = null;
            if (anonCredsCredential.rev_reg_id) {
                revocationRegistryResult = yield registryService
                    .getRegistryForIdentifier(agentContext, anonCredsCredential.rev_reg_id)
                    .getRevocationRegistryDefinition(agentContext, anonCredsCredential.rev_reg_id);
                if (!revocationRegistryResult.revocationRegistryDefinition) {
                    throw new core_1.AriesFrameworkError(`Unable to resolve revocation registry definition ${anonCredsCredential.rev_reg_id}: ${revocationRegistryResult.resolutionMetadata.error} ${revocationRegistryResult.resolutionMetadata.message}`);
                }
            }
            // assert the credential values match the offer values
            const recordCredentialValues = (0, credential_1.convertAttributesToCredentialValues)(credentialRecord.credentialAttributes);
            (0, credential_1.assertCredentialValuesMatch)(anonCredsCredential.values, recordCredentialValues);
            const credentialId = yield anonCredsHolderService.storeCredential(agentContext, {
                credentialId: core_1.utils.uuid(),
                credentialRequestMetadata,
                credential: anonCredsCredential,
                credentialDefinitionId: credentialDefinitionResult.credentialDefinitionId,
                credentialDefinition: credentialDefinitionResult.credentialDefinition,
                schema: schemaResult.schema,
                revocationRegistry: (revocationRegistryResult === null || revocationRegistryResult === void 0 ? void 0 : revocationRegistryResult.revocationRegistryDefinition)
                    ? {
                        definition: revocationRegistryResult.revocationRegistryDefinition,
                        id: revocationRegistryResult.revocationRegistryDefinitionId,
                    }
                    : undefined,
            });
            // If the credential is revocable, store the revocation identifiers in the credential record
            if (anonCredsCredential.rev_reg_id) {
                const credential = yield anonCredsHolderService.getCredential(agentContext, { credentialId });
                credentialRecord.metadata.add(metadata_1.AnonCredsCredentialMetadataKey, {
                    credentialRevocationId: credential.credentialRevocationId,
                    revocationRegistryId: credential.revocationRegistryId,
                });
                credentialRecord.setTags({
                    anonCredsRevocationRegistryId: credential.revocationRegistryId,
                    anonCredsCredentialRevocationId: credential.credentialRevocationId,
                });
            }
            credentialRecord.credentials.push({
                credentialRecordType: this.credentialRecordType,
                credentialRecordId: credentialId,
            });
        });
    }
    supportsFormat(format) {
        const supportedFormats = [INDY_CRED_ABSTRACT, INDY_CRED_REQUEST, INDY_CRED_FILTER, INDY_CRED];
        return supportedFormats.includes(format);
    }
    /**
     * Gets the attachment object for a given attachmentId. We need to get out the correct attachmentId for
     * indy and then find the corresponding attachment (if there is one)
     * @param formats the formats object containing the attachmentId
     * @param messageAttachments the attachments containing the payload
     * @returns The Attachment if found or undefined
     *
     */
    getAttachment(formats, messageAttachments) {
        const supportedAttachmentIds = formats.filter((f) => this.supportsFormat(f.format)).map((f) => f.attachmentId);
        const supportedAttachment = messageAttachments.find((attachment) => supportedAttachmentIds.includes(attachment.id));
        return supportedAttachment;
    }
    deleteCredentialById(agentContext, credentialRecordId) {
        return __awaiter(this, void 0, void 0, function* () {
            const anonCredsHolderService = agentContext.dependencyManager.resolve(services_1.AnonCredsHolderServiceSymbol);
            yield anonCredsHolderService.deleteCredential(agentContext, credentialRecordId);
        });
    }
    shouldAutoRespondToProposal(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { offerAttachment, proposalAttachment }) {
            const proposalJson = proposalAttachment.getDataAsJson();
            const offerJson = offerAttachment.getDataAsJson();
            // We want to make sure the credential definition matches.
            // TODO: If no credential definition is present on the proposal, we could check whether the other fields
            // of the proposal match with the credential definition id.
            return proposalJson.cred_def_id === offerJson.cred_def_id;
        });
    }
    shouldAutoRespondToOffer(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { offerAttachment, proposalAttachment }) {
            const proposalJson = proposalAttachment.getDataAsJson();
            const offerJson = offerAttachment.getDataAsJson();
            // We want to make sure the credential definition matches.
            // TODO: If no credential definition is present on the proposal, we could check whether the other fields
            // of the proposal match with the credential definition id.
            return proposalJson.cred_def_id === offerJson.cred_def_id;
        });
    }
    shouldAutoRespondToRequest(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { offerAttachment, requestAttachment }) {
            const credentialOfferJson = offerAttachment.getDataAsJson();
            const credentialRequestJson = requestAttachment.getDataAsJson();
            return credentialOfferJson.cred_def_id === credentialRequestJson.cred_def_id;
        });
    }
    shouldAutoRespondToCredential(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { credentialRecord, requestAttachment, credentialAttachment }) {
            const credentialJson = credentialAttachment.getDataAsJson();
            const credentialRequestJson = requestAttachment.getDataAsJson();
            // make sure the credential definition matches
            if (credentialJson.cred_def_id !== credentialRequestJson.cred_def_id)
                return false;
            // If we don't have any attributes stored we can't compare so always return false.
            if (!credentialRecord.credentialAttributes)
                return false;
            const attributeValues = (0, credential_1.convertAttributesToCredentialValues)(credentialRecord.credentialAttributes);
            // check whether the values match the values in the record
            return (0, credential_1.checkCredentialValuesMatch)(attributeValues, credentialJson.values);
        });
    }
    createIndyOffer(agentContext_1, _a) {
        return __awaiter(this, arguments, void 0, function* (agentContext, { credentialRecord, attachmentId, credentialDefinitionId, attributes, linkedAttachments, }) {
            const anonCredsIssuerService = agentContext.dependencyManager.resolve(services_1.AnonCredsIssuerServiceSymbol);
            // if the proposal has an attachment Id use that, otherwise the generated id of the formats object
            const format = new core_1.CredentialFormatSpec({
                attachmentId: attachmentId,
                format: INDY_CRED_ABSTRACT,
            });
            const offer = yield anonCredsIssuerService.createCredentialOffer(agentContext, {
                credentialDefinitionId,
            });
            const { previewAttributes } = this.getCredentialLinkedAttachments(attributes, linkedAttachments);
            if (!previewAttributes) {
                throw new core_1.AriesFrameworkError('Missing required preview attributes for indy offer');
            }
            yield this.assertPreviewAttributesMatchSchemaAttributes(agentContext, offer, previewAttributes);
            credentialRecord.metadata.set(metadata_1.AnonCredsCredentialMetadataKey, {
                schemaId: offer.schema_id,
                credentialDefinitionId: offer.cred_def_id,
            });
            const attachment = this.getFormatData(offer, format.attachmentId);
            return { format, attachment, previewAttributes };
        });
    }
    assertPreviewAttributesMatchSchemaAttributes(agentContext, offer, attributes) {
        return __awaiter(this, void 0, void 0, function* () {
            const registryService = agentContext.dependencyManager.resolve(AnonCredsRegistryService_1.AnonCredsRegistryService);
            const registry = registryService.getRegistryForIdentifier(agentContext, offer.schema_id);
            const schemaResult = yield registry.getSchema(agentContext, offer.schema_id);
            if (!schemaResult.schema) {
                throw new core_1.AriesFrameworkError(`Unable to resolve schema ${offer.schema_id} from registry: ${schemaResult.resolutionMetadata.error} ${schemaResult.resolutionMetadata.message}`);
            }
            (0, credential_1.assertAttributesMatch)(schemaResult.schema, attributes);
        });
    }
    /**
     * Get linked attachments for indy format from a proposal message. This allows attachments
     * to be copied across to old style credential records
     *
     * @param options ProposeCredentialOptions object containing (optionally) the linked attachments
     * @return array of linked attachments or undefined if none present
     */
    getCredentialLinkedAttachments(attributes, linkedAttachments) {
        if (!linkedAttachments && !attributes) {
            return {};
        }
        let previewAttributes = attributes !== null && attributes !== void 0 ? attributes : [];
        let attachments;
        if (linkedAttachments) {
            // there are linked attachments so transform into the attribute field of the CredentialPreview object for
            // this proposal
            previewAttributes = (0, credential_1.createAndLinkAttachmentsToPreview)(linkedAttachments, previewAttributes);
            attachments = linkedAttachments.map((linkedAttachment) => linkedAttachment.attachment);
        }
        return { attachments, previewAttributes };
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
            data: {
                base64: core_1.JsonEncoder.toBase64(data),
            },
        });
        return attachment;
    }
}
exports.LegacyIndyCredentialFormatService = LegacyIndyCredentialFormatService;
