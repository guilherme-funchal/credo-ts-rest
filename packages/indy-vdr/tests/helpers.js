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
exports.indyVdrModuleConfig = void 0;
exports.createDidOnLedger = createDidOnLedger;
const core_1 = require("@aries-framework/core");
const indy_vdr_nodejs_1 = require("@hyperledger/indy-vdr-nodejs");
const sleep_1 = require("../../core/src/utils/sleep");
const helpers_1 = require("../../core/tests/helpers");
const IndyVdrModuleConfig_1 = require("../src/IndyVdrModuleConfig");
exports.indyVdrModuleConfig = new IndyVdrModuleConfig_1.IndyVdrModuleConfig({
    indyVdr: indy_vdr_nodejs_1.indyVdr,
    networks: [
        {
            genesisTransactions: helpers_1.genesisTransactions,
            indyNamespace: 'pool:localtest',
            isProduction: false,
            transactionAuthorAgreement: { version: '1', acceptanceMechanism: 'accept' },
        },
    ],
});
function createDidOnLedger(agent, endorserDid) {
    return __awaiter(this, void 0, void 0, function* () {
        const key = yield agent.wallet.createKey({ keyType: core_1.KeyType.Ed25519 });
        const createResult = yield agent.dids.create({
            method: 'indy',
            options: {
                endorserMode: 'internal',
                endorserDid: endorserDid,
                alias: 'Alias',
                role: 'TRUSTEE',
                verkey: key.publicKeyBase58,
                useEndpointAttrib: true,
                services: [
                    new core_1.DidDocumentService({
                        id: `#endpoint`,
                        serviceEndpoint: 'http://localhost:3000',
                        type: 'endpoint',
                    }),
                    new core_1.DidCommV1Service({
                        id: `#did-communication`,
                        priority: 0,
                        recipientKeys: [`#key-agreement-1`],
                        routingKeys: ['a-routing-key'],
                        serviceEndpoint: 'http://localhost:3000',
                        accept: ['didcomm/aip2;env=rfc19'],
                    }),
                    new core_1.DidCommV2Service({
                        accept: ['didcomm/v2'],
                        id: `#didcomm-1`,
                        routingKeys: ['a-routing-key'],
                        serviceEndpoint: 'http://localhost:3000',
                    }),
                ],
            },
        });
        if (!createResult.didState.did) {
            throw new Error(`Did was not created. ${createResult.didState.state === 'failed' ? createResult.didState.reason : 'Not finished'}`);
        }
        // Wait some time pass to let ledger settle the object
        yield (0, sleep_1.sleep)(1000);
        return { did: createResult.didState.did, key };
    });
}
