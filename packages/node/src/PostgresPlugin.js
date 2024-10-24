"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndySdkPostgresWalletScheme = void 0;
exports.loadIndySdkPostgresPlugin = loadIndySdkPostgresPlugin;
const ffi_napi_1 = require("ffi-napi");
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const ref_napi_1 = require("ref-napi");
const LIBNAME = 'indystrgpostgres';
const ENV_VAR = 'LIB_INDY_STRG_POSTGRES';
const extensions = {
    darwin: { prefix: 'lib', extension: '.dylib' },
    linux: { prefix: 'lib', extension: '.so' },
    win32: { extension: '.dll' },
};
const libPaths = {
    darwin: ['/usr/local/lib/', '/usr/lib/', '/opt/homebrew/opt/'],
    linux: ['/usr/lib/', '/usr/local/lib/'],
    win32: ['c:\\windows\\system32\\'],
};
// Alias for a simple function to check if the path exists
const doesPathExist = fs_1.default.existsSync;
const getLibrary = () => {
    // Detect OS; darwin, linux and windows are only supported
    const platform = os_1.default.platform();
    if (platform !== 'linux' && platform !== 'win32' && platform !== 'darwin')
        throw new Error(`Unsupported platform: ${platform}. linux, win32 and darwin are supported.`);
    // Get a potential path from the environment variable
    const pathFromEnvironment = process.env[ENV_VAR];
    // Get the paths specific to the users operating system
    const platformPaths = libPaths[platform];
    // Check if the path from the environment variable is supplied and add it
    // We use unshift here so that when we want to get a valid library path this will be the first to resolve
    if (pathFromEnvironment)
        platformPaths.unshift(pathFromEnvironment);
    // Create the path + file
    const libraries = platformPaths.map((p) => { var _a; return path_1.default.join(p, `${(_a = extensions[platform].prefix) !== null && _a !== void 0 ? _a : ''}${LIBNAME}${extensions[platform].extension}`); });
    // Gaurd so we quit if there is no valid path for the library
    if (!libraries.some(doesPathExist))
        throw new Error(`Could not find ${LIBNAME} with these paths: ${libraries.join(' ')}`);
    // Get the first valid library
    // Casting here as a string because there is a guard of none of the paths
    // would be valid
    const validLibraryPath = libraries.find((l) => doesPathExist(l));
    return (0, ffi_napi_1.Library)(validLibraryPath, {
        postgresstorage_init: [ref_napi_1.types.int, []],
        init_storagetype: [ref_napi_1.types.int, ['string', 'string']],
    });
};
let indyPostgresStorage;
var IndySdkPostgresWalletScheme;
(function (IndySdkPostgresWalletScheme) {
    IndySdkPostgresWalletScheme["DatabasePerWallet"] = "DatabasePerWallet";
    IndySdkPostgresWalletScheme["MultiWalletSingleTable"] = "MultiWalletSingleTable";
    IndySdkPostgresWalletScheme["MultiWalletSingleTableSharedPool"] = "MultiWalletSingleTableSharedPool";
})(IndySdkPostgresWalletScheme || (exports.IndySdkPostgresWalletScheme = IndySdkPostgresWalletScheme = {}));
function loadIndySdkPostgresPlugin(config, credentials) {
    if (!indyPostgresStorage) {
        indyPostgresStorage = getLibrary();
    }
    indyPostgresStorage.postgresstorage_init();
    indyPostgresStorage.init_storagetype(JSON.stringify(config), JSON.stringify(credentials));
}
