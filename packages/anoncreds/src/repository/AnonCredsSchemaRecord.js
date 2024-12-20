"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonCredsSchemaRecord = void 0;
const core_1 = require("@aries-framework/core");
const indyIdentifiers_1 = require("../utils/indyIdentifiers");
class AnonCredsSchemaRecord extends core_1.BaseRecord {
    constructor(props) {
        var _a;
        super();
        this.type = AnonCredsSchemaRecord.type;
        if (props) {
            this.id = (_a = props.id) !== null && _a !== void 0 ? _a : core_1.utils.uuid();
            this.schema = props.schema;
            this.schemaId = props.schemaId;
            this.methodName = props.methodName;
        }
    }
    getTags() {
        let unqualifiedSchemaId = undefined;
        if ((0, indyIdentifiers_1.isDidIndySchemaId)(this.schemaId)) {
            const { namespaceIdentifier, schemaName, schemaVersion } = (0, indyIdentifiers_1.parseIndySchemaId)(this.schemaId);
            unqualifiedSchemaId = (0, indyIdentifiers_1.getUnqualifiedSchemaId)(namespaceIdentifier, schemaName, schemaVersion);
        }
        return Object.assign(Object.assign({}, this._tags), { schemaId: this.schemaId, issuerId: this.schema.issuerId, schemaName: this.schema.name, schemaVersion: this.schema.version, methodName: this.methodName, unqualifiedSchemaId });
    }
}
exports.AnonCredsSchemaRecord = AnonCredsSchemaRecord;
AnonCredsSchemaRecord.type = 'AnonCredsSchemaRecord';
