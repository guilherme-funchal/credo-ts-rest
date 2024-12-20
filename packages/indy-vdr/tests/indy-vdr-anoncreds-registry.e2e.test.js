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
const anoncreds_1 = require("@aries-framework/anoncreds");
const core_1 = require("@aries-framework/core");
const indy_vdr_nodejs_1 = require("@hyperledger/indy-vdr-nodejs");
const indy_vdr_shared_1 = require("@hyperledger/indy-vdr-shared");
const helpers_1 = require("../../core/tests/helpers");
const src_1 = require("../../indy-sdk/src");
const setupIndySdkModule_1 = require("../../indy-sdk/tests/setupIndySdkModule");
const src_2 = require("../src");
const IndyVdrAnonCredsRegistry_1 = require("../src/anoncreds/IndyVdrAnonCredsRegistry");
const IndyVdrIndyDidRegistrar_1 = require("../src/dids/IndyVdrIndyDidRegistrar");
const didIndyUtil_1 = require("../src/dids/didIndyUtil");
const pool_1 = require("../src/pool");
const anoncreds_2 = require("./__fixtures__/anoncreds");
const helpers_2 = require("./helpers");
const endorserConfig = (0, helpers_1.getAgentConfig)('IndyVdrAnonCredsRegistryEndorser');
const agentConfig = (0, helpers_1.getAgentConfig)('IndyVdrAnonCredsRegistryAgent');
const indyVdrAnonCredsRegistry = new IndyVdrAnonCredsRegistry_1.IndyVdrAnonCredsRegistry();
const endorser = new core_1.Agent({
    config: endorserConfig,
    dependencies: helpers_1.agentDependencies,
    modules: {
        indyVdr: new src_2.IndyVdrModule({
            indyVdr: indy_vdr_nodejs_1.indyVdr,
            networks: helpers_2.indyVdrModuleConfig.networks,
        }),
        indySdk: new src_1.IndySdkModule({
            indySdk: setupIndySdkModule_1.indySdk,
        }),
        dids: new core_1.DidsModule({
            registrars: [new IndyVdrIndyDidRegistrar_1.IndyVdrIndyDidRegistrar()],
            resolvers: [new src_2.IndyVdrSovDidResolver(), new src_2.IndyVdrIndyDidResolver()],
        }),
    },
});
const agent = new core_1.Agent({
    config: agentConfig,
    dependencies: helpers_1.agentDependencies,
    modules: {
        indyVdr: new src_2.IndyVdrModule({
            indyVdr: indy_vdr_nodejs_1.indyVdr,
            networks: helpers_2.indyVdrModuleConfig.networks,
        }),
        indySdk: new src_1.IndySdkModule({
            indySdk: setupIndySdkModule_1.indySdk,
        }),
        dids: new core_1.DidsModule({
            registrars: [new IndyVdrIndyDidRegistrar_1.IndyVdrIndyDidRegistrar()],
            resolvers: [new src_2.IndyVdrSovDidResolver(), new src_2.IndyVdrIndyDidResolver()],
        }),
    },
});
const indyVdrPoolService = endorser.dependencyManager.resolve(pool_1.IndyVdrPoolService);
const pool = indyVdrPoolService.getPoolForNamespace('pool:localtest');
describe('IndyVdrAnonCredsRegistry', () => {
    let endorserDid;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield endorser.initialize();
        const unqualifiedSubmitterDid = yield (0, helpers_1.importExistingIndyDidFromPrivateKey)(endorser, core_1.TypedArrayEncoder.fromString('00000000000000000000000Endorser9'));
        endorserDid = `did:indy:pool:localtest:${unqualifiedSubmitterDid}`;
        yield agent.initialize();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        for (const pool of indyVdrPoolService.pools) {
            pool.close();
        }
        yield endorser.shutdown();
        yield endorser.wallet.delete();
        yield agent.shutdown();
        yield agent.wallet.delete();
    }));
    test('register and resolve a schema and credential definition (internal, issuerDid != endorserDid)', () => __awaiter(void 0, void 0, void 0, function* () {
        const didCreateResult = (yield endorser.dids.create({
            method: 'indy',
            options: {
                endorserMode: 'internal',
                endorserDid,
            },
        }));
        if (didCreateResult.didState.state !== 'finished')
            throw Error('did was not successfully created');
        const didIndyIssuerId = didCreateResult.didState.did;
        const { namespaceIdentifier: legacyIssuerId } = (0, anoncreds_1.parseIndyDid)(didIndyIssuerId);
        const dynamicVersion = `1.${Math.random() * 100}`;
        const signingKey = yield (0, didIndyUtil_1.verificationKeyForIndyDid)(endorser.context, didIndyIssuerId);
        const legacySchemaId = `${legacyIssuerId}:2:test:${dynamicVersion}`;
        const didIndySchemaId = `did:indy:pool:localtest:${legacyIssuerId}/anoncreds/v0/SCHEMA/test/${dynamicVersion}`;
        const schemaResult = yield indyVdrAnonCredsRegistry.registerSchema(endorser.context, {
            options: {
                endorserMode: 'internal',
                endorserDid,
            },
            schema: {
                attrNames: ['age'],
                issuerId: didIndyIssuerId,
                name: 'test',
                version: dynamicVersion,
            },
        });
        expect(schemaResult).toMatchObject({
            schemaState: {
                state: 'finished',
                schema: {
                    attrNames: ['age'],
                    issuerId: didIndyIssuerId,
                    name: 'test',
                    version: dynamicVersion,
                },
                schemaId: didIndySchemaId,
            },
            registrationMetadata: {},
            schemaMetadata: {
                indyLedgerSeqNo: expect.any(Number),
            },
        });
        // Wait some time before resolving credential definition object
        yield new Promise((res) => setTimeout(res, 1000));
        const legacySchema = yield indyVdrAnonCredsRegistry.getSchema(endorser.context, legacySchemaId);
        expect(legacySchema).toMatchObject({
            schema: {
                attrNames: ['age'],
                name: 'test',
                version: dynamicVersion,
                issuerId: legacyIssuerId,
            },
            schemaId: legacySchemaId,
            resolutionMetadata: {},
            schemaMetadata: {
                didIndyNamespace: 'pool:localtest',
                indyLedgerSeqNo: expect.any(Number),
            },
        });
        // Resolve using did indy schema id
        const didIndySchema = yield indyVdrAnonCredsRegistry.getSchema(endorser.context, didIndySchemaId);
        expect(didIndySchema).toMatchObject({
            schema: {
                attrNames: ['age'],
                name: 'test',
                version: dynamicVersion,
                issuerId: didIndyIssuerId,
            },
            schemaId: didIndySchemaId,
            resolutionMetadata: {},
            schemaMetadata: {
                didIndyNamespace: 'pool:localtest',
                indyLedgerSeqNo: expect.any(Number),
            },
        });
        const legacyCredentialDefinitionId = `${legacyIssuerId}:3:CL:${schemaResult.schemaMetadata.indyLedgerSeqNo}:TAG`;
        const didIndyCredentialDefinitionId = `did:indy:pool:localtest:${legacyIssuerId}/anoncreds/v0/CLAIM_DEF/${schemaResult.schemaMetadata.indyLedgerSeqNo}/TAG`;
        const credentialDefinitionResult = yield indyVdrAnonCredsRegistry.registerCredentialDefinition(endorser.context, {
            credentialDefinition: {
                issuerId: didIndyIssuerId,
                tag: 'TAG',
                schemaId: didIndySchemaId,
                type: 'CL',
                value: anoncreds_2.credentialDefinitionValue,
            },
            options: {
                endorserMode: 'internal',
                endorserDid: endorserDid,
            },
        });
        expect(credentialDefinitionResult).toMatchObject({
            credentialDefinitionMetadata: {},
            credentialDefinitionState: {
                credentialDefinition: {
                    issuerId: didIndyIssuerId,
                    tag: 'TAG',
                    schemaId: didIndySchemaId,
                    type: 'CL',
                    value: anoncreds_2.credentialDefinitionValue,
                },
                credentialDefinitionId: didIndyCredentialDefinitionId,
                state: 'finished',
            },
            registrationMetadata: {},
        });
        // Wait some time before resolving credential definition object
        yield new Promise((res) => setTimeout(res, 1000));
        const legacyCredentialDefinition = yield indyVdrAnonCredsRegistry.getCredentialDefinition(endorser.context, legacyCredentialDefinitionId);
        expect(legacyCredentialDefinition).toMatchObject({
            credentialDefinitionId: legacyCredentialDefinitionId,
            credentialDefinition: {
                issuerId: legacyIssuerId,
                schemaId: legacySchemaId,
                tag: 'TAG',
                type: 'CL',
                value: anoncreds_2.credentialDefinitionValue,
            },
            credentialDefinitionMetadata: {
                didIndyNamespace: 'pool:localtest',
            },
            resolutionMetadata: {},
        });
        // resolve using did indy credential definition id
        const didIndyCredentialDefinition = yield indyVdrAnonCredsRegistry.getCredentialDefinition(endorser.context, didIndyCredentialDefinitionId);
        expect(didIndyCredentialDefinition).toMatchObject({
            credentialDefinitionId: didIndyCredentialDefinitionId,
            credentialDefinition: {
                issuerId: didIndyIssuerId,
                schemaId: didIndySchemaId,
                tag: 'TAG',
                type: 'CL',
                value: anoncreds_2.credentialDefinitionValue,
            },
            credentialDefinitionMetadata: {
                didIndyNamespace: 'pool:localtest',
            },
            resolutionMetadata: {},
        });
        // We don't support creating a revocation registry using AFJ yet, so we directly use indy-vdr to create the revocation registry
        const legacyRevocationRegistryId = `${legacyIssuerId}:4:${legacyIssuerId}:3:CL:${schemaResult.schemaMetadata.indyLedgerSeqNo}:TAG:CL_ACCUM:tag`;
        const didIndyRevocationRegistryId = `did:indy:pool:localtest:${legacyIssuerId}/anoncreds/v0/REV_REG_DEF/${schemaResult.schemaMetadata.indyLedgerSeqNo}/TAG/tag`;
        const revocationRegistryRequest = new indy_vdr_shared_1.RevocationRegistryDefinitionRequest({
            submitterDid: legacyIssuerId,
            revocationRegistryDefinitionV1: {
                credDefId: legacyCredentialDefinitionId,
                id: legacyRevocationRegistryId,
                revocDefType: 'CL_ACCUM',
                tag: 'tag',
                value: {
                    issuanceType: 'ISSUANCE_BY_DEFAULT',
                    maxCredNum: 100,
                    publicKeys: {
                        accumKey: {
                            z: '1 1812B206EB395D3AEBD4BBF53EBB0FFC3371D8BD6175316AB32C1C5F65452051 1 22A079D49C5351EFDC1410C81A1F6D8B2E3B79CFF20A30690C118FE2050F72CB 1 0FFC28B923A4654E261DB4CB5B9BABEFCB4DB189B20F52412B0CC9CCCBB8A3B2 1 1EE967C43EF1A3F487061D21B07076A26C126AAF7712E7B5CF5A53688DDD5CC0 1 009ED4D65879CA81DA8227D34CEA3B759B4627E1E2FFB273E9645CD4F3B10F19 1 1CF070212E1E213AEB472F56EDFC9D48009796C77B2D8CC16F2836E37B8715C2 1 04954F0B7B468781BAAE3291DD0E6FFA7F1AF66CAA4094D37B24363CC34606FB 1 115367CB755E9DB18781B3825CB1AEE2C334558B2C038E13DF57BB57CE1CF847 1 110D37EC05862EE2757A7DF39E814876FC97376FF8105D2D29619CB575537BDE 1 13C559A9563FCE083B3B39AE7E8FCA4099BEF3A4C8C6672E543D521F9DA88F96 1 137D87CC22ACC1B6B8C20EABE59F6ED456A58FE4CBEEFDFC4FA9B87E3EF32D17 1 00A2A9711737AAF0404F35AE502887AC6172B2B57D236BD4A40B45F659BFC696',
                        },
                    },
                    tailsHash: 'HLKresYcDSZYSKogq8wive4zyXNY84669MygftLFBG1i',
                    tailsLocation: '/var/folders/l3/xy8jzyvj4p5_d9g1123rt4bw0000gn/T/HLKresYcDSZYSKogq8wive4zyXNY84669MygftLFBG1i',
                },
                ver: '1.0',
            },
        });
        // After this call, the revocation registry should now be resolvable
        const writeRequest = yield pool.prepareWriteRequest(endorser.context, revocationRegistryRequest, signingKey, endorserDid);
        const endorsedRequest = yield endorser.modules.indyVdr.endorseTransaction(writeRequest.body, endorserDid);
        yield pool.submitRequest(new indy_vdr_shared_1.CustomRequest({ customRequest: endorsedRequest }));
        // Also create a revocation registry entry
        const revocationEntryRequest = new indy_vdr_shared_1.RevocationRegistryEntryRequest({
            revocationRegistryDefinitionId: legacyRevocationRegistryId,
            revocationRegistryDefinitionType: 'CL_ACCUM',
            revocationRegistryEntry: {
                ver: '1.0',
                value: {
                    accum: '1',
                },
            },
            submitterDid: legacyIssuerId,
        });
        // After this call we can query the revocation registry entries (using timestamp now)
        const revocationEntryWriteRequest = yield pool.prepareWriteRequest(endorser.context, revocationEntryRequest, signingKey, endorserDid);
        const endorsedRevocationEntryWriteRequest = yield endorser.modules.indyVdr.endorseTransaction(revocationEntryWriteRequest.body, endorserDid);
        const entryResponse = (yield pool.submitRequest(new indy_vdr_shared_1.CustomRequest({ customRequest: endorsedRevocationEntryWriteRequest })));
        const legacyRevocationRegistryDefinition = yield indyVdrAnonCredsRegistry.getRevocationRegistryDefinition(endorser.context, legacyRevocationRegistryId);
        expect(legacyRevocationRegistryDefinition).toMatchObject({
            revocationRegistryDefinitionId: legacyRevocationRegistryId,
            revocationRegistryDefinition: {
                issuerId: legacyIssuerId,
                revocDefType: 'CL_ACCUM',
                value: {
                    maxCredNum: 100,
                    tailsHash: 'HLKresYcDSZYSKogq8wive4zyXNY84669MygftLFBG1i',
                    tailsLocation: '/var/folders/l3/xy8jzyvj4p5_d9g1123rt4bw0000gn/T/HLKresYcDSZYSKogq8wive4zyXNY84669MygftLFBG1i',
                    publicKeys: {
                        accumKey: {
                            z: '1 1812B206EB395D3AEBD4BBF53EBB0FFC3371D8BD6175316AB32C1C5F65452051 1 22A079D49C5351EFDC1410C81A1F6D8B2E3B79CFF20A30690C118FE2050F72CB 1 0FFC28B923A4654E261DB4CB5B9BABEFCB4DB189B20F52412B0CC9CCCBB8A3B2 1 1EE967C43EF1A3F487061D21B07076A26C126AAF7712E7B5CF5A53688DDD5CC0 1 009ED4D65879CA81DA8227D34CEA3B759B4627E1E2FFB273E9645CD4F3B10F19 1 1CF070212E1E213AEB472F56EDFC9D48009796C77B2D8CC16F2836E37B8715C2 1 04954F0B7B468781BAAE3291DD0E6FFA7F1AF66CAA4094D37B24363CC34606FB 1 115367CB755E9DB18781B3825CB1AEE2C334558B2C038E13DF57BB57CE1CF847 1 110D37EC05862EE2757A7DF39E814876FC97376FF8105D2D29619CB575537BDE 1 13C559A9563FCE083B3B39AE7E8FCA4099BEF3A4C8C6672E543D521F9DA88F96 1 137D87CC22ACC1B6B8C20EABE59F6ED456A58FE4CBEEFDFC4FA9B87E3EF32D17 1 00A2A9711737AAF0404F35AE502887AC6172B2B57D236BD4A40B45F659BFC696',
                        },
                    },
                },
                tag: 'tag',
                credDefId: legacyCredentialDefinitionId,
            },
            revocationRegistryDefinitionMetadata: {
                issuanceType: 'ISSUANCE_BY_DEFAULT',
                didIndyNamespace: 'pool:localtest',
            },
            resolutionMetadata: {},
        });
        const didIndyRevocationRegistryDefinition = yield indyVdrAnonCredsRegistry.getRevocationRegistryDefinition(endorser.context, didIndyRevocationRegistryId);
        expect(didIndyRevocationRegistryDefinition).toMatchObject({
            revocationRegistryDefinitionId: didIndyRevocationRegistryId,
            revocationRegistryDefinition: {
                issuerId: didIndyIssuerId,
                revocDefType: 'CL_ACCUM',
                value: {
                    maxCredNum: 100,
                    tailsHash: 'HLKresYcDSZYSKogq8wive4zyXNY84669MygftLFBG1i',
                    tailsLocation: '/var/folders/l3/xy8jzyvj4p5_d9g1123rt4bw0000gn/T/HLKresYcDSZYSKogq8wive4zyXNY84669MygftLFBG1i',
                    publicKeys: {
                        accumKey: {
                            z: '1 1812B206EB395D3AEBD4BBF53EBB0FFC3371D8BD6175316AB32C1C5F65452051 1 22A079D49C5351EFDC1410C81A1F6D8B2E3B79CFF20A30690C118FE2050F72CB 1 0FFC28B923A4654E261DB4CB5B9BABEFCB4DB189B20F52412B0CC9CCCBB8A3B2 1 1EE967C43EF1A3F487061D21B07076A26C126AAF7712E7B5CF5A53688DDD5CC0 1 009ED4D65879CA81DA8227D34CEA3B759B4627E1E2FFB273E9645CD4F3B10F19 1 1CF070212E1E213AEB472F56EDFC9D48009796C77B2D8CC16F2836E37B8715C2 1 04954F0B7B468781BAAE3291DD0E6FFA7F1AF66CAA4094D37B24363CC34606FB 1 115367CB755E9DB18781B3825CB1AEE2C334558B2C038E13DF57BB57CE1CF847 1 110D37EC05862EE2757A7DF39E814876FC97376FF8105D2D29619CB575537BDE 1 13C559A9563FCE083B3B39AE7E8FCA4099BEF3A4C8C6672E543D521F9DA88F96 1 137D87CC22ACC1B6B8C20EABE59F6ED456A58FE4CBEEFDFC4FA9B87E3EF32D17 1 00A2A9711737AAF0404F35AE502887AC6172B2B57D236BD4A40B45F659BFC696',
                        },
                    },
                },
                tag: 'tag',
                credDefId: didIndyCredentialDefinitionId,
            },
            revocationRegistryDefinitionMetadata: {
                issuanceType: 'ISSUANCE_BY_DEFAULT',
                didIndyNamespace: 'pool:localtest',
            },
            resolutionMetadata: {},
        });
        const legacyRevocationStatusList = yield indyVdrAnonCredsRegistry.getRevocationStatusList(endorser.context, legacyRevocationRegistryId, entryResponse.result.txnMetadata.txnTime);
        expect(legacyRevocationStatusList).toMatchObject({
            resolutionMetadata: {},
            revocationStatusList: {
                issuerId: legacyIssuerId,
                currentAccumulator: '1',
                revRegDefId: legacyRevocationRegistryId,
                revocationList: [
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                ],
                timestamp: entryResponse.result.txnMetadata.txnTime,
            },
            revocationStatusListMetadata: {
                didIndyNamespace: 'pool:localtest',
            },
        });
        const didIndyRevocationStatusList = yield indyVdrAnonCredsRegistry.getRevocationStatusList(endorser.context, didIndyRevocationRegistryId, entryResponse.result.txnMetadata.txnTime);
        expect(didIndyRevocationStatusList).toMatchObject({
            resolutionMetadata: {},
            revocationStatusList: {
                issuerId: didIndyIssuerId,
                currentAccumulator: '1',
                revRegDefId: didIndyRevocationRegistryId,
                revocationList: [
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                ],
                timestamp: entryResponse.result.txnMetadata.txnTime,
            },
            revocationStatusListMetadata: {
                didIndyNamespace: 'pool:localtest',
            },
        });
    }));
    test('register and resolve a schema and credential definition (internal, issuerDid == endorserDid)', () => __awaiter(void 0, void 0, void 0, function* () {
        const dynamicVersion = `1.${Math.random() * 100}`;
        const legacyIssuerId = 'DJKobikPAaYWAu9vfhEEo5';
        const didIndyIssuerId = 'did:indy:pool:localtest:DJKobikPAaYWAu9vfhEEo5';
        const signingKey = yield (0, didIndyUtil_1.verificationKeyForIndyDid)(agent.context, didIndyIssuerId);
        const legacySchemaId = `DJKobikPAaYWAu9vfhEEo5:2:test:${dynamicVersion}`;
        const didIndySchemaId = `did:indy:pool:localtest:DJKobikPAaYWAu9vfhEEo5/anoncreds/v0/SCHEMA/test/${dynamicVersion}`;
        const schemaResult = yield indyVdrAnonCredsRegistry.registerSchema(endorser.context, {
            options: {
                endorserMode: 'internal',
                endorserDid,
            },
            schema: {
                attrNames: ['age'],
                issuerId: didIndyIssuerId,
                name: 'test',
                version: dynamicVersion,
            },
        });
        expect(schemaResult).toMatchObject({
            schemaState: {
                state: 'finished',
                schema: {
                    attrNames: ['age'],
                    issuerId: didIndyIssuerId,
                    name: 'test',
                    version: dynamicVersion,
                },
                schemaId: didIndySchemaId,
            },
            registrationMetadata: {},
            schemaMetadata: {
                indyLedgerSeqNo: expect.any(Number),
            },
        });
        // Wait some time before resolving credential definition object
        yield new Promise((res) => setTimeout(res, 1000));
        const legacySchema = yield indyVdrAnonCredsRegistry.getSchema(endorser.context, legacySchemaId);
        expect(legacySchema).toMatchObject({
            schema: {
                attrNames: ['age'],
                name: 'test',
                version: dynamicVersion,
                issuerId: legacyIssuerId,
            },
            schemaId: legacySchemaId,
            resolutionMetadata: {},
            schemaMetadata: {
                didIndyNamespace: 'pool:localtest',
                indyLedgerSeqNo: expect.any(Number),
            },
        });
        // Resolve using did indy schema id
        const didIndySchema = yield indyVdrAnonCredsRegistry.getSchema(endorser.context, didIndySchemaId);
        expect(didIndySchema).toMatchObject({
            schema: {
                attrNames: ['age'],
                name: 'test',
                version: dynamicVersion,
                issuerId: didIndyIssuerId,
            },
            schemaId: didIndySchemaId,
            resolutionMetadata: {},
            schemaMetadata: {
                didIndyNamespace: 'pool:localtest',
                indyLedgerSeqNo: expect.any(Number),
            },
        });
        const legacyCredentialDefinitionId = `DJKobikPAaYWAu9vfhEEo5:3:CL:${schemaResult.schemaMetadata.indyLedgerSeqNo}:TAG`;
        const didIndyCredentialDefinitionId = `did:indy:pool:localtest:DJKobikPAaYWAu9vfhEEo5/anoncreds/v0/CLAIM_DEF/${schemaResult.schemaMetadata.indyLedgerSeqNo}/TAG`;
        const credentialDefinitionResult = yield indyVdrAnonCredsRegistry.registerCredentialDefinition(endorser.context, {
            credentialDefinition: {
                issuerId: didIndyIssuerId,
                tag: 'TAG',
                schemaId: didIndySchemaId,
                type: 'CL',
                value: anoncreds_2.credentialDefinitionValue,
            },
            options: {
                endorserMode: 'internal',
                endorserDid: endorserDid,
            },
        });
        expect(credentialDefinitionResult).toMatchObject({
            credentialDefinitionMetadata: {},
            credentialDefinitionState: {
                credentialDefinition: {
                    issuerId: didIndyIssuerId,
                    tag: 'TAG',
                    schemaId: didIndySchemaId,
                    type: 'CL',
                    value: anoncreds_2.credentialDefinitionValue,
                },
                credentialDefinitionId: didIndyCredentialDefinitionId,
                state: 'finished',
            },
            registrationMetadata: {},
        });
        // Wait some time before resolving credential definition object
        yield new Promise((res) => setTimeout(res, 1000));
        const legacyCredentialDefinition = yield indyVdrAnonCredsRegistry.getCredentialDefinition(endorser.context, legacyCredentialDefinitionId);
        expect(legacyCredentialDefinition).toMatchObject({
            credentialDefinitionId: legacyCredentialDefinitionId,
            credentialDefinition: {
                issuerId: legacyIssuerId,
                schemaId: legacySchemaId,
                tag: 'TAG',
                type: 'CL',
                value: anoncreds_2.credentialDefinitionValue,
            },
            credentialDefinitionMetadata: {
                didIndyNamespace: 'pool:localtest',
            },
            resolutionMetadata: {},
        });
        // resolve using did indy credential definition id
        const didIndyCredentialDefinition = yield indyVdrAnonCredsRegistry.getCredentialDefinition(endorser.context, didIndyCredentialDefinitionId);
        expect(didIndyCredentialDefinition).toMatchObject({
            credentialDefinitionId: didIndyCredentialDefinitionId,
            credentialDefinition: {
                issuerId: didIndyIssuerId,
                schemaId: didIndySchemaId,
                tag: 'TAG',
                type: 'CL',
                value: anoncreds_2.credentialDefinitionValue,
            },
            credentialDefinitionMetadata: {
                didIndyNamespace: 'pool:localtest',
            },
            resolutionMetadata: {},
        });
        // We don't support creating a revocation registry using AFJ yet, so we directly use indy-vdr to create the revocation registry
        const legacyRevocationRegistryId = `DJKobikPAaYWAu9vfhEEo5:4:DJKobikPAaYWAu9vfhEEo5:3:CL:${schemaResult.schemaMetadata.indyLedgerSeqNo}:TAG:CL_ACCUM:tag`;
        const didIndyRevocationRegistryId = `did:indy:pool:localtest:DJKobikPAaYWAu9vfhEEo5/anoncreds/v0/REV_REG_DEF/${schemaResult.schemaMetadata.indyLedgerSeqNo}/TAG/tag`;
        const revocationRegistryRequest = new indy_vdr_shared_1.RevocationRegistryDefinitionRequest({
            submitterDid: 'DJKobikPAaYWAu9vfhEEo5',
            revocationRegistryDefinitionV1: {
                credDefId: legacyCredentialDefinitionId,
                id: legacyRevocationRegistryId,
                revocDefType: 'CL_ACCUM',
                tag: 'tag',
                value: {
                    issuanceType: 'ISSUANCE_BY_DEFAULT',
                    maxCredNum: 100,
                    publicKeys: {
                        accumKey: {
                            z: '1 1812B206EB395D3AEBD4BBF53EBB0FFC3371D8BD6175316AB32C1C5F65452051 1 22A079D49C5351EFDC1410C81A1F6D8B2E3B79CFF20A30690C118FE2050F72CB 1 0FFC28B923A4654E261DB4CB5B9BABEFCB4DB189B20F52412B0CC9CCCBB8A3B2 1 1EE967C43EF1A3F487061D21B07076A26C126AAF7712E7B5CF5A53688DDD5CC0 1 009ED4D65879CA81DA8227D34CEA3B759B4627E1E2FFB273E9645CD4F3B10F19 1 1CF070212E1E213AEB472F56EDFC9D48009796C77B2D8CC16F2836E37B8715C2 1 04954F0B7B468781BAAE3291DD0E6FFA7F1AF66CAA4094D37B24363CC34606FB 1 115367CB755E9DB18781B3825CB1AEE2C334558B2C038E13DF57BB57CE1CF847 1 110D37EC05862EE2757A7DF39E814876FC97376FF8105D2D29619CB575537BDE 1 13C559A9563FCE083B3B39AE7E8FCA4099BEF3A4C8C6672E543D521F9DA88F96 1 137D87CC22ACC1B6B8C20EABE59F6ED456A58FE4CBEEFDFC4FA9B87E3EF32D17 1 00A2A9711737AAF0404F35AE502887AC6172B2B57D236BD4A40B45F659BFC696',
                        },
                    },
                    tailsHash: 'HLKresYcDSZYSKogq8wive4zyXNY84669MygftLFBG1i',
                    tailsLocation: '/var/folders/l3/xy8jzyvj4p5_d9g1123rt4bw0000gn/T/HLKresYcDSZYSKogq8wive4zyXNY84669MygftLFBG1i',
                },
                ver: '1.0',
            },
        });
        // After this call, the revocation registry should now be resolvable
        const writeRequest = yield pool.prepareWriteRequest(endorser.context, revocationRegistryRequest, signingKey);
        yield pool.submitRequest(writeRequest);
        // Also create a revocation registry entry
        const revocationEntryRequest = new indy_vdr_shared_1.RevocationRegistryEntryRequest({
            revocationRegistryDefinitionId: legacyRevocationRegistryId,
            revocationRegistryDefinitionType: 'CL_ACCUM',
            revocationRegistryEntry: {
                ver: '1.0',
                value: {
                    accum: '1',
                },
            },
            submitterDid: legacyIssuerId,
        });
        // After this call we can query the revocation registry entries (using timestamp now)
        const revocationEntryWriteRequest = yield pool.prepareWriteRequest(endorser.context, revocationEntryRequest, signingKey);
        const entryResponse = yield pool.submitRequest(revocationEntryWriteRequest);
        const legacyRevocationRegistryDefinition = yield indyVdrAnonCredsRegistry.getRevocationRegistryDefinition(endorser.context, legacyRevocationRegistryId);
        expect(legacyRevocationRegistryDefinition).toMatchObject({
            revocationRegistryDefinitionId: legacyRevocationRegistryId,
            revocationRegistryDefinition: {
                issuerId: legacyIssuerId,
                revocDefType: 'CL_ACCUM',
                value: {
                    maxCredNum: 100,
                    tailsHash: 'HLKresYcDSZYSKogq8wive4zyXNY84669MygftLFBG1i',
                    tailsLocation: '/var/folders/l3/xy8jzyvj4p5_d9g1123rt4bw0000gn/T/HLKresYcDSZYSKogq8wive4zyXNY84669MygftLFBG1i',
                    publicKeys: {
                        accumKey: {
                            z: '1 1812B206EB395D3AEBD4BBF53EBB0FFC3371D8BD6175316AB32C1C5F65452051 1 22A079D49C5351EFDC1410C81A1F6D8B2E3B79CFF20A30690C118FE2050F72CB 1 0FFC28B923A4654E261DB4CB5B9BABEFCB4DB189B20F52412B0CC9CCCBB8A3B2 1 1EE967C43EF1A3F487061D21B07076A26C126AAF7712E7B5CF5A53688DDD5CC0 1 009ED4D65879CA81DA8227D34CEA3B759B4627E1E2FFB273E9645CD4F3B10F19 1 1CF070212E1E213AEB472F56EDFC9D48009796C77B2D8CC16F2836E37B8715C2 1 04954F0B7B468781BAAE3291DD0E6FFA7F1AF66CAA4094D37B24363CC34606FB 1 115367CB755E9DB18781B3825CB1AEE2C334558B2C038E13DF57BB57CE1CF847 1 110D37EC05862EE2757A7DF39E814876FC97376FF8105D2D29619CB575537BDE 1 13C559A9563FCE083B3B39AE7E8FCA4099BEF3A4C8C6672E543D521F9DA88F96 1 137D87CC22ACC1B6B8C20EABE59F6ED456A58FE4CBEEFDFC4FA9B87E3EF32D17 1 00A2A9711737AAF0404F35AE502887AC6172B2B57D236BD4A40B45F659BFC696',
                        },
                    },
                },
                tag: 'tag',
                credDefId: legacyCredentialDefinitionId,
            },
            revocationRegistryDefinitionMetadata: {
                issuanceType: 'ISSUANCE_BY_DEFAULT',
                didIndyNamespace: 'pool:localtest',
            },
            resolutionMetadata: {},
        });
        const didIndyRevocationRegistryDefinition = yield indyVdrAnonCredsRegistry.getRevocationRegistryDefinition(endorser.context, didIndyRevocationRegistryId);
        expect(didIndyRevocationRegistryDefinition).toMatchObject({
            revocationRegistryDefinitionId: didIndyRevocationRegistryId,
            revocationRegistryDefinition: {
                issuerId: didIndyIssuerId,
                revocDefType: 'CL_ACCUM',
                value: {
                    maxCredNum: 100,
                    tailsHash: 'HLKresYcDSZYSKogq8wive4zyXNY84669MygftLFBG1i',
                    tailsLocation: '/var/folders/l3/xy8jzyvj4p5_d9g1123rt4bw0000gn/T/HLKresYcDSZYSKogq8wive4zyXNY84669MygftLFBG1i',
                    publicKeys: {
                        accumKey: {
                            z: '1 1812B206EB395D3AEBD4BBF53EBB0FFC3371D8BD6175316AB32C1C5F65452051 1 22A079D49C5351EFDC1410C81A1F6D8B2E3B79CFF20A30690C118FE2050F72CB 1 0FFC28B923A4654E261DB4CB5B9BABEFCB4DB189B20F52412B0CC9CCCBB8A3B2 1 1EE967C43EF1A3F487061D21B07076A26C126AAF7712E7B5CF5A53688DDD5CC0 1 009ED4D65879CA81DA8227D34CEA3B759B4627E1E2FFB273E9645CD4F3B10F19 1 1CF070212E1E213AEB472F56EDFC9D48009796C77B2D8CC16F2836E37B8715C2 1 04954F0B7B468781BAAE3291DD0E6FFA7F1AF66CAA4094D37B24363CC34606FB 1 115367CB755E9DB18781B3825CB1AEE2C334558B2C038E13DF57BB57CE1CF847 1 110D37EC05862EE2757A7DF39E814876FC97376FF8105D2D29619CB575537BDE 1 13C559A9563FCE083B3B39AE7E8FCA4099BEF3A4C8C6672E543D521F9DA88F96 1 137D87CC22ACC1B6B8C20EABE59F6ED456A58FE4CBEEFDFC4FA9B87E3EF32D17 1 00A2A9711737AAF0404F35AE502887AC6172B2B57D236BD4A40B45F659BFC696',
                        },
                    },
                },
                tag: 'tag',
                credDefId: didIndyCredentialDefinitionId,
            },
            revocationRegistryDefinitionMetadata: {
                issuanceType: 'ISSUANCE_BY_DEFAULT',
                didIndyNamespace: 'pool:localtest',
            },
            resolutionMetadata: {},
        });
        const legacyRevocationStatusList = yield indyVdrAnonCredsRegistry.getRevocationStatusList(endorser.context, legacyRevocationRegistryId, entryResponse.result.txnMetadata.txnTime);
        expect(legacyRevocationStatusList).toMatchObject({
            resolutionMetadata: {},
            revocationStatusList: {
                issuerId: legacyIssuerId,
                currentAccumulator: '1',
                revRegDefId: legacyRevocationRegistryId,
                revocationList: [
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                ],
                timestamp: entryResponse.result.txnMetadata.txnTime,
            },
            revocationStatusListMetadata: {
                didIndyNamespace: 'pool:localtest',
            },
        });
        const didIndyRevocationStatusList = yield indyVdrAnonCredsRegistry.getRevocationStatusList(endorser.context, didIndyRevocationRegistryId, entryResponse.result.txnMetadata.txnTime);
        expect(didIndyRevocationStatusList).toMatchObject({
            resolutionMetadata: {},
            revocationStatusList: {
                issuerId: didIndyIssuerId,
                currentAccumulator: '1',
                revRegDefId: didIndyRevocationRegistryId,
                revocationList: [
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                ],
                timestamp: entryResponse.result.txnMetadata.txnTime,
            },
            revocationStatusListMetadata: {
                didIndyNamespace: 'pool:localtest',
            },
        });
    }));
    test('register and resolve a schema and credential definition (external)', () => __awaiter(void 0, void 0, void 0, function* () {
        const didCreateTxResult = (yield agent.dids.create({
            method: 'indy',
            options: {
                endorserMode: 'external',
                endorserDid,
            },
        }));
        const didState = didCreateTxResult.didState;
        if (didState.state !== 'action' || didState.action !== 'endorseIndyTransaction')
            throw Error('unexpected did state');
        const signedNymRequest = yield endorser.modules.indyVdr.endorseTransaction(didState.nymRequest, didState.endorserDid);
        const didCreateSubmitResult = yield agent.dids.create({
            did: didState.did,
            options: {
                endorserMode: 'external',
                endorsedTransaction: {
                    nymRequest: signedNymRequest,
                },
            },
            secret: didState.secret,
        });
        if (!didCreateSubmitResult.didState.did)
            throw Error('did was not correctly created');
        const agentDid = didCreateSubmitResult.didState.did;
        const { namespaceIdentifier } = (0, anoncreds_1.parseIndyDid)(agentDid);
        const dynamicVersion = `1.${Math.random() * 100}`;
        const legacyIssuerId = namespaceIdentifier;
        const didIndyIssuerId = agentDid;
        const signingKey = yield (0, didIndyUtil_1.verificationKeyForIndyDid)(agent.context, didIndyIssuerId);
        const legacySchemaId = `${namespaceIdentifier}:2:test:${dynamicVersion}`;
        const didIndySchemaId = `did:indy:pool:localtest:${namespaceIdentifier}/anoncreds/v0/SCHEMA/test/${dynamicVersion}`;
        const createSchemaTxResult = yield indyVdrAnonCredsRegistry.registerSchema(agent.context, {
            options: {
                endorserMode: 'external',
                endorserDid,
            },
            schema: {
                attrNames: ['age'],
                issuerId: didIndyIssuerId,
                name: 'test',
                version: dynamicVersion,
            },
        });
        const { schemaState } = createSchemaTxResult;
        if (schemaState.state !== 'action' || schemaState.action !== 'endorseIndyTransaction')
            throw Error('unexpected schema state');
        const endorsedTx = yield endorser.modules.indyVdr.endorseTransaction(schemaState.schemaRequest, endorserDid);
        const submitSchemaTxResult = yield indyVdrAnonCredsRegistry.registerSchema(agent.context, {
            schema: schemaState.schema,
            options: {
                endorserMode: 'external',
                endorsedTransaction: endorsedTx,
            },
        });
        expect(submitSchemaTxResult).toMatchObject({
            schemaState: {
                state: 'finished',
                schema: {
                    attrNames: ['age'],
                    issuerId: didIndyIssuerId,
                    name: 'test',
                    version: dynamicVersion,
                },
                schemaId: didIndySchemaId,
            },
            registrationMetadata: {},
            schemaMetadata: {
                indyLedgerSeqNo: expect.any(Number),
            },
        });
        // Wait some time before resolving credential definition object
        yield new Promise((res) => setTimeout(res, 1000));
        const legacySchema = yield indyVdrAnonCredsRegistry.getSchema(agent.context, legacySchemaId);
        expect(legacySchema).toMatchObject({
            schema: {
                attrNames: ['age'],
                name: 'test',
                version: dynamicVersion,
                issuerId: legacyIssuerId,
            },
            schemaId: legacySchemaId,
            resolutionMetadata: {},
            schemaMetadata: {
                didIndyNamespace: 'pool:localtest',
                indyLedgerSeqNo: expect.any(Number),
            },
        });
        // Resolve using did indy schema id
        const didIndySchema = yield indyVdrAnonCredsRegistry.getSchema(agent.context, didIndySchemaId);
        expect(didIndySchema).toMatchObject({
            schema: {
                attrNames: ['age'],
                name: 'test',
                version: dynamicVersion,
                issuerId: didIndyIssuerId,
            },
            schemaId: didIndySchemaId,
            resolutionMetadata: {},
            schemaMetadata: {
                didIndyNamespace: 'pool:localtest',
                indyLedgerSeqNo: expect.any(Number),
            },
        });
        const legacyCredentialDefinitionId = `${namespaceIdentifier}:3:CL:${submitSchemaTxResult.schemaMetadata.indyLedgerSeqNo}:TAG`;
        const didIndyCredentialDefinitionId = `did:indy:pool:localtest:${namespaceIdentifier}/anoncreds/v0/CLAIM_DEF/${submitSchemaTxResult.schemaMetadata.indyLedgerSeqNo}/TAG`;
        const createCredDefTxResult = yield indyVdrAnonCredsRegistry.registerCredentialDefinition(agent.context, {
            credentialDefinition: {
                issuerId: didIndyIssuerId,
                tag: 'TAG',
                schemaId: didIndySchemaId,
                type: 'CL',
                value: anoncreds_2.credentialDefinitionValue,
            },
            options: {
                endorserMode: 'external',
                endorserDid,
            },
        });
        const { credentialDefinitionState } = createCredDefTxResult;
        if (credentialDefinitionState.state !== 'action' || credentialDefinitionState.action !== 'endorseIndyTransaction')
            throw Error('unexpected schema state');
        const endorsedCredDefTx = yield endorser.modules.indyVdr.endorseTransaction(credentialDefinitionState.credentialDefinitionRequest, endorserDid);
        const SubmitCredDefTxResult = yield indyVdrAnonCredsRegistry.registerCredentialDefinition(agent.context, {
            credentialDefinition: credentialDefinitionState.credentialDefinition,
            options: {
                endorserMode: 'external',
                endorsedTransaction: endorsedCredDefTx,
            },
        });
        expect(SubmitCredDefTxResult).toMatchObject({
            credentialDefinitionMetadata: {},
            credentialDefinitionState: {
                credentialDefinition: {
                    issuerId: didIndyIssuerId,
                    tag: 'TAG',
                    schemaId: didIndySchemaId,
                    type: 'CL',
                    value: anoncreds_2.credentialDefinitionValue,
                },
                credentialDefinitionId: didIndyCredentialDefinitionId,
                state: 'finished',
            },
            registrationMetadata: {},
        });
        // Wait some time before resolving credential definition object
        yield new Promise((res) => setTimeout(res, 1000));
        const legacyCredentialDefinition = yield indyVdrAnonCredsRegistry.getCredentialDefinition(agent.context, legacyCredentialDefinitionId);
        expect(legacyCredentialDefinition).toMatchObject({
            credentialDefinitionId: legacyCredentialDefinitionId,
            credentialDefinition: {
                issuerId: legacyIssuerId,
                schemaId: legacySchemaId,
                tag: 'TAG',
                type: 'CL',
                value: anoncreds_2.credentialDefinitionValue,
            },
            credentialDefinitionMetadata: {
                didIndyNamespace: 'pool:localtest',
            },
            resolutionMetadata: {},
        });
        // resolve using did indy credential definition id
        const didIndyCredentialDefinition = yield indyVdrAnonCredsRegistry.getCredentialDefinition(agent.context, didIndyCredentialDefinitionId);
        expect(didIndyCredentialDefinition).toMatchObject({
            credentialDefinitionId: didIndyCredentialDefinitionId,
            credentialDefinition: {
                issuerId: didIndyIssuerId,
                schemaId: didIndySchemaId,
                tag: 'TAG',
                type: 'CL',
                value: anoncreds_2.credentialDefinitionValue,
            },
            credentialDefinitionMetadata: {
                didIndyNamespace: 'pool:localtest',
            },
            resolutionMetadata: {},
        });
        // We don't support creating a revocation registry using AFJ yet, so we directly use indy-vdr to create the revocation registry
        const legacyRevocationRegistryId = `${namespaceIdentifier}:4:${namespaceIdentifier}:3:CL:${submitSchemaTxResult.schemaMetadata.indyLedgerSeqNo}:TAG:CL_ACCUM:tag`;
        const didIndyRevocationRegistryId = `did:indy:pool:localtest:${namespaceIdentifier}/anoncreds/v0/REV_REG_DEF/${submitSchemaTxResult.schemaMetadata.indyLedgerSeqNo}/TAG/tag`;
        const revocationRegistryRequest = new indy_vdr_shared_1.RevocationRegistryDefinitionRequest({
            submitterDid: namespaceIdentifier,
            revocationRegistryDefinitionV1: {
                credDefId: legacyCredentialDefinitionId,
                id: legacyRevocationRegistryId,
                revocDefType: 'CL_ACCUM',
                tag: 'tag',
                value: {
                    issuanceType: 'ISSUANCE_BY_DEFAULT',
                    maxCredNum: 100,
                    publicKeys: {
                        accumKey: {
                            z: '1 1812B206EB395D3AEBD4BBF53EBB0FFC3371D8BD6175316AB32C1C5F65452051 1 22A079D49C5351EFDC1410C81A1F6D8B2E3B79CFF20A30690C118FE2050F72CB 1 0FFC28B923A4654E261DB4CB5B9BABEFCB4DB189B20F52412B0CC9CCCBB8A3B2 1 1EE967C43EF1A3F487061D21B07076A26C126AAF7712E7B5CF5A53688DDD5CC0 1 009ED4D65879CA81DA8227D34CEA3B759B4627E1E2FFB273E9645CD4F3B10F19 1 1CF070212E1E213AEB472F56EDFC9D48009796C77B2D8CC16F2836E37B8715C2 1 04954F0B7B468781BAAE3291DD0E6FFA7F1AF66CAA4094D37B24363CC34606FB 1 115367CB755E9DB18781B3825CB1AEE2C334558B2C038E13DF57BB57CE1CF847 1 110D37EC05862EE2757A7DF39E814876FC97376FF8105D2D29619CB575537BDE 1 13C559A9563FCE083B3B39AE7E8FCA4099BEF3A4C8C6672E543D521F9DA88F96 1 137D87CC22ACC1B6B8C20EABE59F6ED456A58FE4CBEEFDFC4FA9B87E3EF32D17 1 00A2A9711737AAF0404F35AE502887AC6172B2B57D236BD4A40B45F659BFC696',
                        },
                    },
                    tailsHash: 'HLKresYcDSZYSKogq8wive4zyXNY84669MygftLFBG1i',
                    tailsLocation: '/var/folders/l3/xy8jzyvj4p5_d9g1123rt4bw0000gn/T/HLKresYcDSZYSKogq8wive4zyXNY84669MygftLFBG1i',
                },
                ver: '1.0',
            },
        });
        // After this call, the revocation registry should now be resolvable
        const writeRequest = yield pool.prepareWriteRequest(agent.context, revocationRegistryRequest, signingKey, endorserDid);
        const endorsedRequest = yield endorser.modules.indyVdr.endorseTransaction(writeRequest.body, endorserDid);
        yield pool.submitRequest(new indy_vdr_shared_1.CustomRequest({ customRequest: endorsedRequest }));
        // Also create a revocation registry entry
        const revocationEntryRequest = new indy_vdr_shared_1.RevocationRegistryEntryRequest({
            revocationRegistryDefinitionId: legacyRevocationRegistryId,
            revocationRegistryDefinitionType: 'CL_ACCUM',
            revocationRegistryEntry: {
                ver: '1.0',
                value: {
                    accum: '1',
                },
            },
            submitterDid: legacyIssuerId,
        });
        // After this call we can query the revocation registry entries (using timestamp now)
        const revocationEntryWriteRequest = yield pool.prepareWriteRequest(agent.context, revocationEntryRequest, signingKey, endorserDid);
        const endorsedRevEntryWriteRequest = yield endorser.modules.indyVdr.endorseTransaction(revocationEntryWriteRequest.body, endorserDid);
        const entryResponse = (yield pool.submitRequest(new indy_vdr_shared_1.CustomRequest({ customRequest: endorsedRevEntryWriteRequest })));
        const legacyRevocationRegistryDefinition = yield indyVdrAnonCredsRegistry.getRevocationRegistryDefinition(agent.context, legacyRevocationRegistryId);
        expect(legacyRevocationRegistryDefinition).toMatchObject({
            revocationRegistryDefinitionId: legacyRevocationRegistryId,
            revocationRegistryDefinition: {
                issuerId: legacyIssuerId,
                revocDefType: 'CL_ACCUM',
                value: {
                    maxCredNum: 100,
                    tailsHash: 'HLKresYcDSZYSKogq8wive4zyXNY84669MygftLFBG1i',
                    tailsLocation: '/var/folders/l3/xy8jzyvj4p5_d9g1123rt4bw0000gn/T/HLKresYcDSZYSKogq8wive4zyXNY84669MygftLFBG1i',
                    publicKeys: {
                        accumKey: {
                            z: '1 1812B206EB395D3AEBD4BBF53EBB0FFC3371D8BD6175316AB32C1C5F65452051 1 22A079D49C5351EFDC1410C81A1F6D8B2E3B79CFF20A30690C118FE2050F72CB 1 0FFC28B923A4654E261DB4CB5B9BABEFCB4DB189B20F52412B0CC9CCCBB8A3B2 1 1EE967C43EF1A3F487061D21B07076A26C126AAF7712E7B5CF5A53688DDD5CC0 1 009ED4D65879CA81DA8227D34CEA3B759B4627E1E2FFB273E9645CD4F3B10F19 1 1CF070212E1E213AEB472F56EDFC9D48009796C77B2D8CC16F2836E37B8715C2 1 04954F0B7B468781BAAE3291DD0E6FFA7F1AF66CAA4094D37B24363CC34606FB 1 115367CB755E9DB18781B3825CB1AEE2C334558B2C038E13DF57BB57CE1CF847 1 110D37EC05862EE2757A7DF39E814876FC97376FF8105D2D29619CB575537BDE 1 13C559A9563FCE083B3B39AE7E8FCA4099BEF3A4C8C6672E543D521F9DA88F96 1 137D87CC22ACC1B6B8C20EABE59F6ED456A58FE4CBEEFDFC4FA9B87E3EF32D17 1 00A2A9711737AAF0404F35AE502887AC6172B2B57D236BD4A40B45F659BFC696',
                        },
                    },
                },
                tag: 'tag',
                credDefId: legacyCredentialDefinitionId,
            },
            revocationRegistryDefinitionMetadata: {
                issuanceType: 'ISSUANCE_BY_DEFAULT',
                didIndyNamespace: 'pool:localtest',
            },
            resolutionMetadata: {},
        });
        const didIndyRevocationRegistryDefinition = yield indyVdrAnonCredsRegistry.getRevocationRegistryDefinition(agent.context, didIndyRevocationRegistryId);
        expect(didIndyRevocationRegistryDefinition).toMatchObject({
            revocationRegistryDefinitionId: didIndyRevocationRegistryId,
            revocationRegistryDefinition: {
                issuerId: didIndyIssuerId,
                revocDefType: 'CL_ACCUM',
                value: {
                    maxCredNum: 100,
                    tailsHash: 'HLKresYcDSZYSKogq8wive4zyXNY84669MygftLFBG1i',
                    tailsLocation: '/var/folders/l3/xy8jzyvj4p5_d9g1123rt4bw0000gn/T/HLKresYcDSZYSKogq8wive4zyXNY84669MygftLFBG1i',
                    publicKeys: {
                        accumKey: {
                            z: '1 1812B206EB395D3AEBD4BBF53EBB0FFC3371D8BD6175316AB32C1C5F65452051 1 22A079D49C5351EFDC1410C81A1F6D8B2E3B79CFF20A30690C118FE2050F72CB 1 0FFC28B923A4654E261DB4CB5B9BABEFCB4DB189B20F52412B0CC9CCCBB8A3B2 1 1EE967C43EF1A3F487061D21B07076A26C126AAF7712E7B5CF5A53688DDD5CC0 1 009ED4D65879CA81DA8227D34CEA3B759B4627E1E2FFB273E9645CD4F3B10F19 1 1CF070212E1E213AEB472F56EDFC9D48009796C77B2D8CC16F2836E37B8715C2 1 04954F0B7B468781BAAE3291DD0E6FFA7F1AF66CAA4094D37B24363CC34606FB 1 115367CB755E9DB18781B3825CB1AEE2C334558B2C038E13DF57BB57CE1CF847 1 110D37EC05862EE2757A7DF39E814876FC97376FF8105D2D29619CB575537BDE 1 13C559A9563FCE083B3B39AE7E8FCA4099BEF3A4C8C6672E543D521F9DA88F96 1 137D87CC22ACC1B6B8C20EABE59F6ED456A58FE4CBEEFDFC4FA9B87E3EF32D17 1 00A2A9711737AAF0404F35AE502887AC6172B2B57D236BD4A40B45F659BFC696',
                        },
                    },
                },
                tag: 'tag',
                credDefId: didIndyCredentialDefinitionId,
            },
            revocationRegistryDefinitionMetadata: {
                issuanceType: 'ISSUANCE_BY_DEFAULT',
                didIndyNamespace: 'pool:localtest',
            },
            resolutionMetadata: {},
        });
        const legacyRevocationStatusList = yield indyVdrAnonCredsRegistry.getRevocationStatusList(agent.context, legacyRevocationRegistryId, entryResponse.result.txnMetadata.txnTime);
        expect(legacyRevocationStatusList).toMatchObject({
            resolutionMetadata: {},
            revocationStatusList: {
                issuerId: legacyIssuerId,
                currentAccumulator: '1',
                revRegDefId: legacyRevocationRegistryId,
                revocationList: [
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                ],
                timestamp: entryResponse.result.txnMetadata.txnTime,
            },
            revocationStatusListMetadata: {
                didIndyNamespace: 'pool:localtest',
            },
        });
        const didIndyRevocationStatusList = yield indyVdrAnonCredsRegistry.getRevocationStatusList(agent.context, didIndyRevocationRegistryId, entryResponse.result.txnMetadata.txnTime);
        expect(didIndyRevocationStatusList).toMatchObject({
            resolutionMetadata: {},
            revocationStatusList: {
                issuerId: didIndyIssuerId,
                currentAccumulator: '1',
                revRegDefId: didIndyRevocationRegistryId,
                revocationList: [
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                ],
                timestamp: entryResponse.result.txnMetadata.txnTime,
            },
            revocationStatusListMetadata: {
                didIndyNamespace: 'pool:localtest',
            },
        });
    }));
});
