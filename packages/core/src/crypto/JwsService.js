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
exports.JwsService = void 0;
const error_1 = require("../error");
const plugins_1 = require("../plugins");
const utils_1 = require("../utils");
const error_2 = require("../wallet/error");
const JwsTypes_1 = require("./JwsTypes");
const jwk_1 = require("./jose/jwk");
const jwt_1 = require("./jose/jwt");
let JwsService = (() => {
    let _classDecorators = [(0, plugins_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var JwsService = _classThis = class {
        createJwsBase(agentContext, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const { jwk, alg } = options.protectedHeaderOptions;
                const keyJwk = (0, jwk_1.getJwkFromKey)(options.key);
                // Make sure the options.key and jwk from protectedHeader are the same.
                if (jwk && (jwk.key.keyType !== options.key.keyType || !jwk.key.publicKey.equals(options.key.publicKey))) {
                    throw new error_1.AriesFrameworkError(`Protected header JWK does not match key for signing.`);
                }
                // Validate the options.key used for signing against the jws options
                // We use keyJwk instead of jwk, as the user could also use kid instead of jwk
                if (keyJwk && !keyJwk.supportsSignatureAlgorithm(alg)) {
                    throw new error_1.AriesFrameworkError(`alg '${alg}' is not a valid JWA signature algorithm for this jwk with keyType ${keyJwk.keyType}. Supported algorithms are ${keyJwk.supportedSignatureAlgorithms.join(', ')}`);
                }
                const payload = options.payload instanceof jwt_1.JwtPayload ? utils_1.JsonEncoder.toBuffer(options.payload.toJson()) : options.payload;
                const base64Payload = utils_1.TypedArrayEncoder.toBase64URL(payload);
                const base64UrlProtectedHeader = utils_1.JsonEncoder.toBase64URL(this.buildProtected(options.protectedHeaderOptions));
                const signature = utils_1.TypedArrayEncoder.toBase64URL(yield agentContext.wallet.sign({
                    data: utils_1.TypedArrayEncoder.fromString(`${base64UrlProtectedHeader}.${base64Payload}`),
                    key: options.key,
                }));
                return {
                    base64Payload,
                    base64UrlProtectedHeader,
                    signature,
                };
            });
        }
        createJws(agentContext_1, _a) {
            return __awaiter(this, arguments, void 0, function* (agentContext, { payload, key, header, protectedHeaderOptions }) {
                const { base64UrlProtectedHeader, signature, base64Payload } = yield this.createJwsBase(agentContext, {
                    payload,
                    key,
                    protectedHeaderOptions,
                });
                return {
                    protected: base64UrlProtectedHeader,
                    signature,
                    header,
                    payload: base64Payload,
                };
            });
        }
        /**
         *  @see {@link https://www.rfc-editor.org/rfc/rfc7515#section-3.1}
         * */
        createJwsCompact(agentContext_1, _a) {
            return __awaiter(this, arguments, void 0, function* (agentContext, { payload, key, protectedHeaderOptions }) {
                const { base64Payload, base64UrlProtectedHeader, signature } = yield this.createJwsBase(agentContext, {
                    payload,
                    key,
                    protectedHeaderOptions,
                });
                return `${base64UrlProtectedHeader}.${base64Payload}.${signature}`;
            });
        }
        /**
         * Verify a JWS
         */
        verifyJws(agentContext_1, _a) {
            return __awaiter(this, arguments, void 0, function* (agentContext, { jws, jwkResolver }) {
                let signatures = [];
                let payload;
                if (typeof jws === 'string') {
                    if (!JwsTypes_1.JWS_COMPACT_FORMAT_MATCHER.test(jws))
                        throw new error_1.AriesFrameworkError(`Invalid JWS compact format for value '${jws}'.`);
                    const [protectedHeader, _payload, signature] = jws.split('.');
                    payload = _payload;
                    signatures.push({
                        header: {},
                        protected: protectedHeader,
                        signature,
                    });
                }
                else if ('signatures' in jws) {
                    signatures = jws.signatures;
                    payload = jws.payload;
                }
                else {
                    signatures.push(jws);
                    payload = jws.payload;
                }
                if (signatures.length === 0) {
                    throw new error_1.AriesFrameworkError('Unable to verify JWS, no signatures present in JWS.');
                }
                const signerKeys = [];
                for (const jws of signatures) {
                    const protectedJson = utils_1.JsonEncoder.fromBase64(jws.protected);
                    if (!(0, utils_1.isJsonObject)(protectedJson)) {
                        throw new error_1.AriesFrameworkError('Unable to verify JWS, protected header is not a valid JSON object.');
                    }
                    if (!protectedJson.alg || typeof protectedJson.alg !== 'string') {
                        throw new error_1.AriesFrameworkError('Unable to verify JWS, protected header alg is not provided or not a string.');
                    }
                    const jwk = yield this.jwkFromJws({
                        jws,
                        payload,
                        protectedHeader: Object.assign(Object.assign({}, protectedJson), { alg: protectedJson.alg }),
                        jwkResolver,
                    });
                    if (!jwk.supportsSignatureAlgorithm(protectedJson.alg)) {
                        throw new error_1.AriesFrameworkError(`alg '${protectedJson.alg}' is not a valid JWA signature algorithm for this jwk with keyType ${jwk.keyType}. Supported algorithms are ${jwk.supportedSignatureAlgorithms.join(', ')}`);
                    }
                    const data = utils_1.TypedArrayEncoder.fromString(`${jws.protected}.${payload}`);
                    const signature = utils_1.TypedArrayEncoder.fromBase64(jws.signature);
                    signerKeys.push(jwk.key);
                    try {
                        const isValid = yield agentContext.wallet.verify({ key: jwk.key, data, signature });
                        if (!isValid) {
                            return {
                                isValid: false,
                                signerKeys: [],
                            };
                        }
                    }
                    catch (error) {
                        // WalletError probably means signature verification failed. Would be useful to add
                        // more specific error type in wallet.verify method
                        if (error instanceof error_2.WalletError) {
                            return {
                                isValid: false,
                                signerKeys: [],
                            };
                        }
                        throw error;
                    }
                }
                return { isValid: true, signerKeys };
            });
        }
        buildProtected(options) {
            var _a;
            if (!options.jwk && !options.kid) {
                throw new error_1.AriesFrameworkError('Both JWK and kid are undefined. Please provide one or the other.');
            }
            if (options.jwk && options.kid) {
                throw new error_1.AriesFrameworkError('Both JWK and kid are provided. Please only provide one of the two.');
            }
            return Object.assign(Object.assign({}, options), { alg: options.alg, jwk: (_a = options.jwk) === null || _a === void 0 ? void 0 : _a.toJson(), kid: options.kid });
        }
        jwkFromJws(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const { protectedHeader, jwkResolver, jws, payload } = options;
                if (protectedHeader.jwk && protectedHeader.kid) {
                    throw new error_1.AriesFrameworkError('Both JWK and kid are defined in the protected header. Only one of the two is allowed.');
                }
                // Jwk
                if (protectedHeader.jwk) {
                    if (!(0, utils_1.isJsonObject)(protectedHeader.jwk))
                        throw new error_1.AriesFrameworkError('JWK is not a valid JSON object.');
                    return (0, jwk_1.getJwkFromJson)(protectedHeader.jwk);
                }
                if (!jwkResolver) {
                    throw new error_1.AriesFrameworkError(`jwkResolver is required when the JWS protected header does not contain a 'jwk' property.`);
                }
                try {
                    const jwk = yield jwkResolver({
                        jws,
                        protectedHeader,
                        payload,
                    });
                    return jwk;
                }
                catch (error) {
                    throw new error_1.AriesFrameworkError(`Error when resolving JWK for JWS in jwkResolver. ${error.message}`, {
                        cause: error,
                    });
                }
            });
        }
    };
    __setFunctionName(_classThis, "JwsService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        JwsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return JwsService = _classThis;
})();
exports.JwsService = JwsService;
