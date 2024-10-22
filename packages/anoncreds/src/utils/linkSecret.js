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
exports.storeLinkSecret = storeLinkSecret;
const repository_1 = require("../repository");
function storeLinkSecret(agentContext, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { linkSecretId, linkSecretValue, setAsDefault } = options;
        const linkSecretRepository = agentContext.dependencyManager.resolve(repository_1.AnonCredsLinkSecretRepository);
        // In some cases we don't have the linkSecretValue. However we still want a record so we know which link secret ids are valid
        const linkSecretRecord = new repository_1.AnonCredsLinkSecretRecord({ linkSecretId, value: linkSecretValue });
        // If it is the first link secret registered, set as default
        const defaultLinkSecretRecord = yield linkSecretRepository.findDefault(agentContext);
        if (!defaultLinkSecretRecord || setAsDefault) {
            linkSecretRecord.setTag('isDefault', true);
        }
        // Set the current default link secret as not default
        if (defaultLinkSecretRecord && setAsDefault) {
            defaultLinkSecretRecord.setTag('isDefault', false);
            yield linkSecretRepository.update(agentContext, defaultLinkSecretRecord);
        }
        yield linkSecretRepository.save(agentContext, linkSecretRecord);
        return linkSecretRecord;
    });
}
