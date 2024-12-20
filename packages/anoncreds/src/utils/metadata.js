"use strict";
// TODO: we may want to already support multiple credentials in the metadata of a credential
// record, as that's what the RFCs support. We already need to write a migration script for modules
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsCredentialRequestMetadataKey = exports.AnonCredsCredentialMetadataKey = void 0;
/**
 * Metadata key for strong metadata on an AnonCreds credential.
 *
 * MUST be used with {@link AnonCredsCredentialMetadata}
 */
exports.AnonCredsCredentialMetadataKey = '_anoncreds/credential';
/**
 * Metadata key for strong metadata on an AnonCreds credential request.
 *
 * MUST be used with {@link AnonCredsCredentialRequestMetadata}
 */
exports.AnonCredsCredentialRequestMetadataKey = '_anoncreds/credentialRequest';
