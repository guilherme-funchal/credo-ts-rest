"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeRequestForSignature = serializeRequestForSignature;
const core_1 = require("@aries-framework/core");
const ATTRIB_TYPE = '100';
const GET_ATTR_TYPE = '104';
/// Generate the normalized form of a ledger transaction request for signing
function serializeRequestForSignature(v) {
    var _a;
    const type = (_a = v === null || v === void 0 ? void 0 : v.operation) === null || _a === void 0 ? void 0 : _a.type;
    return _serializeRequestForSignature(v, true, type != undefined ? `${type}` : undefined);
}
/**
 * Serialize an indy ledger request object for signing input. Based on the rust code. Indy SDK requires ledger requests to be signed using
 * a did, however in AFJ's the wallet only creates keys, and we create custom did records. This allows us to remove the legacy createDid and
 * publicDidSeed properties from the wallet, as we create the request payload ourselves.
 *
 * @see https://github.com/hyperledger/indy-shared-rs/blob/6af1e939586d1f16341dc03b62970cf28b32d118/indy-utils/src/txn_signature.rs#L10
 */
function _serializeRequestForSignature(v, isTopLevel, _type) {
    const vType = typeof v;
    if (vType === 'boolean')
        return v ? 'True' : 'False';
    if (vType === 'number')
        return v.toString();
    if (vType === 'string')
        return v;
    if (vType === 'object') {
        if (Array.isArray(v)) {
            return v.map((element) => _serializeRequestForSignature(element, false, _type)).join(',');
        }
        let result = '';
        let inMiddle = false;
        for (const vKey of Object.keys(v).sort()) {
            // Skip signature field at top level as in python code
            if (isTopLevel && (vKey == 'signature' || vKey == 'fees' || vKey == 'signatures')) {
                continue;
            }
            if (inMiddle) {
                result += '|';
            }
            let value = v[vKey];
            if ((_type == ATTRIB_TYPE || _type == GET_ATTR_TYPE) && (vKey == 'raw' || vKey == 'hash' || vKey == 'enc')) {
                // do it only for attribute related request
                if (typeof value !== 'string')
                    throw new Error('Value must be a string for hash');
                const hash = core_1.Hasher.hash(core_1.TypedArrayEncoder.fromString(value), 'sha2-256');
                value = Buffer.from(hash).toString('hex');
            }
            result = `${result}${vKey}:${_serializeRequestForSignature(value, false, _type)}`;
            inMiddle = true;
        }
        return result;
    }
    return '';
}
