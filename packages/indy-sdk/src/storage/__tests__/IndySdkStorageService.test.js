"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const core_1 = require("@aries-framework/core");
const indySdk = __importStar(require("indy-sdk"));
const TestRecord_1 = require("../../../../core/src/storage/__tests__/TestRecord");
const helpers_1 = require("../../../../core/tests/helpers");
const IndySdkWallet_1 = require("../../wallet/IndySdkWallet");
const IndySdkStorageService_1 = require("../IndySdkStorageService");
const agentConfig = (0, helpers_1.getAgentConfig)('IndySdkStorageServiceTest');
const wallet = new IndySdkWallet_1.IndySdkWallet(indySdk, agentConfig.logger, new core_1.SigningProviderRegistry([]));
const agentContext = (0, helpers_1.getAgentContext)({
    wallet,
    agentConfig,
});
const storageService = new IndySdkStorageService_1.IndySdkStorageService(indySdk);
const startDate = Date.now();
describe('IndySdkStorageService', () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        yield wallet.createAndOpen(agentConfig.walletConfig);
    }));
    afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield wallet.delete();
    }));
    const insertRecord = (_a) => __awaiter(void 0, [_a], void 0, function* ({ id, tags }) {
        const props = {
            id,
            foo: 'bar',
            tags: tags !== null && tags !== void 0 ? tags : { myTag: 'foobar' },
        };
        const record = new TestRecord_1.TestRecord(props);
        yield storageService.save(agentContext, record);
        return record;
    });
    describe('tag transformation', () => {
        it('should correctly transform tag values to string before storing', () => __awaiter(void 0, void 0, void 0, function* () {
            const record = yield insertRecord({
                id: 'test-id',
                tags: {
                    someBoolean: true,
                    someOtherBoolean: false,
                    someStringValue: 'string',
                    anArrayValue: ['foo', 'bar'],
                    // booleans are stored as '1' and '0' so we store the string values '1' and '0' as 'n__1' and 'n__0'
                    someStringNumberValue: '1',
                    anotherStringNumberValue: '0',
                },
            });
            const retrieveRecord = yield indySdk.getWalletRecord(wallet.handle, record.type, record.id, {
                retrieveType: true,
                retrieveTags: true,
            });
            expect(retrieveRecord.tags).toEqual({
                someBoolean: '1',
                someOtherBoolean: '0',
                someStringValue: 'string',
                'anArrayValue:foo': '1',
                'anArrayValue:bar': '1',
                someStringNumberValue: 'n__1',
                anotherStringNumberValue: 'n__0',
            });
        }));
        it('should correctly transform tag values from string after retrieving', () => __awaiter(void 0, void 0, void 0, function* () {
            yield indySdk.addWalletRecord(wallet.handle, TestRecord_1.TestRecord.type, 'some-id', '{}', {
                someBoolean: '1',
                someOtherBoolean: '0',
                someStringValue: 'string',
                'anArrayValue:foo': '1',
                'anArrayValue:bar': '1',
                // booleans are stored as '1' and '0' so we store the string values '1' and '0' as 'n__1' and 'n__0'
                someStringNumberValue: 'n__1',
                anotherStringNumberValue: 'n__0',
            });
            const record = yield storageService.getById(agentContext, TestRecord_1.TestRecord, 'some-id');
            expect(record.getTags()).toEqual({
                someBoolean: true,
                someOtherBoolean: false,
                someStringValue: 'string',
                anArrayValue: expect.arrayContaining(['bar', 'foo']),
                someStringNumberValue: '1',
                anotherStringNumberValue: '0',
            });
        }));
    });
    describe('save()', () => {
        it('should throw RecordDuplicateError if a record with the id already exists', () => __awaiter(void 0, void 0, void 0, function* () {
            const record = yield insertRecord({ id: 'test-id' });
            return expect(() => storageService.save(agentContext, record)).rejects.toThrowError(core_1.RecordDuplicateError);
        }));
        it('should save the record', () => __awaiter(void 0, void 0, void 0, function* () {
            const record = yield insertRecord({ id: 'test-id' });
            const found = yield storageService.getById(agentContext, TestRecord_1.TestRecord, 'test-id');
            expect(record).toEqual(found);
        }));
        it('After a save the record should have update the updatedAt property', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const time = startDate;
            const record = yield insertRecord({ id: 'test-updatedAt' });
            expect((_a = record.updatedAt) === null || _a === void 0 ? void 0 : _a.getTime()).toBeGreaterThan(time);
        }));
    });
    describe('getById()', () => {
        it('should throw RecordNotFoundError if the record does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            return expect(() => storageService.getById(agentContext, TestRecord_1.TestRecord, 'does-not-exist')).rejects.toThrowError(core_1.RecordNotFoundError);
        }));
        it('should return the record by id', () => __awaiter(void 0, void 0, void 0, function* () {
            const record = yield insertRecord({ id: 'test-id' });
            const found = yield storageService.getById(agentContext, TestRecord_1.TestRecord, 'test-id');
            expect(found).toEqual(record);
        }));
    });
    describe('update()', () => {
        it('should throw RecordNotFoundError if the record does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            const record = new TestRecord_1.TestRecord({
                id: 'test-id',
                foo: 'test',
                tags: { some: 'tag' },
            });
            return expect(() => storageService.update(agentContext, record)).rejects.toThrowError(core_1.RecordNotFoundError);
        }));
        it('should update the record', () => __awaiter(void 0, void 0, void 0, function* () {
            const record = yield insertRecord({ id: 'test-id' });
            record.replaceTags(Object.assign(Object.assign({}, record.getTags()), { foo: 'bar' }));
            record.foo = 'foobaz';
            yield storageService.update(agentContext, record);
            const retrievedRecord = yield storageService.getById(agentContext, TestRecord_1.TestRecord, record.id);
            expect(retrievedRecord).toEqual(record);
        }));
        it('After a record has been updated it should have updated the updatedAT property', () => __awaiter(void 0, void 0, void 0, function* () {
            const time = startDate;
            const record = yield insertRecord({ id: 'test-id' });
            record.replaceTags(Object.assign(Object.assign({}, record.getTags()), { foo: 'bar' }));
            record.foo = 'foobaz';
            yield storageService.update(agentContext, record);
            const retrievedRecord = yield storageService.getById(agentContext, TestRecord_1.TestRecord, record.id);
            expect(retrievedRecord.createdAt.getTime()).toBeGreaterThan(time);
        }));
    });
    describe('delete()', () => {
        it('should throw RecordNotFoundError if the record does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            const record = new TestRecord_1.TestRecord({
                id: 'test-id',
                foo: 'test',
                tags: { some: 'tag' },
            });
            return expect(() => storageService.delete(agentContext, record)).rejects.toThrowError(core_1.RecordNotFoundError);
        }));
        it('should delete the record', () => __awaiter(void 0, void 0, void 0, function* () {
            const record = yield insertRecord({ id: 'test-id' });
            yield storageService.delete(agentContext, record);
            return expect(() => storageService.getById(agentContext, TestRecord_1.TestRecord, record.id)).rejects.toThrowError(core_1.RecordNotFoundError);
        }));
    });
    describe('getAll()', () => {
        it('should retrieve all records', () => __awaiter(void 0, void 0, void 0, function* () {
            const createdRecords = yield Promise.all(Array(5)
                .fill(undefined)
                .map((_, index) => insertRecord({ id: `record-${index}` })));
            const records = yield storageService.getAll(agentContext, TestRecord_1.TestRecord);
            expect(records).toEqual(expect.arrayContaining(createdRecords));
        }));
    });
    describe('findByQuery()', () => {
        it('should retrieve all records that match the query', () => __awaiter(void 0, void 0, void 0, function* () {
            const expectedRecord = yield insertRecord({ tags: { myTag: 'foobar' } });
            yield insertRecord({ tags: { myTag: 'notfoobar' } });
            const records = yield storageService.findByQuery(agentContext, TestRecord_1.TestRecord, { myTag: 'foobar' });
            expect(records.length).toBe(1);
            expect(records[0]).toEqual(expectedRecord);
        }));
        it('finds records using $and statements', () => __awaiter(void 0, void 0, void 0, function* () {
            const expectedRecord = yield insertRecord({ tags: { myTag: 'foo', anotherTag: 'bar' } });
            yield insertRecord({ tags: { myTag: 'notfoobar' } });
            const records = yield storageService.findByQuery(agentContext, TestRecord_1.TestRecord, {
                $and: [{ myTag: 'foo' }, { anotherTag: 'bar' }],
            });
            expect(records.length).toBe(1);
            expect(records[0]).toEqual(expectedRecord);
        }));
        it('finds records using $or statements', () => __awaiter(void 0, void 0, void 0, function* () {
            const expectedRecord = yield insertRecord({ tags: { myTag: 'foo' } });
            const expectedRecord2 = yield insertRecord({ tags: { anotherTag: 'bar' } });
            yield insertRecord({ tags: { myTag: 'notfoobar' } });
            const records = yield storageService.findByQuery(agentContext, TestRecord_1.TestRecord, {
                $or: [{ myTag: 'foo' }, { anotherTag: 'bar' }],
            });
            expect(records.length).toBe(2);
            expect(records).toEqual(expect.arrayContaining([expectedRecord, expectedRecord2]));
        }));
        it('finds records using $not statements', () => __awaiter(void 0, void 0, void 0, function* () {
            const expectedRecord = yield insertRecord({ tags: { myTag: 'foo' } });
            const expectedRecord2 = yield insertRecord({ tags: { anotherTag: 'bar' } });
            yield insertRecord({ tags: { myTag: 'notfoobar' } });
            const records = yield storageService.findByQuery(agentContext, TestRecord_1.TestRecord, {
                $not: { myTag: 'notfoobar' },
            });
            expect(records.length).toBe(2);
            expect(records).toEqual(expect.arrayContaining([expectedRecord, expectedRecord2]));
        }));
        it('correctly transforms an advanced query into a valid WQL query', () => __awaiter(void 0, void 0, void 0, function* () {
            const indySpy = jest.fn();
            const storageServiceWithoutIndySdk = new IndySdkStorageService_1.IndySdkStorageService({
                openWalletSearch: indySpy,
                fetchWalletSearchNextRecords: jest.fn(() => ({ records: undefined })),
                closeWalletSearch: jest.fn(),
            });
            yield storageServiceWithoutIndySdk.findByQuery(agentContext, TestRecord_1.TestRecord, {
                $and: [
                    {
                        $or: [{ myTag: true }, { myTag: false }],
                    },
                    {
                        $and: [{ theNumber: '0' }, { theNumber: '1' }],
                    },
                ],
                $or: [
                    {
                        aValue: ['foo', 'bar'],
                    },
                ],
                $not: { myTag: 'notfoobar' },
            });
            const expectedQuery = {
                $and: [
                    {
                        $and: undefined,
                        $not: undefined,
                        $or: [
                            { myTag: '1', $and: undefined, $or: undefined, $not: undefined },
                            { myTag: '0', $and: undefined, $or: undefined, $not: undefined },
                        ],
                    },
                    {
                        $or: undefined,
                        $not: undefined,
                        $and: [
                            { theNumber: 'n__0', $and: undefined, $or: undefined, $not: undefined },
                            { theNumber: 'n__1', $and: undefined, $or: undefined, $not: undefined },
                        ],
                    },
                ],
                $or: [
                    {
                        'aValue:foo': '1',
                        'aValue:bar': '1',
                        $and: undefined,
                        $or: undefined,
                        $not: undefined,
                    },
                ],
                $not: { myTag: 'notfoobar', $and: undefined, $or: undefined, $not: undefined },
            };
            expect(indySpy).toBeCalledWith(expect.anything(), expect.anything(), expectedQuery, expect.anything());
        }));
    });
});
