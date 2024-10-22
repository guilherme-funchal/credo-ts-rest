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
const JWE_1 = require("../JWE");
describe('ValidJWEStructure', () => {
    test('throws error when the response message has an invalid JWE structure', () => __awaiter(void 0, void 0, void 0, function* () {
        const responseMessage = 'invalid JWE structure';
        expect((0, JWE_1.isValidJweStructure)(responseMessage)).toBe(false);
    }));
    test('valid JWE structure', () => __awaiter(void 0, void 0, void 0, function* () {
        const responseMessage = {
            protected: 'eyJlbmMiOiJ4Y2hhY2hhMjBwb2x5MTMwNV9pZXRmIiwidHlwIjoiSldNLzEuMCIsImFsZyI6IkF1dGhjcnlwdCIsInJlY2lwaWVudHMiOlt7ImVuY3J5cHRlZF9rZXkiOiJNYUNKa3B1YzltZWxnblEtUk8teWtsQWRBWWxzY21GdFEzd1hjZ3R0R0dlSmVsZDBEc2pmTUpSWUtYUDA0cTQ2IiwiaGVhZGVyIjp7ImtpZCI6IkJid2ZCaDZ3bWdZUnJ1TlozZXhFelk2RXBLS2g4cGNob211eDJQUjg5bURlIiwiaXYiOiJOWVJGb0xoUG1EZlFhQ3czUzQ2RmM5M1lucWhDUnhKbiIsInNlbmRlciI6IkRIQ0lsdE5tcEgwRlRrd3NuVGNSWXgwZmYzTHBQTlF6VG1jbUdhRW83aGU5d19ERkFmemNTWFdhOEFnNzRHVEpfdnBpNWtzQkQ3MWYwYjI2VF9mVHBfV2FscTBlWUhmeTE4ZEszejhUTkJFQURpZ1VPWi1wR21pV3FrUT0ifX1dfQ==',
            iv: 'KNezOOt7JJtuU2q1',
            ciphertext: 'mwRMpVg9wkF4rIZcBeWLcc0fWhs=',
            tag: '0yW0Lx8-vWevj3if91R06g==',
        };
        expect((0, JWE_1.isValidJweStructure)(responseMessage)).toBe(true);
    }));
});
