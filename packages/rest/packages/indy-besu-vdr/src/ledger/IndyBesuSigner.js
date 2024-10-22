"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndyBesuSigner = void 0;
const askar_1 = require("@credo-ts/askar");
const core_1 = require("@credo-ts/core");
const ethers_1 = require("ethers");
class IndyBesuSigner {
    constructor(key, wallet) {
        this.key = key;
        this.address = (0, ethers_1.computeAddress)(`0x${core_1.TypedArrayEncoder.toHex(key.publicKey)}`);
        this.wallet = wallet;
    }
    signTransaction(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const bytesToSign = transaction.getSigningBytes();
            const signature = yield this.sign(bytesToSign);
            transaction.setSignature({
                recovery_id: signature.yParity,
                signature: (0, ethers_1.getBytes)((0, ethers_1.concat)([signature.r, signature.s])),
            });
        });
    }
    // Since the Askar library does not return a recovery ID, we have to use the Ethers library for signing.
    sign(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(this.wallet instanceof askar_1.AskarWallet)) {
                throw new core_1.CredoError('Incorrect wallete type: Indy-Besu VDR currently only support the Askar wallet');
            }
            const keyEntry = yield this.wallet.session.fetchKey({ name: this.key.publicKeyBase58 });
            if (!keyEntry) {
                throw new core_1.WalletError('Key entry not found');
            }
            const key = new ethers_1.SigningKey(keyEntry.key.secretBytes);
            const signature = key.sign(data);
            keyEntry.key.handle.free();
            return signature;
        });
    }
}
exports.IndyBesuSigner = IndyBesuSigner;
