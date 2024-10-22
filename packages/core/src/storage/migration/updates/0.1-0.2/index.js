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
exports.updateV0_1ToV0_2 = updateV0_1ToV0_2;
const connection_1 = require("./connection");
const credential_1 = require("./credential");
const mediation_1 = require("./mediation");
function updateV0_1ToV0_2(agent, config) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, credential_1.migrateCredentialRecordToV0_2)(agent);
        yield (0, mediation_1.migrateMediationRecordToV0_2)(agent, config.v0_1ToV0_2);
        yield (0, connection_1.migrateConnectionRecordToV0_2)(agent);
    });
}
