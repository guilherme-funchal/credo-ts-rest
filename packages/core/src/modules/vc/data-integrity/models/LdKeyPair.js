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
exports.LdKeyPair = void 0;
class LdKeyPair {
    constructor(options) {
        this.id = options.id;
        this.controller = options.controller;
    }
    static generate() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Not implemented');
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static from(verificationMethod) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Abstract method from() must be implemented in subclass.');
        });
    }
    export(publicKey = false, privateKey = false) {
        if (!publicKey && !privateKey) {
            throw new Error('Export requires specifying either "publicKey" or "privateKey".');
        }
        const key = {
            id: this.id,
            type: this.type,
            controller: this.controller,
        };
        return key;
    }
}
exports.LdKeyPair = LdKeyPair;
