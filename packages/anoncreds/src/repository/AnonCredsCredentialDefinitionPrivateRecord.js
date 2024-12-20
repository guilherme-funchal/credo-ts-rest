"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsCredentialDefinitionPrivateRecord = void 0;
const core_1 = require("@aries-framework/core");
class AnonCredsCredentialDefinitionPrivateRecord extends core_1.BaseRecord {
    constructor(props) {
        var _a;
        super();
        this.type = AnonCredsCredentialDefinitionPrivateRecord.type;
        if (props) {
            this.id = (_a = props.id) !== null && _a !== void 0 ? _a : core_1.utils.uuid();
            this.credentialDefinitionId = props.credentialDefinitionId;
            this.value = props.value;
        }
    }
    getTags() {
        return Object.assign(Object.assign({}, this._tags), { credentialDefinitionId: this.credentialDefinitionId });
    }
}
exports.AnonCredsCredentialDefinitionPrivateRecord = AnonCredsCredentialDefinitionPrivateRecord;
AnonCredsCredentialDefinitionPrivateRecord.type = 'AnonCredsCredentialDefinitionPrivateRecord';
