"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwaEncryptionAlgorithm = exports.JwaSignatureAlgorithm = void 0;
var JwaSignatureAlgorithm;
(function (JwaSignatureAlgorithm) {
    JwaSignatureAlgorithm["HS256"] = "HS256";
    JwaSignatureAlgorithm["HS384"] = "HS384";
    JwaSignatureAlgorithm["HS512"] = "HS512";
    JwaSignatureAlgorithm["RS256"] = "RS256";
    JwaSignatureAlgorithm["RS384"] = "RS384";
    JwaSignatureAlgorithm["RS512"] = "RS512";
    JwaSignatureAlgorithm["ES256"] = "ES256";
    JwaSignatureAlgorithm["ES384"] = "ES384";
    JwaSignatureAlgorithm["ES512"] = "ES512";
    JwaSignatureAlgorithm["PS256"] = "PS256";
    JwaSignatureAlgorithm["PS384"] = "PS384";
    JwaSignatureAlgorithm["PS512"] = "PS512";
    JwaSignatureAlgorithm["EdDSA"] = "EdDSA";
    JwaSignatureAlgorithm["None"] = "none";
})(JwaSignatureAlgorithm || (exports.JwaSignatureAlgorithm = JwaSignatureAlgorithm = {}));
var JwaEncryptionAlgorithm;
(function (JwaEncryptionAlgorithm) {
    JwaEncryptionAlgorithm["RSA15"] = "RSA1_5";
    JwaEncryptionAlgorithm["RSAOAEP"] = "RSA-OAEP";
    JwaEncryptionAlgorithm["RSAOAEP256"] = "RSA-OAEP-256";
    JwaEncryptionAlgorithm["A128KW"] = "A128KW";
    JwaEncryptionAlgorithm["A192KW"] = "A192KW";
    JwaEncryptionAlgorithm["A256KW"] = "A256KW";
    JwaEncryptionAlgorithm["Dir"] = "dir";
    JwaEncryptionAlgorithm["ECDHES"] = "ECDH-ES";
    JwaEncryptionAlgorithm["ECDHESA128KW"] = "ECDH-ES+A128KW";
    JwaEncryptionAlgorithm["ECDHESA192KW"] = "ECDH-ES+A192KW";
    JwaEncryptionAlgorithm["ECDHESA256KW"] = "ECDH-ES+A256KW";
    JwaEncryptionAlgorithm["A128GCMKW"] = "A128GCMKW";
    JwaEncryptionAlgorithm["A192GCMKW"] = "A192GCMKW";
    JwaEncryptionAlgorithm["A256GCMKW"] = "A256GCMKW";
    JwaEncryptionAlgorithm["PBES2HS256A128KW"] = "PBES2-HS256+A128KW";
    JwaEncryptionAlgorithm["PBES2HS384A192KW"] = "PBES2-HS384+A192KW";
    JwaEncryptionAlgorithm["PBES2HS512A256KW"] = "PBES2-HS512+A256KW";
})(JwaEncryptionAlgorithm || (exports.JwaEncryptionAlgorithm = JwaEncryptionAlgorithm = {}));
