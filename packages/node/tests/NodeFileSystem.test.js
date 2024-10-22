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
const core_1 = require("@aries-framework/core");
const nock_1 = __importStar(require("nock"));
const path_1 = __importDefault(require("path"));
const NodeFileSystem_1 = require("../src/NodeFileSystem");
describe('@aries-framework/file-system-node', () => {
    describe('NodeFileSystem', () => {
        const fileSystem = new NodeFileSystem_1.NodeFileSystem();
        afterAll(() => {
            (0, nock_1.cleanAll)();
            (0, nock_1.enableNetConnect)();
        });
        describe('exists()', () => {
            it('should return false if the pash does not exist', () => {
                return expect(fileSystem.exists('some-random-path')).resolves.toBe(false);
            });
        });
        describe('downloadToFile()', () => {
            test('should verify the hash', () => __awaiter(void 0, void 0, void 0, function* () {
                // Mock tails file
                (0, nock_1.default)('https://tails.prod.absa.africa')
                    .get('/api/public/tails/4B1NxYuGxwYMe5BAyP9NXkUmbEkDATo4oGZCgjXQ3y1p')
                    .replyWithFile(200, path_1.default.join(__dirname, '__fixtures__/tailsFile'));
                yield fileSystem.downloadToFile('https://tails.prod.absa.africa/api/public/tails/4B1NxYuGxwYMe5BAyP9NXkUmbEkDATo4oGZCgjXQ3y1p', `${fileSystem.dataPath}/tails/4B1NxYuGxwYMe5BAyP9NXkUmbEkDATo4oGZCgjXQ3y1p`, {
                    verifyHash: {
                        algorithm: 'sha256',
                        hash: core_1.TypedArrayEncoder.fromBase58('4B1NxYuGxwYMe5BAyP9NXkUmbEkDATo4oGZCgjXQ3y1p'),
                    },
                });
            }));
        });
    });
});
