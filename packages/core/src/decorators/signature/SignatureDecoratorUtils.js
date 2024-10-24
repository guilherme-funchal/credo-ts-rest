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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unpackAndVerifySignatureDecorator = unpackAndVerifySignatureDecorator;
exports.signData = signData;
const crypto_1 = require("../../crypto");
const error_1 = require("../../error");
const JsonEncoder_1 = require("../../utils/JsonEncoder");
const TypedArrayEncoder_1 = require("../../utils/TypedArrayEncoder");
const buffer_1 = require("../../utils/buffer");
const timestamp_1 = __importDefault(require("../../utils/timestamp"));
const SignatureDecorator_1 = require("./SignatureDecorator");
/**
 * Unpack and verify signed data before casting it to the supplied type.
 *
 * @param decorator Signature decorator to unpack and verify
 * @param wallet wallet instance
 *
 * @return Resulting data
 */
function unpackAndVerifySignatureDecorator(decorator, wallet) {
    return __awaiter(this, void 0, void 0, function* () {
        const signerVerkey = decorator.signer;
        const key = crypto_1.Key.fromPublicKeyBase58(signerVerkey, crypto_1.KeyType.Ed25519);
        // first 8 bytes are for 64 bit integer from unix epoch
        const signedData = TypedArrayEncoder_1.TypedArrayEncoder.fromBase64(decorator.signatureData);
        const signature = TypedArrayEncoder_1.TypedArrayEncoder.fromBase64(decorator.signature);
        // const isValid = await wallet.verify(signerVerkey, signedData, signature)
        const isValid = yield wallet.verify({ signature, data: signedData, key });
        if (!isValid) {
            throw new error_1.AriesFrameworkError('Signature is not valid');
        }
        // TODO: return Connection instance instead of raw json
        return JsonEncoder_1.JsonEncoder.fromBuffer(signedData.slice(8));
    });
}
/**
 * Sign data supplied and return a signature decorator.
 *
 * @param data the data to sign
 * @param wallet the wallet containing a key to use for signing
 * @param signerKey signers verkey
 *
 * @returns Resulting signature decorator.
 */
function signData(data, wallet, signerKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataBuffer = buffer_1.Buffer.concat([(0, timestamp_1.default)(), JsonEncoder_1.JsonEncoder.toBuffer(data)]);
        const key = crypto_1.Key.fromPublicKeyBase58(signerKey, crypto_1.KeyType.Ed25519);
        const signatureBuffer = yield wallet.sign({ key, data: dataBuffer });
        const signatureDecorator = new SignatureDecorator_1.SignatureDecorator({
            signatureType: 'https://didcomm.org/signature/1.0/ed25519Sha512_single',
            signature: TypedArrayEncoder_1.TypedArrayEncoder.toBase64URL(signatureBuffer),
            signatureData: TypedArrayEncoder_1.TypedArrayEncoder.toBase64URL(dataBuffer),
            signer: signerKey,
        });
        return signatureDecorator;
    });
}
