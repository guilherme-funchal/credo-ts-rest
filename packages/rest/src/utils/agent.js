"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAgentModules = getAgentModules;
var anoncreds_1 = require("@credo-ts/anoncreds");
var askar_1 = require("@credo-ts/askar");
var cheqd_1 = require("@credo-ts/cheqd");
var core_1 = require("@credo-ts/core");
var indy_besu_vdr_1 = require("@credo-ts/indy-besu-vdr");
var indy_vdr_1 = require("@credo-ts/indy-vdr");
var openid4vc_1 = require("@credo-ts/openid4vc");
var tenants_1 = require("@credo-ts/tenants");
var anoncreds_nodejs_1 = require("@hyperledger/anoncreds-nodejs");
var aries_askar_nodejs_1 = require("@hyperledger/aries-askar-nodejs");
var indy_vdr_nodejs_1 = require("@hyperledger/indy-vdr-nodejs");
function getAgentModules(options) {
    console.log("---------------->Aqui!!!");
    var _a;
    var legacyIndyCredentialFormatService = new anoncreds_1.LegacyIndyCredentialFormatService();
    var legacyIndyProofFormatService = new anoncreds_1.LegacyIndyProofFormatService();
    var baseUrlWithoutSlash = options.baseUrl.endsWith('/') ? options.baseUrl.slice(0, -1) : options.baseUrl;
    var baseModules = {
        connections: new core_1.ConnectionsModule({
            autoAcceptConnections: options.autoAcceptConnections,
        }),
        proofs: new core_1.ProofsModule({
            autoAcceptProofs: options.autoAcceptProofs,
            proofProtocols: [
                new anoncreds_1.V1ProofProtocol({
                    indyProofFormat: legacyIndyProofFormatService,
                }),
                new core_1.V2ProofProtocol({
                    proofFormats: [legacyIndyProofFormatService, new anoncreds_1.AnonCredsProofFormatService()],
                }),
            ],
        }),
        credentials: new core_1.CredentialsModule({
            autoAcceptCredentials: options.autoAcceptCredentials,
            credentialProtocols: [
                new anoncreds_1.V1CredentialProtocol({
                    indyCredentialFormat: legacyIndyCredentialFormatService,
                }),
                new core_1.V2CredentialProtocol({
                    credentialFormats: [legacyIndyCredentialFormatService, new anoncreds_1.AnonCredsCredentialFormatService()],
                }),
            ],
        }),
        anoncreds: new anoncreds_1.AnonCredsModule({
            registries: ((_a = options.extraAnonCredsRegistries) !== null && _a !== void 0 ? _a : []),
            anoncreds: anoncreds_nodejs_1.anoncreds,
        }),
        indyBesu: new indy_besu_vdr_1.IndyBesuModule({ chainId: 1337, nodeAddress: 'http://localhost:8545' }),
        dids: new core_1.DidsModule({
            resolvers: [new indy_vdr_1.IndyVdrIndyDidResolver(), new cheqd_1.CheqdDidResolver(), new indy_besu_vdr_1.IndyBesuDidResolver()],
            registrars: [new cheqd_1.CheqdDidRegistrar(), new indy_besu_vdr_1.IndyBesuDidRegistrar()],
        }),
        askar: new askar_1.AskarModule({
            ariesAskar: aries_askar_nodejs_1.ariesAskar,
            multiWalletDatabaseScheme: askar_1.AskarMultiWalletDatabaseScheme.ProfilePerWallet,
        }),
        mediator: new core_1.MediatorModule({
            autoAcceptMediationRequests: options.autoAcceptMediationRequests,
        }),
        // dids: new DidsModule({
        //   registrars: [new KeyDidRegistrar(), new JwkDidRegistrar(), new PeerDidRegistrar()],
        //   resolvers: [new WebDidResolver(), new KeyDidResolver(), new JwkDidResolver(), new PeerDidResolver()],
        // }),
        openId4VcIssuer: new openid4vc_1.OpenId4VcIssuerModule({
            baseUrl: "".concat(baseUrlWithoutSlash, "/oid4vci"),
            endpoints: {
                credential: {
                    credentialRequestToCredentialMapper: function (_a) {
                        var _b;
                        var issuanceSession = _a.issuanceSession, holderBinding = _a.holderBinding, credentialsSupported = _a.credentialsSupported;
                        var credentials = (_b = issuanceSession.issuanceMetadata) === null || _b === void 0 ? void 0 : _b.credentials;
                        if (!credentials)
                            throw new Error('Not implemented');
                        var requestedIds = credentialsSupported.map(function (c) { return c.id; }).filter(function (id) { return id !== undefined; });
                        var firstCredential = credentials.find(function (c) { return requestedIds.includes(c.credentialSupportedId); });
                        if (!firstCredential)
                            throw new Error('Not implemented');
                        if (firstCredential.format === 'vc+sd-jwt') {
                            return {
                                format: 'vc+sd-jwt',
                                issuer: firstCredential.issuer,
                                holder: holderBinding,
                                payload: firstCredential.payload,
                                // Type in credo is wrong
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                disclosureFrame: firstCredential.disclosureFrame,
                                hashingAlgorithm: 'sha-256',
                            };
                        }
                        throw new Error('Not implemented');
                    },
                },
            },
        }),
        openId4VcHolder: new openid4vc_1.OpenId4VcHolderModule(),
        openId4VcVerifier: new openid4vc_1.OpenId4VcVerifierModule({
            baseUrl: "".concat(baseUrlWithoutSlash, "/siop"),
        }),
    };
    var modules = baseModules;
    if (options.multiTenant) {
        modules.tenants = new tenants_1.TenantsModule({
            sessionLimit: Infinity,
        });
    }
    // Register indy module and related resolvers/registrars
    if (options.indyLedgers) {
        modules.indyVdr = new indy_vdr_1.IndyVdrModule({
            indyVdr: indy_vdr_nodejs_1.indyVdr,
            networks: options.indyLedgers,
        });
        modules.dids.config.addRegistrar(new indy_vdr_1.IndyVdrIndyDidRegistrar());
        modules.dids.config.addResolver(new indy_vdr_1.IndyVdrIndyDidResolver());
        modules.dids.config.addResolver(new indy_vdr_1.IndyVdrSovDidResolver());
        modules.anoncreds.config.registries.push(new indy_vdr_1.IndyVdrAnonCredsRegistry());
    }
    // Register cheqd module and related resolvers/registrars
    if (options.cheqdLedgers) {
        modules.cheqd = new cheqd_1.CheqdModule({
            networks: options.cheqdLedgers,
        });
        modules.dids.config.addRegistrar(new cheqd_1.CheqdDidRegistrar());
        modules.dids.config.addResolver(new cheqd_1.CheqdDidResolver());
        modules.anoncreds.config.registries.push(new cheqd_1.CheqdAnonCredsRegistry());
    }
    return modules;
}
