"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@credo-ts/core");
const recordListener_1 = require("../src/recordListener");
describe('@credo-ts/redux-store', () => {
    test('Should add record', () => {
        const records = [];
        const record = new core_1.ConnectionRecord({
            role: core_1.DidExchangeRole.Requester,
            state: core_1.DidExchangeState.Start,
        });
        expect(records.length).toStrictEqual(0);
        (0, recordListener_1.addRecordInState)(core_1.ConnectionRecord, records, record);
        expect(records.length).toStrictEqual(1);
        (0, recordListener_1.addRecordInState)(core_1.ConnectionRecord, records, record);
        expect(records.length).toStrictEqual(2);
    });
    test('Should update record', () => {
        const records = [];
        const recordOne = new core_1.ConnectionRecord({
            role: core_1.DidExchangeRole.Requester,
            state: core_1.DidExchangeState.Start,
        });
        const recordTwo = new core_1.ConnectionRecord({
            role: core_1.DidExchangeRole.Requester,
            state: core_1.DidExchangeState.Start,
        });
        const modifiedRecordOne = new core_1.ConnectionRecord({
            id: recordOne.id,
            role: core_1.DidExchangeRole.Requester,
            state: core_1.DidExchangeState.InvitationSent,
        });
        (0, recordListener_1.addRecordInState)(core_1.ConnectionRecord, records, recordOne);
        (0, recordListener_1.addRecordInState)(core_1.ConnectionRecord, records, recordTwo);
        expect(records[0].state).toStrictEqual(core_1.DidExchangeState.Start);
        expect(records[1].state).toStrictEqual(core_1.DidExchangeState.Start);
        (0, recordListener_1.updateRecordInState)(core_1.ConnectionRecord, records, modifiedRecordOne);
        expect(records[0].state).toStrictEqual(core_1.DidExchangeState.InvitationSent);
        expect(records[1].state).toStrictEqual(core_1.DidExchangeState.Start);
    });
    test('Should remove record', () => {
        const records = [];
        const record = new core_1.ConnectionRecord({
            role: core_1.DidExchangeRole.Requester,
            state: core_1.DidExchangeState.Start,
        });
        (0, recordListener_1.addRecordInState)(core_1.ConnectionRecord, records, record);
        expect(records.length).toStrictEqual(1);
        (0, recordListener_1.removeRecordInState)(core_1.ConnectionRecord, records, record);
        expect(records.length).toStrictEqual(0);
    });
});
