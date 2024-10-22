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
const setupIndySdkModule_1 = require("../../indy-sdk/tests/setupIndySdkModule");
const Agent_1 = require("../src/agent/Agent");
const error_1 = require("../src/error");
const helpers_1 = require("./helpers");
const aliceAgentOptions = (0, helpers_1.getAgentOptions)('Generic Records Alice', {
    endpoints: ['rxjs:alice'],
}, (0, setupIndySdkModule_1.getIndySdkModules)());
describe('genericRecords', () => {
    let aliceAgent;
    const fooString = { foo: 'Some data saved' };
    const fooNumber = { foo: 42 };
    const barString = fooString;
    const barNumber = fooNumber;
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield aliceAgent.shutdown();
        yield aliceAgent.wallet.delete();
    }));
    test('store generic-record record', () => __awaiter(void 0, void 0, void 0, function* () {
        aliceAgent = new Agent_1.Agent(aliceAgentOptions);
        yield aliceAgent.initialize();
        // Save genericRecord message (Minimal)
        const savedRecord1 = yield aliceAgent.genericRecords.save({ content: barString });
        // Save genericRecord message with tag
        const tags1 = { myTag: 'foobar1' };
        const tags2 = { myTag: 'foobar2' };
        const savedRecord2 = yield aliceAgent.genericRecords.save({ content: barNumber, tags: tags1 });
        expect(savedRecord1).toBeDefined();
        expect(savedRecord2).toBeDefined();
        const savedRecord3 = yield aliceAgent.genericRecords.save({ content: barString, tags: tags2 });
        expect(savedRecord3).toBeDefined();
        const record = yield aliceAgent.genericRecords.save({ content: barString, tags: tags2, id: 'foo' });
        expect(record.id).toBe('foo');
    }));
    test('get generic-record records', () => __awaiter(void 0, void 0, void 0, function* () {
        //Create genericRecord message
        const savedRecords = yield aliceAgent.genericRecords.getAll();
        expect(savedRecords.length).toBe(4);
    }));
    test('get generic-record specific record', () => __awaiter(void 0, void 0, void 0, function* () {
        //Create genericRecord message
        const savedRecords1 = yield aliceAgent.genericRecords.findAllByQuery({ myTag: 'foobar1' });
        expect((savedRecords1 === null || savedRecords1 === void 0 ? void 0 : savedRecords1.length) === 1).toBe(true);
        expect(savedRecords1[0].content).toEqual({ foo: 42 });
        const savedRecords2 = yield aliceAgent.genericRecords.findAllByQuery({ myTag: 'foobar2' });
        expect(savedRecords2.length === 2).toBe(true);
        expect(savedRecords2[0].content).toEqual({ foo: 'Some data saved' });
    }));
    test('find generic record using id', () => __awaiter(void 0, void 0, void 0, function* () {
        const myId = '100';
        const savedRecord1 = yield aliceAgent.genericRecords.save({ content: barString, id: myId });
        expect(savedRecord1).toBeDefined();
        const retrievedRecord = yield aliceAgent.genericRecords.findById(savedRecord1.id);
        expect(retrievedRecord === null || retrievedRecord === void 0 ? void 0 : retrievedRecord.content).toEqual({ foo: 'Some data saved' });
    }));
    test('delete generic record', () => __awaiter(void 0, void 0, void 0, function* () {
        const myId = '101';
        const savedRecord1 = yield aliceAgent.genericRecords.save({ content: barString, id: myId });
        expect(savedRecord1).toBeDefined();
        yield aliceAgent.genericRecords.delete(savedRecord1);
        const retrievedRecord = yield aliceAgent.genericRecords.findById(savedRecord1.id);
        expect(retrievedRecord).toBeNull();
    }));
    test('delete generic record by id', () => __awaiter(void 0, void 0, void 0, function* () {
        const myId = 'test-id';
        const savedRecord = yield aliceAgent.genericRecords.save({ content: barString, id: myId });
        expect(savedRecord).toBeDefined();
        yield aliceAgent.genericRecords.deleteById(savedRecord.id);
        const retrievedRecord = yield aliceAgent.genericRecords.findById(savedRecord.id);
        expect(retrievedRecord).toBeNull();
    }));
    test('throws an error if record not found by id ', () => __awaiter(void 0, void 0, void 0, function* () {
        const deleteRecordById = () => __awaiter(void 0, void 0, void 0, function* () {
            yield aliceAgent.genericRecords.deleteById('test');
        });
        expect(deleteRecordById).rejects.toThrow(error_1.RecordNotFoundError);
    }));
    test('update generic record', () => __awaiter(void 0, void 0, void 0, function* () {
        const myId = '102';
        const savedRecord1 = yield aliceAgent.genericRecords.save({ content: barString, id: myId });
        expect(savedRecord1).toBeDefined();
        let retrievedRecord = yield aliceAgent.genericRecords.findById(savedRecord1.id);
        expect(retrievedRecord).toBeDefined();
        const amendedFooString = { foo: 'Some even more cool data saved' };
        const barString2 = amendedFooString;
        savedRecord1.content = barString2;
        yield aliceAgent.genericRecords.update(savedRecord1);
        retrievedRecord = yield aliceAgent.genericRecords.findById(savedRecord1.id);
        expect(retrievedRecord === null || retrievedRecord === void 0 ? void 0 : retrievedRecord.content).toEqual({ foo: 'Some even more cool data saved' });
    }));
});
