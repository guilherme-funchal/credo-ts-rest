"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractConfigs = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
exports.contractConfigs = [
    {
        address: '0x0000000000000000000000000000000000003333',
        spec: JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(__dirname, './abi/DidRegistryInterface.json'), 'utf8')),
    },
    {
        address: '0x0000000000000000000000000000000000005555',
        spec: JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(__dirname, './abi/SchemaRegistryInterface.json'), 'utf8')),
    },
    {
        address: '0x0000000000000000000000000000000000004444',
        spec: JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(__dirname, './abi/CredentialDefinitionRegistryInterface.json'), 'utf8')),
    },
];
