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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCliServer = runCliServer;
const core_1 = require("@credo-ts/core");
const process_1 = __importDefault(require("process"));
const yargs_1 = __importDefault(require("yargs"));
const setupApp_1 = require("./setup/setupApp");
const parsed = yargs_1.default
    .scriptName('credo-rest')
    .command('start', 'Start Credo Rest agent')
    .option('label', {
    alias: 'l',
    string: true,
    demandOption: true,
})
    .option('wallet-id', {
    string: true,
    demandOption: true,
})
    .option('wallet-key', {
    string: true,
    demandOption: true,
})
    .option('indy-ledger', {
    array: true,
    default: [],
    coerce: (items) => items.map((i) => (typeof i === 'string' ? JSON.parse(i) : i)),
})
    .option('cheqd-ledger', {
    array: true,
    default: [],
    coerce: (items) => items.map((i) => (typeof i === 'string' ? JSON.parse(i) : i)),
})
    .option('endpoint', {
    array: true,
    string: true,
})
    .option('log-level', {
    number: true,
    default: 3,
})
    .option('use-did-sov-prefix-where-allowed', {
    boolean: true,
    default: false,
})
    .option('use-did-key-in-protocols', {
    boolean: true,
    default: true,
})
    .option('outbound-transport', {
    default: [],
    choices: ['http', 'ws'],
    array: true,
})
    .option('multi-tenant', {
    boolean: true,
    default: false,
    describe: 'Start the agent as a multi-tenant agent. Once enabled, all operations (except tenant management) must be performed under a specific tenant. Tenants can be created in the tenants controller (POST /tenants, see swagger UI), and the scope for a specific tenant can be set using the x-tenant-id header.',
})
    .option('inbound-transport', {
    array: true,
    default: [],
    coerce: (input) => {
        // Configured using config object
        if (typeof input[0] === 'object')
            return input;
        if (input.length % 2 !== 0) {
            throw new Error('Inbound transport should be specified as transport port pairs (e.g. --inbound-transport http 5000 ws 5001)');
        }
        return input.reduce((transports, item, index) => {
            const isEven = index % 2 === 0;
            // isEven means it is the transport
            // transport port transport port
            const isTransport = isEven;
            if (isTransport) {
                transports.push({
                    transport: item,
                    port: Number(input[index + 1]),
                });
            }
            return transports;
        }, []);
    },
})
    .option('auto-accept-connections', {
    boolean: true,
    default: false,
})
    .option('auto-accept-credentials', {
    choices: [core_1.AutoAcceptCredential.Always, core_1.AutoAcceptCredential.Never, core_1.AutoAcceptCredential.ContentApproved],
    default: core_1.AutoAcceptCredential.ContentApproved,
})
    .option('auto-accept-mediation-requests', {
    boolean: true,
    default: false,
})
    .option('auto-accept-proofs', {
    choices: [core_1.AutoAcceptProof.Always, core_1.AutoAcceptProof.Never, core_1.AutoAcceptProof.ContentApproved],
    default: core_1.AutoAcceptProof.ContentApproved,
})
    .option('auto-update-storage-on-startup', {
    boolean: true,
    default: true,
})
    .option('connection-image-url', {
    string: true,
})
    .option('webhook-url', {
    string: true,
})
    .option('websocket-events', {
    boolean: true,
    default: false,
    describe: 'Enable websocket events on the admin API server. When a client connects, it will receive events from the agent.',
})
    .option('admin-port', {
    number: true,
    demandOption: true,
})
    .option('storage-type', {
    choices: ['sqlite', 'postgres'],
    default: 'sqlite',
})
    .option('postgres-host', {
    string: true,
})
    .option('postgres-username', {
    string: true,
})
    .option('postgres-password', {
    string: true,
})
    .check((argv) => {
    if (argv['storage-type'] === 'postgres' &&
        (!argv['postgres-host'] || !argv['postgres-username'] || !argv['postgres-password'])) {
        throw new Error("--postgres-host, --postgres-username, and postgres-password are required when setting --storage-type to 'postgres'");
    }
    return true;
})
    .config()
    .env('CREDO_REST')
    .parseSync();
function runCliServer() {
    return __awaiter(this, void 0, void 0, function* () {
        const { start, shutdown } = yield (0, setupApp_1.setupApp)({
            webhookUrl: parsed['webhook-url'],
            adminPort: parsed['admin-port'],
            enableWebsocketEvents: true,
            enableCors: true,
            agent: {
                label: parsed.label,
                walletConfig: {
                    id: parsed['wallet-id'],
                    key: parsed['wallet-key'],
                    storage: parsed['storage-type'] === 'sqlite'
                        ? {
                            type: 'sqlite',
                        }
                        : {
                            type: 'postgres',
                            config: {
                                host: parsed['postgres-host'],
                            },
                            credentials: {
                                account: parsed['postgres-username'],
                                password: parsed['postgres-password'],
                            },
                        },
                },
                indyLedgers: parsed['indy-ledger'],
                cheqdLedgers: parsed['cheqd-ledger'],
                endpoints: parsed.endpoint,
                autoAcceptConnections: parsed['auto-accept-connections'],
                autoAcceptCredentials: parsed['auto-accept-credentials'],
                autoAcceptProofs: parsed['auto-accept-proofs'],
                autoUpdateStorageOnStartup: parsed['auto-update-storage-on-startup'],
                autoAcceptMediationRequests: parsed['auto-accept-mediation-requests'],
                useDidKeyInProtocols: parsed['use-did-key-in-protocols'],
                useDidSovPrefixWhereAllowed: parsed['use-did-sov-prefix-where-allowed'],
                logLevel: parsed['log-level'],
                inboundTransports: parsed['inbound-transport'],
                outboundTransports: parsed['outbound-transport'],
                connectionImageUrl: parsed['connection-image-url'],
                multiTenant: parsed['multi-tenant'],
            },
        });
        start();
        process_1.default.on('SIGINT', () => __awaiter(this, void 0, void 0, function* () {
            try {
                yield shutdown();
            }
            finally {
                process_1.default.exit(0);
            }
        }));
    });
}
runCliServer();
