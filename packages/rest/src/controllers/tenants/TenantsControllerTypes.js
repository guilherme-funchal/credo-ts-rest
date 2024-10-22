"use strict";
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
exports.tenantRecordToApiModel = tenantRecordToApiModel;
function tenantRecordToApiModel(record) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _a = record.config, { walletConfig: _ } = _a, config = __rest(_a, ["walletConfig"]);
    return {
        // Base Record
        id: record.id,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        type: record.type,
        storageVersion: record.storageVersion,
        config,
    };
}
