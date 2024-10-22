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
exports.updateV0_3_1ToV0_4 = updateV0_3_1ToV0_4;
const cache_1 = require("./cache");
const did_1 = require("./did");
const w3cCredentialRecord_1 = require("./w3cCredentialRecord");
function updateV0_3_1ToV0_4(agent) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, did_1.migrateDidRecordToV0_4)(agent);
        yield (0, cache_1.migrateCacheToV0_4)(agent);
        yield (0, w3cCredentialRecord_1.migrateW3cCredentialRecordToV0_4)(agent);
    });
}
