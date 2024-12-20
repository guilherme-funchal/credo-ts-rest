"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsCredentialRecord = void 0;
const core_1 = require("@aries-framework/core");
class AnonCredsCredentialRecord extends core_1.BaseRecord {
    constructor(props) {
        var _a;
        super();
        this.type = AnonCredsCredentialRecord.type;
        if (props) {
            this.id = (_a = props.id) !== null && _a !== void 0 ? _a : core_1.utils.uuid();
            this.credentialId = props.credentialId;
            this.credential = props.credential;
            this.credentialRevocationId = props.credentialRevocationId;
            this.linkSecretId = props.linkSecretId;
            this.methodName = props.methodName;
            this.setTags({
                issuerId: props.issuerId,
                schemaIssuerId: props.schemaIssuerId,
                schemaName: props.schemaName,
                schemaVersion: props.schemaVersion,
            });
        }
    }
    getTags() {
        const tags = Object.assign(Object.assign({}, this._tags), { credentialDefinitionId: this.credential.cred_def_id, schemaId: this.credential.schema_id, credentialId: this.credentialId, credentialRevocationId: this.credentialRevocationId, revocationRegistryId: this.credential.rev_reg_id, linkSecretId: this.linkSecretId, methodName: this.methodName });
        for (const [key, value] of Object.entries(this.credential.values)) {
            tags[`attr::${key}::value`] = value.raw;
            tags[`attr::${key}::marker`] = true;
        }
        return tags;
    }
}
exports.AnonCredsCredentialRecord = AnonCredsCredentialRecord;
AnonCredsCredentialRecord.type = 'AnonCredsCredentialRecord';
