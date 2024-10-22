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
const rxjs_1 = require("rxjs");
const InMemoryStorageService_1 = require("../../../../../tests/InMemoryStorageService");
const helpers_1 = require("../../../tests/helpers");
const EventEmitter_1 = require("../../agent/EventEmitter");
const error_1 = require("../../error");
const Repository_1 = require("../Repository");
const RepositoryEvents_1 = require("../RepositoryEvents");
const TestRecord_1 = require("./TestRecord");
jest.mock('../../../../../tests/InMemoryStorageService');
const StorageMock = InMemoryStorageService_1.InMemoryStorageService;
const config = (0, helpers_1.getAgentConfig)('Repository');
describe('Repository', () => {
    let repository;
    let storageMock;
    let agentContext;
    let eventEmitter;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        storageMock = new StorageMock();
        eventEmitter = new EventEmitter_1.EventEmitter(config.agentDependencies, new rxjs_1.Subject());
        repository = new Repository_1.Repository(TestRecord_1.TestRecord, storageMock, eventEmitter);
        agentContext = (0, helpers_1.getAgentContext)();
    }));
    const getRecord = ({ id, tags } = {}) => {
        return new TestRecord_1.TestRecord({
            id,
            foo: 'bar',
            tags: tags !== null && tags !== void 0 ? tags : { myTag: 'foobar' },
        });
    };
    describe('save()', () => {
        it('should save the record using the storage service', () => __awaiter(void 0, void 0, void 0, function* () {
            const record = getRecord({ id: 'test-id' });
            yield repository.save(agentContext, record);
            expect(storageMock.save).toBeCalledWith(agentContext, record);
        }));
        it(`should emit saved event`, () => __awaiter(void 0, void 0, void 0, function* () {
            const eventListenerMock = jest.fn();
            eventEmitter.on(RepositoryEvents_1.RepositoryEventTypes.RecordSaved, eventListenerMock);
            // given
            const record = getRecord({ id: 'test-id' });
            // when
            yield repository.save(agentContext, record);
            // then
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: 'RecordSaved',
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    record: expect.objectContaining({
                        id: 'test-id',
                    }),
                },
            });
        }));
    });
    describe('update()', () => {
        it('should update the record using the storage service', () => __awaiter(void 0, void 0, void 0, function* () {
            const record = getRecord({ id: 'test-id' });
            yield repository.update(agentContext, record);
            expect(storageMock.update).toBeCalledWith(agentContext, record);
        }));
        it(`should emit updated event`, () => __awaiter(void 0, void 0, void 0, function* () {
            const eventListenerMock = jest.fn();
            eventEmitter.on(RepositoryEvents_1.RepositoryEventTypes.RecordUpdated, eventListenerMock);
            // given
            const record = getRecord({ id: 'test-id' });
            // when
            yield repository.update(agentContext, record);
            // then
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: 'RecordUpdated',
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    record: expect.objectContaining({
                        id: 'test-id',
                    }),
                },
            });
        }));
    });
    describe('delete()', () => {
        it('should delete the record using the storage service', () => __awaiter(void 0, void 0, void 0, function* () {
            const record = getRecord({ id: 'test-id' });
            yield repository.delete(agentContext, record);
            expect(storageMock.delete).toBeCalledWith(agentContext, record);
        }));
        it(`should emit deleted event`, () => __awaiter(void 0, void 0, void 0, function* () {
            const eventListenerMock = jest.fn();
            eventEmitter.on(RepositoryEvents_1.RepositoryEventTypes.RecordDeleted, eventListenerMock);
            // given
            const record = getRecord({ id: 'test-id' });
            // when
            yield repository.delete(agentContext, record);
            // then
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: 'RecordDeleted',
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    record: expect.objectContaining({
                        id: 'test-id',
                    }),
                },
            });
        }));
    });
    describe('deleteById()', () => {
        it('should delete the record by record id', () => __awaiter(void 0, void 0, void 0, function* () {
            yield repository.deleteById(agentContext, 'test-id');
            expect(storageMock.deleteById).toBeCalledWith(agentContext, TestRecord_1.TestRecord, 'test-id');
        }));
        it(`should emit deleted event`, () => __awaiter(void 0, void 0, void 0, function* () {
            const eventListenerMock = jest.fn();
            eventEmitter.on(RepositoryEvents_1.RepositoryEventTypes.RecordDeleted, eventListenerMock);
            const record = getRecord({ id: 'test-id' });
            yield repository.deleteById(agentContext, record.id);
            expect(eventListenerMock).toHaveBeenCalledWith({
                type: 'RecordDeleted',
                metadata: {
                    contextCorrelationId: 'mock',
                },
                payload: {
                    record: expect.objectContaining({
                        id: record.id,
                        type: record.type,
                    }),
                },
            });
        }));
    });
    describe('getById()', () => {
        it('should get the record using the storage service', () => __awaiter(void 0, void 0, void 0, function* () {
            const record = getRecord({ id: 'test-id' });
            (0, helpers_1.mockFunction)(storageMock.getById).mockReturnValue(Promise.resolve(record));
            const returnValue = yield repository.getById(agentContext, 'test-id');
            expect(storageMock.getById).toBeCalledWith(agentContext, TestRecord_1.TestRecord, 'test-id');
            expect(returnValue).toBe(record);
        }));
    });
    describe('findById()', () => {
        it('should get the record using the storage service', () => __awaiter(void 0, void 0, void 0, function* () {
            const record = getRecord({ id: 'test-id' });
            (0, helpers_1.mockFunction)(storageMock.getById).mockReturnValue(Promise.resolve(record));
            const returnValue = yield repository.findById(agentContext, 'test-id');
            expect(storageMock.getById).toBeCalledWith(agentContext, TestRecord_1.TestRecord, 'test-id');
            expect(returnValue).toBe(record);
        }));
        it('should return null if the storage service throws RecordNotFoundError', () => __awaiter(void 0, void 0, void 0, function* () {
            (0, helpers_1.mockFunction)(storageMock.getById).mockReturnValue(Promise.reject(new error_1.RecordNotFoundError('Not found', { recordType: TestRecord_1.TestRecord.type })));
            const returnValue = yield repository.findById(agentContext, 'test-id');
            expect(storageMock.getById).toBeCalledWith(agentContext, TestRecord_1.TestRecord, 'test-id');
            expect(returnValue).toBeNull();
        }));
        it('should return null if the storage service throws an error that is not RecordNotFoundError', () => __awaiter(void 0, void 0, void 0, function* () {
            (0, helpers_1.mockFunction)(storageMock.getById).mockReturnValue(Promise.reject(new error_1.AriesFrameworkError('Not found')));
            expect(repository.findById(agentContext, 'test-id')).rejects.toThrowError(error_1.AriesFrameworkError);
            expect(storageMock.getById).toBeCalledWith(agentContext, TestRecord_1.TestRecord, 'test-id');
        }));
    });
    describe('getAll()', () => {
        it('should get the records using the storage service', () => __awaiter(void 0, void 0, void 0, function* () {
            const record = getRecord({ id: 'test-id' });
            const record2 = getRecord({ id: 'test-id2' });
            (0, helpers_1.mockFunction)(storageMock.getAll).mockReturnValue(Promise.resolve([record, record2]));
            const returnValue = yield repository.getAll(agentContext);
            expect(storageMock.getAll).toBeCalledWith(agentContext, TestRecord_1.TestRecord);
            expect(returnValue).toEqual(expect.arrayContaining([record, record2]));
        }));
    });
    describe('findByQuery()', () => {
        it('should get the records using the storage service', () => __awaiter(void 0, void 0, void 0, function* () {
            const record = getRecord({ id: 'test-id' });
            const record2 = getRecord({ id: 'test-id2' });
            (0, helpers_1.mockFunction)(storageMock.findByQuery).mockReturnValue(Promise.resolve([record, record2]));
            const returnValue = yield repository.findByQuery(agentContext, { something: 'interesting' });
            expect(storageMock.findByQuery).toBeCalledWith(agentContext, TestRecord_1.TestRecord, { something: 'interesting' });
            expect(returnValue).toEqual(expect.arrayContaining([record, record2]));
        }));
    });
    describe('findSingleByQuery()', () => {
        it('should get the record using the storage service', () => __awaiter(void 0, void 0, void 0, function* () {
            const record = getRecord({ id: 'test-id' });
            (0, helpers_1.mockFunction)(storageMock.findByQuery).mockReturnValue(Promise.resolve([record]));
            const returnValue = yield repository.findSingleByQuery(agentContext, { something: 'interesting' });
            expect(storageMock.findByQuery).toBeCalledWith(agentContext, TestRecord_1.TestRecord, { something: 'interesting' });
            expect(returnValue).toBe(record);
        }));
        it('should return null if the no records are returned by the storage service', () => __awaiter(void 0, void 0, void 0, function* () {
            (0, helpers_1.mockFunction)(storageMock.findByQuery).mockReturnValue(Promise.resolve([]));
            const returnValue = yield repository.findSingleByQuery(agentContext, { something: 'interesting' });
            expect(storageMock.findByQuery).toBeCalledWith(agentContext, TestRecord_1.TestRecord, { something: 'interesting' });
            expect(returnValue).toBeNull();
        }));
        it('should throw RecordDuplicateError if more than one record is returned by the storage service', () => __awaiter(void 0, void 0, void 0, function* () {
            const record = getRecord({ id: 'test-id' });
            const record2 = getRecord({ id: 'test-id2' });
            (0, helpers_1.mockFunction)(storageMock.findByQuery).mockReturnValue(Promise.resolve([record, record2]));
            expect(repository.findSingleByQuery(agentContext, { something: 'interesting' })).rejects.toThrowError(error_1.RecordDuplicateError);
            expect(storageMock.findByQuery).toBeCalledWith(agentContext, TestRecord_1.TestRecord, { something: 'interesting' });
        }));
    });
    describe('getSingleByQuery()', () => {
        it('should get the record using the storage service', () => __awaiter(void 0, void 0, void 0, function* () {
            const record = getRecord({ id: 'test-id' });
            (0, helpers_1.mockFunction)(storageMock.findByQuery).mockReturnValue(Promise.resolve([record]));
            const returnValue = yield repository.getSingleByQuery(agentContext, { something: 'interesting' });
            expect(storageMock.findByQuery).toBeCalledWith(agentContext, TestRecord_1.TestRecord, { something: 'interesting' });
            expect(returnValue).toBe(record);
        }));
        it('should throw RecordNotFoundError if no records are returned by the storage service', () => __awaiter(void 0, void 0, void 0, function* () {
            (0, helpers_1.mockFunction)(storageMock.findByQuery).mockReturnValue(Promise.resolve([]));
            expect(repository.getSingleByQuery(agentContext, { something: 'interesting' })).rejects.toThrowError(error_1.RecordNotFoundError);
            expect(storageMock.findByQuery).toBeCalledWith(agentContext, TestRecord_1.TestRecord, { something: 'interesting' });
        }));
        it('should throw RecordDuplicateError if more than one record is returned by the storage service', () => __awaiter(void 0, void 0, void 0, function* () {
            const record = getRecord({ id: 'test-id' });
            const record2 = getRecord({ id: 'test-id2' });
            (0, helpers_1.mockFunction)(storageMock.findByQuery).mockReturnValue(Promise.resolve([record, record2]));
            expect(repository.getSingleByQuery(agentContext, { something: 'interesting' })).rejects.toThrowError(error_1.RecordDuplicateError);
            expect(storageMock.findByQuery).toBeCalledWith(agentContext, TestRecord_1.TestRecord, { something: 'interesting' });
        }));
    });
});
