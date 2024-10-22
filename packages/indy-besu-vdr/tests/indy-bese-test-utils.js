"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trusteePrivateKey = exports.getBesuIndyModules = void 0;
exports.buildDid = buildDid;
const askar_1 = require("@credo-ts/askar");
const aries_askar_nodejs_1 = require("@hyperledger/aries-askar-nodejs");
const core_1 = require("@credo-ts/core");
const IndyBesuDidRegistrar_1 = require("../src/dids/IndyBesuDidRegistrar");
const IndyBesuDidResolver_1 = require("../src/dids/IndyBesuDidResolver");
const IndyBesuModule_1 = require("../src/IndyBesuModule");
const ethers_1 = require("ethers");
const getBesuIndyModules = () => ({
    indyBesuVdr: new IndyBesuModule_1.IndyBesuModule({ chainId: 1337, nodeAddress: 'http://localhost:8545' }),
    dids: new core_1.DidsModule({
        registrars: [new IndyBesuDidRegistrar_1.IndyBesuDidRegistrar()],
        resolvers: [new IndyBesuDidResolver_1.IndyBesuDidResolver()],
    }),
    askar: new askar_1.AskarModule({
        ariesAskar: aries_askar_nodejs_1.ariesAskar,
    }),
});
exports.getBesuIndyModules = getBesuIndyModules;
exports.trusteePrivateKey = core_1.TypedArrayEncoder.fromHex('c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3');
function buildDid(method, network, key) {
    const namespaceIdentifier = (0, ethers_1.computeAddress)(`0x${core_1.TypedArrayEncoder.toHex(key)}`);
    return `did:${method}:${network}:${namespaceIdentifier}`;
}
