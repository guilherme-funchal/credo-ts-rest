"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertIndySdkWallet = assertIndySdkWallet;
const core_1 = require("@aries-framework/core");
const IndySdkWallet_1 = require("../wallet/IndySdkWallet");
function assertIndySdkWallet(wallet) {
    var _a, _b;
    if (!(wallet instanceof IndySdkWallet_1.IndySdkWallet)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const walletClassName = (_b = (_a = wallet.constructor) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : 'unknown';
        throw new core_1.AriesFrameworkError(`Expected wallet to be instance of IndySdkWallet, found ${walletClassName}`);
    }
}
