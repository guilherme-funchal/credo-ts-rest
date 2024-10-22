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
const promises_1 = require("fs/promises");
const tsoa_1 = require("tsoa");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        yield (0, tsoa_1.generateSpecAndRoutes)({});
        // Modify swagger
        const swaggerJson = JSON.parse(yield (0, promises_1.readFile)('./src/generated/swagger.json', 'utf-8'));
        for (const [path, pathValue] of Object.entries(swaggerJson.paths)) {
            for (const [method, methodValue] of Object.entries(pathValue)) {
                swaggerJson.paths[path][method] = Object.assign(Object.assign({}, methodValue), { parameters: [...((_a = methodValue.parameters) !== null && _a !== void 0 ? _a : []), { $ref: '#/components/parameters/tenant' }], 
                    // Removes the security
                    security: undefined });
            }
        }
        yield (0, promises_1.writeFile)('./src/generated/swagger.json', JSON.stringify(swaggerJson, null, 2));
        // eslint-disable-next-line no-console
        console.log('Successfully generated spec and routes');
    });
}
run();
