"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jest_config_base_1 = __importDefault(require("../../jest.config.base"));
const package_json_1 = __importDefault(require("./package.json"));
const config = Object.assign(Object.assign({}, jest_config_base_1.default), { displayName: package_json_1.default.name, moduleNameMapper: Object.assign(Object.assign({}, jest_config_base_1.default.moduleNameMapper), { 'indy-sdk-react-native': 'indy-sdk' }) });
exports.default = config;
