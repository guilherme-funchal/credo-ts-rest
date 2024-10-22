"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maybeMapValues = maybeMapValues;
function maybeMapValues(transform, obj) {
    if (!obj) {
        return obj;
    }
    return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, transform(value)]));
}
