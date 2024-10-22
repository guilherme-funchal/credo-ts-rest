"use strict";
exports.__esModule = true;
exports.contractConfigs = void 0;
var fs_1 = require("fs");
var path_1 = require("path");
exports.contractConfigs = [
    {
        address: '0x0000000000000000000000000000000000003333',
        spec: JSON.parse(fs_1["default"].readFileSync(path_1["default"].resolve(__dirname, './abi/DidRegistryInterface.json'), 'utf8'))
    },
    {
        address: '0x0000000000000000000000000000000000005555',
        spec: JSON.parse(fs_1["default"].readFileSync(path_1["default"].resolve(__dirname, './abi/SchemaRegistryInterface.json'), 'utf8'))
    },
    {
        address: '0x0000000000000000000000000000000000004444',
        spec: JSON.parse(fs_1["default"].readFileSync(path_1["default"].resolve(__dirname, './abi/CredentialDefinitionRegistryInterface.json'), 'utf8'))
    },
];
