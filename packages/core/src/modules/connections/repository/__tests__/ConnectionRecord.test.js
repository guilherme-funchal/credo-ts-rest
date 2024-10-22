"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../../models");
const ConnectionRecord_1 = require("../ConnectionRecord");
describe('ConnectionRecord', () => {
    describe('getTags', () => {
        it('should return default tags', () => {
            const connectionRecord = new ConnectionRecord_1.ConnectionRecord({
                state: models_1.DidExchangeState.Completed,
                role: models_1.DidExchangeRole.Requester,
                threadId: 'a-thread-id',
                mediatorId: 'a-mediator-id',
                did: 'a-did',
                theirDid: 'a-their-did',
                outOfBandId: 'a-out-of-band-id',
                invitationDid: 'a-invitation-did',
            });
            expect(connectionRecord.getTags()).toEqual({
                state: models_1.DidExchangeState.Completed,
                role: models_1.DidExchangeRole.Requester,
                threadId: 'a-thread-id',
                mediatorId: 'a-mediator-id',
                did: 'a-did',
                theirDid: 'a-their-did',
                outOfBandId: 'a-out-of-band-id',
                invitationDid: 'a-invitation-did',
                connectionTypes: [],
            });
        });
    });
});
