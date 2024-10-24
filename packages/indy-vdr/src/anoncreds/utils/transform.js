"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.anonCredsRevocationStatusListFromIndyVdr = anonCredsRevocationStatusListFromIndyVdr;
function anonCredsRevocationStatusListFromIndyVdr(revocationRegistryDefinitionId, revocationRegistryDefinition, delta, timestamp, isIssuanceByDefault) {
    var _a, _b;
    // 0 means unrevoked, 1 means revoked
    const defaultState = isIssuanceByDefault ? 0 : 1;
    // Fill with default value
    const revocationList = new Array(revocationRegistryDefinition.value.maxCredNum).fill(defaultState);
    // Set all `issuer` indexes to 0 (not revoked)
    for (const issued of (_a = delta.issued) !== null && _a !== void 0 ? _a : []) {
        revocationList[issued] = 0;
    }
    // Set all `revoked` indexes to 1 (revoked)
    for (const revoked of (_b = delta.revoked) !== null && _b !== void 0 ? _b : []) {
        revocationList[revoked] = 1;
    }
    return {
        issuerId: revocationRegistryDefinition.issuerId,
        currentAccumulator: delta.accum,
        revRegDefId: revocationRegistryDefinitionId,
        revocationList,
        timestamp,
    };
}
