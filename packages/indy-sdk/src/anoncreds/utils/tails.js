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
exports.createTailsReader = createTailsReader;
const core_1 = require("@aries-framework/core");
const error_1 = require("../../error");
const types_1 = require("../../types");
/**
 * Get a handler for the blob storage tails file reader.
 *
 * @param agentContext The agent context
 * @param tailsFilePath The path of the tails file
 * @returns The blob storage reader handle
 */
function createTailsReader(agentContext, tailsFilePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileSystem = agentContext.dependencyManager.resolve(core_1.InjectionSymbols.FileSystem);
        const indySdk = agentContext.dependencyManager.resolve(types_1.IndySdkSymbol);
        try {
            agentContext.config.logger.debug(`Opening tails reader at path ${tailsFilePath}`);
            const tailsFileExists = yield fileSystem.exists(tailsFilePath);
            // Extract directory from path (should also work with windows paths)
            const dirname = (0, core_1.getDirFromFilePath)(tailsFilePath);
            if (!tailsFileExists) {
                throw new core_1.AriesFrameworkError(`Tails file does not exist at path ${tailsFilePath}`);
            }
            const tailsReaderConfig = {
                base_dir: dirname,
            };
            const tailsReader = yield indySdk.openBlobStorageReader('default', tailsReaderConfig);
            agentContext.config.logger.debug(`Opened tails reader at path ${tailsFilePath}`);
            return tailsReader;
        }
        catch (error) {
            if ((0, error_1.isIndyError)(error)) {
                throw new error_1.IndySdkError(error);
            }
            throw error;
        }
    });
}
