"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bls12381g2SigningProvider = void 0;
const core_1 = require("@aries-framework/core");
const bbs_signatures_1 = require("@mattrglobal/bbs-signatures");
/**
 * This will be extracted to the bbs package.
 */
let Bls12381g2SigningProvider = (() => {
    let _classDecorators = [(0, core_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var Bls12381g2SigningProvider = _classThis = class {
        constructor() {
            this.keyType = core_1.KeyType.Bls12381g2;
        }
        /**
         * Create a KeyPair with type Bls12381g2
         *
         * @throws {SigningProviderError} When a key could not be created
         */
        createKeyPair(_a) {
            return __awaiter(this, arguments, void 0, function* ({ seed, privateKey }) {
                if (privateKey) {
                    throw new core_1.SigningProviderError('Cannot create keypair from private key');
                }
                const blsKeyPair = yield (0, bbs_signatures_1.generateBls12381G2KeyPair)(seed);
                return {
                    keyType: core_1.KeyType.Bls12381g2,
                    publicKeyBase58: core_1.TypedArrayEncoder.toBase58(blsKeyPair.publicKey),
                    privateKeyBase58: core_1.TypedArrayEncoder.toBase58(blsKeyPair.secretKey),
                };
            });
        }
        /**
         * Sign an arbitrary amount of messages, in byte form, with a keypair
         *
         * @param messages Buffer[] List of messages in Buffer form
         * @param publicKey Buffer Publickey required for the signing process
         * @param privateKey Buffer PrivateKey required for the signing process
         *
         * @returns A Buffer containing the signature of the messages
         *
         * @throws {SigningProviderError} When there are no supplied messages
         */
        sign(_a) {
            return __awaiter(this, arguments, void 0, function* ({ data, publicKeyBase58, privateKeyBase58 }) {
                if (data.length === 0)
                    throw new core_1.SigningProviderError('Unable to create a signature without any messages');
                // Check if it is a single message or list and if it is a single message convert it to a list
                const normalizedMessages = (core_1.TypedArrayEncoder.isTypedArray(data) ? [data] : data);
                // Get the Uint8Array variant of all the messages
                const messageBuffers = normalizedMessages.map((m) => Uint8Array.from(m));
                const publicKey = core_1.TypedArrayEncoder.fromBase58(publicKeyBase58);
                const privateKey = core_1.TypedArrayEncoder.fromBase58(privateKeyBase58);
                const bbsKeyPair = yield (0, bbs_signatures_1.bls12381toBbs)({
                    keyPair: { publicKey: Uint8Array.from(publicKey), secretKey: Uint8Array.from(privateKey) },
                    messageCount: normalizedMessages.length,
                });
                // Sign the messages via the keyPair
                const signature = yield (0, bbs_signatures_1.sign)({
                    keyPair: bbsKeyPair,
                    messages: messageBuffers,
                });
                // Convert the Uint8Array signature to a Buffer type
                return core_1.Buffer.from(signature);
            });
        }
        /**
         * Verify an arbitrary amount of messages with their signature created with their key pair
         *
         * @param publicKey Buffer The public key used to sign the messages
         * @param messages Buffer[] The messages that have to be verified if they are signed
         * @param signature Buffer The signature that has to be verified if it was created with the messages and public key
         *
         * @returns A boolean whether the signature is create with the public key over the messages
         *
         * @throws {SigningProviderError} When the message list is empty
         * @throws {SigningProviderError} When the verification process failed
         */
        verify(_a) {
            return __awaiter(this, arguments, void 0, function* ({ data, publicKeyBase58, signature }) {
                if (data.length === 0)
                    throw new core_1.SigningProviderError('Unable to create a signature without any messages');
                // Check if it is a single message or list and if it is a single message convert it to a list
                const normalizedMessages = (core_1.TypedArrayEncoder.isTypedArray(data) ? [data] : data);
                const publicKey = core_1.TypedArrayEncoder.fromBase58(publicKeyBase58);
                // Get the Uint8Array variant of all the messages
                const messageBuffers = normalizedMessages.map((m) => Uint8Array.from(m));
                const bbsKeyPair = yield (0, bbs_signatures_1.bls12381toBbs)({
                    keyPair: { publicKey: Uint8Array.from(publicKey) },
                    messageCount: normalizedMessages.length,
                });
                // Verify the signature against the messages with their public key
                const { verified, error } = yield (0, bbs_signatures_1.verify)({ signature, messages: messageBuffers, publicKey: bbsKeyPair.publicKey });
                // If the messages could not be verified and an error occurred
                if (!verified && error) {
                    throw new core_1.SigningProviderError(`Could not verify the signature against the messages: ${error}`);
                }
                return verified;
            });
        }
    };
    __setFunctionName(_classThis, "Bls12381g2SigningProvider");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Bls12381g2SigningProvider = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Bls12381g2SigningProvider = _classThis;
})();
exports.Bls12381g2SigningProvider = Bls12381g2SigningProvider;
