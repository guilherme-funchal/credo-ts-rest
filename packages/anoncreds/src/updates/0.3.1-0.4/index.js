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
exports.updateAnonCredsModuleV0_3_1ToV0_4 = updateAnonCredsModuleV0_3_1ToV0_4;
const credentialDefinition_1 = require("./credentialDefinition");
const credentialExchangeRecord_1 = require("./credentialExchangeRecord");
const linkSecret_1 = require("./linkSecret");
const schema_1 = require("./schema");
function updateAnonCredsModuleV0_3_1ToV0_4(agent) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, credentialExchangeRecord_1.migrateCredentialExchangeRecordToV0_4)(agent);
        yield (0, linkSecret_1.migrateLinkSecretToV0_4)(agent);
        yield (0, credentialDefinition_1.migrateAnonCredsCredentialDefinitionRecordToV0_4)(agent);
        yield (0, schema_1.migrateAnonCredsSchemaRecordToV0_4)(agent);
    });
}
