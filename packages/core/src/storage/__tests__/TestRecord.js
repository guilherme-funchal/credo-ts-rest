"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestRecord = void 0;
const uuid_1 = require("../../utils/uuid");
const BaseRecord_1 = require("../BaseRecord");
class TestRecord extends BaseRecord_1.BaseRecord {
    constructor(props) {
        var _a, _b, _c;
        super();
        if (props) {
            this.id = (_a = props.id) !== null && _a !== void 0 ? _a : (0, uuid_1.uuid)();
            this.createdAt = (_b = props.createdAt) !== null && _b !== void 0 ? _b : new Date();
            this.foo = props.foo;
            this._tags = (_c = props.tags) !== null && _c !== void 0 ? _c : {};
        }
    }
    getTags() {
        return this._tags;
    }
}
exports.TestRecord = TestRecord;
