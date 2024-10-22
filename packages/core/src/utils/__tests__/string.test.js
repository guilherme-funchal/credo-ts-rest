"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const string_1 = require("../string");
describe('string', () => {
    describe('rightSplit', () => {
        it('correctly splits a string starting from the right', () => {
            const messageType = 'https://didcomm.org/connections/1.0/invitation';
            expect((0, string_1.rightSplit)(messageType, '/', 3)).toEqual(['https://didcomm.org', 'connections', '1.0', 'invitation']);
        });
    });
});
