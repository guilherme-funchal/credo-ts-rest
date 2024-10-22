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
exports.expressAuthentication = expressAuthentication;
const core_1 = require("@credo-ts/core");
const tsyringe_1 = require("tsyringe");
const error_1 = require("./error");
function expressAuthentication(request, securityName, scopes) {
    return __awaiter(this, void 0, void 0, function* () {
        if (securityName === 'tenants') {
            const rootAgent = tsyringe_1.container.resolve(core_1.Agent);
            let tenantId = request.headers['x-tenant-id'] || 'default';
            // If tenants module is not enabled, we always return the root tenant agent
            if (!('tenants' in rootAgent.modules)) {
                if (tenantId !== 'default') {
                    return Promise.reject(new error_1.StatusException("x-tenant-id header with value different than 'default' was provided. When the tenant module is not enabled, only 'default' can be used. Use --multi-tenant to enable multi-tenant capabilities", 400));
                }
                if (scopes === null || scopes === void 0 ? void 0 : scopes.includes('admin')) {
                    return Promise.reject(new error_1.StatusException('Unable to use tenant admin features without tenant module enabled. Use --multi-tenant to enable multi-tenant capabilities', 400));
                }
                return Promise.resolve({ agent: rootAgent });
            }
            // If tenant-id is not provided, we assume we're the default tenant
            tenantId = tenantId || 'default';
            if (typeof tenantId !== 'string') {
                return Promise.reject(new error_1.StatusException('Invalid tenant id provided', 401));
            }
            let requestAgent;
            if (tenantId === 'default') {
                if (!scopes || (!scopes.includes('admin') && !scopes.includes('default'))) {
                    return Promise.reject(new error_1.StatusException('This endpoint cannot be called by the default tenant. Set the x-tenant-id header to a specific tenant id to access this endpoint.', 400));
                }
                requestAgent = rootAgent;
            }
            else {
                if (!scopes || !scopes.includes('tenant')) {
                    return Promise.reject(new error_1.StatusException(`This endpoint cannot be called by a specific tenant. Only the default tenant can access this resource. Omit the x-tenant-id header, or set the value to 'default'`, 400));
                }
                requestAgent = yield rootAgent.modules.tenants.getTenantAgent({ tenantId });
            }
            return Promise.resolve({ agent: requestAgent });
        }
        return Promise.reject(new error_1.StatusException('Not implemented', 401));
    });
}
