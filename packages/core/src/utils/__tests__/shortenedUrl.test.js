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
const node_fetch_1 = require("node-fetch");
const connections_1 = require("../../modules/connections");
const oob_1 = require("../../modules/oob");
const helpers_1 = require("../../modules/oob/helpers");
const JsonTransformer_1 = require("../JsonTransformer");
const MessageValidator_1 = require("../MessageValidator");
const parseInvitation_1 = require("../parseInvitation");
const mockOobInvite = {
    '@type': 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/out-of-band/1.0/invitation',
    '@id': '764af259-8bb4-4546-b91a-924c912d0bb8',
    label: 'Alice',
    handshake_protocols: ['did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0'],
    services: ['did:sov:MvTqVXCEmJ87usL9uQTo7v'],
};
const mockConnectionInvite = {
    '@type': 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/invitation',
    '@id': '20971ef0-1029-46db-a25b-af4c465dd16b',
    label: 'test',
    serviceEndpoint: 'http://sour-cow-15.tun1.indiciotech.io',
    recipientKeys: ['5Gvpf9M4j7vWpHyeTyvBKbjYe7qWc72kGo6qZaLHkLrd'],
};
const header = new node_fetch_1.Headers();
const dummyHeader = new node_fetch_1.Headers();
header.append('Content-Type', 'application/json');
const mockedResponseOobJson = {
    status: 200,
    ok: true,
    headers: header,
    json: () => __awaiter(void 0, void 0, void 0, function* () {
        return ({
            '@type': 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/out-of-band/1.0/invitation',
            '@id': '764af259-8bb4-4546-b91a-924c912d0bb8',
            label: 'Alice',
            handshake_protocols: ['did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0'],
            services: ['did:sov:MvTqVXCEmJ87usL9uQTo7v'],
        });
    }),
};
const mockedResponseOobUrl = {
    status: 200,
    ok: true,
    headers: dummyHeader,
    url: 'https://wonderful-rabbit-5.tun2.indiciotech.io?oob=eyJAdHlwZSI6ICJkaWQ6c292OkJ6Q2JzTlloTXJqSGlxWkRUVUFTSGc7c3BlYy9vdXQtb2YtYmFuZC8xLjAvaW52aXRhdGlvbiIsICJAaWQiOiAiNzY0YWYyNTktOGJiNC00NTQ2LWI5MWEtOTI0YzkxMmQwYmI4IiwgImxhYmVsIjogIkFsaWNlIiwgImhhbmRzaGFrZV9wcm90b2NvbHMiOiBbImRpZDpzb3Y6QnpDYnNOWWhNcmpIaXFaRFRVQVNIZztzcGVjL2Nvbm5lY3Rpb25zLzEuMCJdLCAic2VydmljZXMiOiBbImRpZDpzb3Y6TXZUcVZYQ0VtSjg3dXNMOXVRVG83diJdfQ====',
};
mockedResponseOobUrl.headers = dummyHeader;
const mockedResponseConnectionJson = {
    status: 200,
    ok: true,
    json: () => __awaiter(void 0, void 0, void 0, function* () {
        return ({
            '@type': 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/invitation',
            '@id': '20971ef0-1029-46db-a25b-af4c465dd16b',
            label: 'test',
            serviceEndpoint: 'http://sour-cow-15.tun1.indiciotech.io',
            recipientKeys: ['5Gvpf9M4j7vWpHyeTyvBKbjYe7qWc72kGo6qZaLHkLrd'],
        });
    }),
};
mockedResponseConnectionJson['headers'] = header;
const mockedResponseConnectionUrl = {
    status: 200,
    ok: true,
    url: 'http://sour-cow-15.tun1.indiciotech.io?c_i=eyJAdHlwZSI6ICJkaWQ6c292OkJ6Q2JzTlloTXJqSGlxWkRUVUFTSGc7c3BlYy9jb25uZWN0aW9ucy8xLjAvaW52aXRhdGlvbiIsICJAaWQiOiAiMjA5NzFlZjAtMTAyOS00NmRiLWEyNWItYWY0YzQ2NWRkMTZiIiwgImxhYmVsIjogInRlc3QiLCAic2VydmljZUVuZHBvaW50IjogImh0dHA6Ly9zb3VyLWNvdy0xNS50dW4xLmluZGljaW90ZWNoLmlvIiwgInJlY2lwaWVudEtleXMiOiBbIjVHdnBmOU00ajd2V3BIeWVUeXZCS2JqWWU3cVdjNzJrR282cVphTEhrTHJkIl19',
};
mockedResponseConnectionUrl['headers'] = dummyHeader;
let outOfBandInvitationMock;
let connectionInvitationMock;
let connectionInvitationToNew;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    outOfBandInvitationMock = JsonTransformer_1.JsonTransformer.fromJSON(mockOobInvite, oob_1.OutOfBandInvitation);
    outOfBandInvitationMock.invitationType = oob_1.InvitationType.OutOfBand;
    MessageValidator_1.MessageValidator.validateSync(outOfBandInvitationMock);
    connectionInvitationMock = JsonTransformer_1.JsonTransformer.fromJSON(mockConnectionInvite, connections_1.ConnectionInvitationMessage);
    MessageValidator_1.MessageValidator.validateSync(connectionInvitationMock);
    connectionInvitationToNew = (0, helpers_1.convertToNewInvitation)(connectionInvitationMock);
}));
describe('shortened urls resolving to oob invitations', () => {
    test('Resolve a mocked response in the form of a oob invitation as a json object', () => __awaiter(void 0, void 0, void 0, function* () {
        const short = yield (0, parseInvitation_1.oobInvitationFromShortUrl)(mockedResponseOobJson);
        expect(short).toEqual(outOfBandInvitationMock);
    }));
    test('Resolve a mocked response in the form of a oob invitation encoded in an url', () => __awaiter(void 0, void 0, void 0, function* () {
        const short = yield (0, parseInvitation_1.oobInvitationFromShortUrl)(mockedResponseOobUrl);
        expect(short).toEqual(outOfBandInvitationMock);
    }));
    test("Resolve a mocked response in the form of a oob invitation as a json object with header 'application/json; charset=utf-8'", () => __awaiter(void 0, void 0, void 0, function* () {
        const short = yield (0, parseInvitation_1.oobInvitationFromShortUrl)(Object.assign(Object.assign({}, mockedResponseOobJson), { headers: new node_fetch_1.Headers({
                'content-type': 'application/json; charset=utf-8',
            }) }));
        expect(short).toEqual(outOfBandInvitationMock);
    }));
});
describe('shortened urls resolving to connection invitations', () => {
    test('Resolve a mocked response in the form of a connection invitation as a json object', () => __awaiter(void 0, void 0, void 0, function* () {
        const short = yield (0, parseInvitation_1.oobInvitationFromShortUrl)(mockedResponseConnectionJson);
        expect(short).toEqual(connectionInvitationToNew);
    }));
    test('Resolve a mocked Response in the form of a connection invitation encoded in an url c_i query parameter', () => __awaiter(void 0, void 0, void 0, function* () {
        const short = yield (0, parseInvitation_1.oobInvitationFromShortUrl)(mockedResponseConnectionUrl);
        expect(short).toEqual(connectionInvitationToNew);
    }));
    test('Resolve a mocked Response in the form of a connection invitation encoded in an url oob query parameter', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockedResponseConnectionInOobUrl = {
            status: 200,
            ok: true,
            headers: dummyHeader,
            url: 'https://oob.lissi.io/ssi?oob=eyJAdHlwZSI6ImRpZDpzb3Y6QnpDYnNOWWhNcmpIaXFaRFRVQVNIZztzcGVjL2Nvbm5lY3Rpb25zLzEuMC9pbnZpdGF0aW9uIiwiQGlkIjoiMGU0NmEzYWEtMzUyOC00OTIxLWJmYjItN2JjYjk0NjVjNjZjIiwibGFiZWwiOiJTdGFkdCB8IExpc3NpLURlbW8iLCJzZXJ2aWNlRW5kcG9pbnQiOiJodHRwczovL2RlbW8tYWdlbnQuaW5zdGl0dXRpb25hbC1hZ2VudC5saXNzaS5pZC9kaWRjb21tLyIsImltYWdlVXJsIjoiaHR0cHM6Ly9yb3V0aW5nLmxpc3NpLmlvL2FwaS9JbWFnZS9kZW1vTXVzdGVyaGF1c2VuIiwicmVjaXBpZW50S2V5cyI6WyJEZlcxbzM2ekxuczlVdGlDUGQyalIyS2pvcnRvZkNhcFNTWTdWR2N2WEF6aCJdfQ',
        };
        mockedResponseConnectionInOobUrl.headers = dummyHeader;
        const expectedOobMessage = (0, helpers_1.convertToNewInvitation)(JsonTransformer_1.JsonTransformer.fromJSON({
            '@type': 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/invitation',
            '@id': '0e46a3aa-3528-4921-bfb2-7bcb9465c66c',
            label: 'Stadt | Lissi-Demo',
            serviceEndpoint: 'https://demo-agent.institutional-agent.lissi.id/didcomm/',
            imageUrl: 'https://routing.lissi.io/api/Image/demoMusterhausen',
            recipientKeys: ['DfW1o36zLns9UtiCPd2jR2KjortofCapSSY7VGcvXAzh'],
        }, connections_1.ConnectionInvitationMessage));
        const short = yield (0, parseInvitation_1.oobInvitationFromShortUrl)(mockedResponseConnectionInOobUrl);
        expect(short).toEqual(expectedOobMessage);
    }));
});
