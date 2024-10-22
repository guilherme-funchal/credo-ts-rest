"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
jest.setTimeout(120000);
expect.extend({ toBeConnectedWith });
// Custom matchers which can be used to extend Jest matchers via extend, e. g. `expect.extend({ toBeConnectedWith })`.
function toBeConnectedWith(actual, expected) {
    actual.assertReady();
    expected.assertReady();
    const pass = actual.theirDid === expected.did;
    if (pass) {
        return {
            message: () => `expected connection ${actual.theirDid} not to be connected to with ${expected.did}`,
            pass: true,
        };
    }
    else {
        return {
            message: () => `expected connection ${actual.theirDid} to be connected to with ${expected.did}`,
            pass: false,
        };
    }
}
