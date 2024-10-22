"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantRecord = void 0;
const core_1 = require("@aries-framework/core");
class TenantRecord extends core_1.BaseRecord {
    constructor(props) {
        var _a, _b, _c;
        super();
        this.type = TenantRecord.type;
        if (props) {
            this.id = (_a = props.id) !== null && _a !== void 0 ? _a : core_1.utils.uuid();
            this.createdAt = (_b = props.createdAt) !== null && _b !== void 0 ? _b : new Date();
            this._tags = (_c = props.tags) !== null && _c !== void 0 ? _c : {};
            this.config = props.config;
        }
    }
    getTags() {
        return Object.assign({}, this._tags);
    }
}
exports.TenantRecord = TenantRecord;
TenantRecord.type = 'TenantRecord';
