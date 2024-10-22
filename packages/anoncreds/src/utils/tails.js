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
Object.defineProperty(exports, "__esModule", { value: true });
exports.tailsFileExists = tailsFileExists;
exports.downloadTailsFile = downloadTailsFile;
const core_1 = require("@aries-framework/core");
const getTailsFilePath = (cachePath, tailsHash) => `${cachePath}/anoncreds/tails/${tailsHash}`;
function tailsFileExists(agentContext, tailsHash) {
    const fileSystem = agentContext.dependencyManager.resolve(core_1.InjectionSymbols.FileSystem);
    const tailsFilePath = getTailsFilePath(fileSystem.cachePath, tailsHash);
    return fileSystem.exists(tailsFilePath);
}
function downloadTailsFile(agentContext, tailsLocation, tailsHashBase58) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileSystem = agentContext.dependencyManager.resolve(core_1.InjectionSymbols.FileSystem);
        try {
            agentContext.config.logger.debug(`Checking to see if tails file for URL ${tailsLocation} has been stored in the FileSystem`);
            // hash is used as file identifier
            const tailsExists = yield tailsFileExists(agentContext, tailsHashBase58);
            const tailsFilePath = getTailsFilePath(fileSystem.cachePath, tailsHashBase58);
            agentContext.config.logger.debug(`Tails file for ${tailsLocation} ${tailsExists ? 'is stored' : 'is not stored'} at ${tailsFilePath}`);
            if (!tailsExists) {
                agentContext.config.logger.debug(`Retrieving tails file from URL ${tailsLocation}`);
                // download file and verify hash
                yield fileSystem.downloadToFile(tailsLocation, tailsFilePath, {
                    verifyHash: {
                        algorithm: 'sha256',
                        hash: core_1.TypedArrayEncoder.fromBase58(tailsHashBase58),
                    },
                });
                agentContext.config.logger.debug(`Saved tails file to FileSystem at path ${tailsFilePath}`);
            }
            return {
                tailsFilePath,
            };
        }
        catch (error) {
            agentContext.config.logger.error(`Error while retrieving tails file from URL ${tailsLocation}`, {
                error,
            });
            throw error;
        }
    });
}
