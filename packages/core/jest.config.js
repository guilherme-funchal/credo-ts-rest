"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jest_config_base_1 = __importDefault(require("../../jest.config.base"));
const package_json_1 = __importDefault(require("./package.json"));
process.env.TZ = 'GMT';
const config = Object.assign(Object.assign({}, jest_config_base_1.default), { displayName: package_json_1.default.name, setupFilesAfterEnv: ['./tests/setup.ts'] });
exports.default = config;
