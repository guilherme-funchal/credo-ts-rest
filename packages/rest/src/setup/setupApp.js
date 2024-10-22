"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.setupApp = setupApp;
const core_1 = require("@credo-ts/core");
const TenantAgent_1 = require("@credo-ts/tenants/build/TenantAgent");
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = require("swagger-ui-express");
const tsoa_1 = require("tsoa");
const tsyringe_1 = require("tsyringe");
const ws_1 = require("ws");
const didcommBasicMessageEvents_1 = require("../events/didcommBasicMessageEvents");
const didcommConnectionEvents_1 = require("../events/didcommConnectionEvents");
const didcommCredentialEvents_1 = require("../events/didcommCredentialEvents");
const didcommOutOfBandEvents_1 = require("../events/didcommOutOfBandEvents");
const didcommProofEvents_1 = require("../events/didcommProofEvents");
const openId4VcIssuanceSessionEvents_1 = require("../events/openId4VcIssuanceSessionEvents");
const openId4VcVerificationSessionEvents_1 = require("../events/openId4VcVerificationSessionEvents");
const routes_1 = require("../generated/routes");
const createRestAgent_1 = require("./createRestAgent");
/**
 * Setup the Credo REST server based on the provided configuration. It expects an agent to be provided
 * with all necessary modules and configurations. This agent can be constructed using the `createRestAgent`
 * method, or by manually constructing an agent with the necessary modules (advanced and complex).
 */
function setupApp(config) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const agent = config.agent instanceof core_1.Agent ? config.agent : yield (0, createRestAgent_1.createRestAgent)(config.agent);
        tsyringe_1.container.registerInstance(core_1.Agent, agent);
        const app = (_a = config.baseApp) !== null && _a !== void 0 ? _a : (0, express_1.default)();
        if (config.enableCors)
            app.use((0, cors_1.default)());
        // TODO: use an event to publish events that needs to be sent to external services
        // that will make it easier for extensions to hook into the webhook publishing
        const socketServer = config.enableWebsocketEvents ? new ws_1.Server({ noServer: true }) : undefined;
        if (config.enableWebsocketEvents || config.webhookUrl) {
            const emitEventConfig = {
                socketServer,
                webhookUrl: config.webhookUrl,
            };
            (0, didcommBasicMessageEvents_1.didcommBasicMessageEvents)(agent, emitEventConfig);
            (0, didcommConnectionEvents_1.didcommConnectionEvents)(agent, emitEventConfig);
            (0, didcommCredentialEvents_1.didcommCredentialEvents)(agent, emitEventConfig);
            (0, didcommProofEvents_1.didcommProofEvents)(agent, emitEventConfig);
            (0, didcommOutOfBandEvents_1.didcommOutOfBandEvents)(agent, emitEventConfig);
            (0, openId4VcIssuanceSessionEvents_1.openId4VcIssuanceSessionEvents)(agent, emitEventConfig);
            (0, openId4VcVerificationSessionEvents_1.openId4VcVerificationSessionEvents)(agent, emitEventConfig);
        }
        // Use body parser to read sent json payloads
        app.use(body_parser_1.default.urlencoded({
            extended: true,
        }));
        app.use(body_parser_1.default.json());
        app.use('/docs', swagger_ui_express_1.serve, (_req, res, next) => __awaiter(this, void 0, void 0, function* () {
            res.send((0, swagger_ui_express_1.generateHTML)(yield Promise.resolve().then(() => __importStar(require('../generated/swagger.json')))));
            next();
        }));
        // TODO: allow to pass custom RegisterRoutes method (will allow extension using TSOA)
        (0, routes_1.RegisterRoutes)(app);
        app.use((req, _, next) => __awaiter(this, void 0, void 0, function* () {
            // End tenant session if active
            yield endTenantSessionIfActive(req);
            next();
        }));
        app.use((req, res, next) => {
            if (req.url == '/') {
                res.redirect('/docs');
            }
            next();
        });
        app.use(function errorHandler(err, req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
                // End tenant session if active
                yield endTenantSessionIfActive(req);
                if (err instanceof tsoa_1.ValidateError) {
                    agent.config.logger.warn(`Caught Validation Error for ${req.path}:`, err.fields);
                    return res.status(422).json({
                        message: 'Validation Failed',
                        details: err === null || err === void 0 ? void 0 : err.fields,
                    });
                }
                if (err instanceof Error) {
                    const exceptionError = err;
                    if (exceptionError.status === 400) {
                        return res.status(400).json({
                            message: `Bad Request`,
                            details: err.message,
                        });
                    }
                    if (exceptionError.status === 401) {
                        return res.status(401).json({
                            message: `Unauthorized`,
                            details: err.message,
                        });
                    }
                    agent.config.logger.error('Internal Server Error.', err);
                    return res.status(500).json({
                        message: 'Internal Server Error. Check server logging.',
                    });
                }
                next();
            });
        });
        let server = undefined;
        return {
            app,
            agent,
            start: () => {
                if (server)
                    throw new Error('Server already started');
                server = app.listen(config.adminPort);
                if (socketServer) {
                    server.on('upgrade', (request, socket, head) => {
                        // eslint-disable-next-line @typescript-eslint/no-empty-function
                        socketServer.handleUpgrade(request, socket, head, () => { });
                    });
                }
                return server;
            },
            shutdown: () => __awaiter(this, void 0, void 0, function* () {
                agent.config.logger.info('Shutdown initiated');
                if (server)
                    server.close();
                if (agent.isInitialized)
                    yield agent.shutdown();
                agent.config.logger.info('Shutdown complete');
            }),
        };
    });
}
function endTenantSessionIfActive(request) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if ('user' in request) {
            const agent = (_a = request === null || request === void 0 ? void 0 : request.user) === null || _a === void 0 ? void 0 : _a.agent;
            if (agent instanceof TenantAgent_1.TenantAgent) {
                agent.config.logger.debug('Ending tenant session');
                yield agent.endSession();
            }
        }
    });
}
