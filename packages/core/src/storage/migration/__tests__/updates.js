"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const updates_1 = require("../updates");
const _0_1_0_2_1 = require("../updates/0.1-0.2");
describe('supportedUpdates', () => {
    // This test is intentional to be bumped explicitly when a new upgrade is added
    it('supports 1 update(s)', () => {
        expect(updates_1.supportedUpdates.length).toBe(1);
    });
    it('supports an update from 0.1 to 0.2', () => {
        const upgrade = updates_1.supportedUpdates[0];
        expect(upgrade.fromVersion).toBe('0.1');
        expect(upgrade.toVersion).toBe('0.2');
        expect(upgrade.doUpdate).toBe(_0_1_0_2_1.updateV0_1ToV0_2);
    });
});
