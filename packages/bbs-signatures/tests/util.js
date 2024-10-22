"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.describeSkipNode17And18 = describeSkipNode17And18;
function describeSkipNode17And18(...parameters) {
    const version = process.version;
    if (version.startsWith('v17.') || version.startsWith('v18.')) {
        describe.skip(...parameters);
    }
    else {
        describe(...parameters);
    }
}
