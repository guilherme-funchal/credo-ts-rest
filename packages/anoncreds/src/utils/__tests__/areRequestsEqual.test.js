"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const areRequestsEqual_1 = require("../areRequestsEqual");
const proofRequest = {
    name: 'Proof Request',
    version: '1.0.0',
    nonce: 'nonce',
    ver: '1.0',
    non_revoked: {},
    requested_attributes: {
        a: {
            names: ['name1', 'name2'],
            restrictions: [
                {
                    cred_def_id: 'cred_def_id1',
                },
                {
                    schema_id: 'schema_id',
                },
            ],
        },
    },
    requested_predicates: {
        p: {
            name: 'Hello',
            p_type: '<',
            p_value: 10,
            restrictions: [
                {
                    cred_def_id: 'string2',
                },
                {
                    cred_def_id: 'string',
                },
            ],
        },
    },
};
describe('util | areAnonCredsProofRequestsEqual', () => {
    test('does not compare name, ver, version and nonce', () => {
        expect((0, areRequestsEqual_1.areAnonCredsProofRequestsEqual)(proofRequest, Object.assign(Object.assign({}, proofRequest), { name: 'Proof Request 2', version: '2.0.0', nonce: 'nonce2', ver: '2.0' }))).toBe(true);
    });
    test('check top level non_revocation interval', () => {
        // empty object is semantically equal to undefined
        expect((0, areRequestsEqual_1.areAnonCredsProofRequestsEqual)(proofRequest, Object.assign(Object.assign({}, proofRequest), { non_revoked: {} }))).toBe(true);
        // properties inside object are different
        expect((0, areRequestsEqual_1.areAnonCredsProofRequestsEqual)(Object.assign(Object.assign({}, proofRequest), { non_revoked: {
                to: 5,
            } }), Object.assign(Object.assign({}, proofRequest), { non_revoked: {
                from: 5,
            } }))).toBe(false);
        // One has non_revoked, other doesn't
        expect((0, areRequestsEqual_1.areAnonCredsProofRequestsEqual)(proofRequest, Object.assign(Object.assign({}, proofRequest), { non_revoked: {
                from: 5,
            } }))).toBe(false);
    });
    test('ignores attribute group name differences', () => {
        expect((0, areRequestsEqual_1.areAnonCredsProofRequestsEqual)(proofRequest, Object.assign(Object.assign({}, proofRequest), { requested_attributes: {
                b: proofRequest.requested_attributes.a,
            } }))).toBe(true);
    });
    test('ignores attribute restriction order', () => {
        expect((0, areRequestsEqual_1.areAnonCredsProofRequestsEqual)(proofRequest, Object.assign(Object.assign({}, proofRequest), { requested_attributes: {
                a: Object.assign(Object.assign({}, proofRequest.requested_attributes.a), { restrictions: [...proofRequest.requested_attributes.a.restrictions].reverse() }),
            } }))).toBe(true);
    });
    test('ignores attribute restriction undefined vs empty array', () => {
        expect((0, areRequestsEqual_1.areAnonCredsProofRequestsEqual)(Object.assign(Object.assign({}, proofRequest), { requested_attributes: {
                a: Object.assign(Object.assign({}, proofRequest.requested_attributes.a), { restrictions: undefined }),
            } }), Object.assign(Object.assign({}, proofRequest), { requested_attributes: {
                a: Object.assign(Object.assign({}, proofRequest.requested_attributes.a), { restrictions: [] }),
            } }))).toBe(true);
    });
    test('ignores attribute names order', () => {
        expect((0, areRequestsEqual_1.areAnonCredsProofRequestsEqual)(proofRequest, Object.assign(Object.assign({}, proofRequest), { requested_attributes: {
                a: Object.assign(Object.assign({}, proofRequest.requested_attributes.a), { names: ['name2', 'name1'] }),
            } }))).toBe(true);
    });
    test('checks attribute non_revocation interval', () => {
        // empty object is semantically equal to undefined
        expect((0, areRequestsEqual_1.areAnonCredsProofRequestsEqual)(proofRequest, Object.assign(Object.assign({}, proofRequest), { requested_attributes: {
                a: Object.assign(Object.assign({}, proofRequest.requested_attributes.a), { non_revoked: {} }),
            } }))).toBe(true);
        // properties inside object are different
        expect((0, areRequestsEqual_1.areAnonCredsProofRequestsEqual)(Object.assign(Object.assign({}, proofRequest), { requested_attributes: {
                a: Object.assign(Object.assign({}, proofRequest.requested_attributes.a), { non_revoked: {
                        to: 5,
                    } }),
            } }), Object.assign(Object.assign({}, proofRequest), { requested_attributes: {
                a: Object.assign(Object.assign({}, proofRequest.requested_attributes.a), { non_revoked: {
                        from: 5,
                    } }),
            } }))).toBe(false);
        // One has non_revoked, other doesn't
        expect((0, areRequestsEqual_1.areAnonCredsProofRequestsEqual)(proofRequest, Object.assign(Object.assign({}, proofRequest), { requested_attributes: {
                a: Object.assign(Object.assign({}, proofRequest.requested_attributes.a), { non_revoked: {
                        from: 5,
                    } }),
            } }))).toBe(false);
    });
    test('checks attribute restriction differences', () => {
        expect((0, areRequestsEqual_1.areAnonCredsProofRequestsEqual)(proofRequest, Object.assign(Object.assign({}, proofRequest), { requested_attributes: {
                a: Object.assign(Object.assign({}, proofRequest.requested_attributes.a), { restrictions: [
                        {
                            cred_def_id: 'cred_def_id1',
                        },
                        {
                            cred_def_id: 'cred_def_id2',
                        },
                    ] }),
            } }))).toBe(false);
    });
    test('checks attribute name differences', () => {
        expect((0, areRequestsEqual_1.areAnonCredsProofRequestsEqual)(proofRequest, Object.assign(Object.assign({}, proofRequest), { requested_attributes: {
                a: Object.assign(Object.assign({}, proofRequest.requested_attributes.a), { names: ['name3'] }),
            } }))).toBe(false);
        expect((0, areRequestsEqual_1.areAnonCredsProofRequestsEqual)(proofRequest, Object.assign(Object.assign({}, proofRequest), { requested_attributes: {
                a: Object.assign(Object.assign({}, proofRequest.requested_attributes.a), { name: 'name3', names: undefined }),
            } }))).toBe(false);
    });
    test('ignores predicate group name differences', () => {
        expect((0, areRequestsEqual_1.areAnonCredsProofRequestsEqual)(proofRequest, Object.assign(Object.assign({}, proofRequest), { requested_predicates: {
                a: proofRequest.requested_predicates.p,
            } }))).toBe(true);
    });
    test('ignores predicate restriction order', () => {
        expect((0, areRequestsEqual_1.areAnonCredsProofRequestsEqual)(proofRequest, Object.assign(Object.assign({}, proofRequest), { requested_predicates: {
                p: Object.assign(Object.assign({}, proofRequest.requested_predicates.p), { restrictions: [...proofRequest.requested_predicates.p.restrictions].reverse() }),
            } }))).toBe(true);
    });
    test('ignores predicate restriction undefined vs empty array', () => {
        expect((0, areRequestsEqual_1.areAnonCredsProofRequestsEqual)(Object.assign(Object.assign({}, proofRequest), { requested_predicates: {
                p: Object.assign(Object.assign({}, proofRequest.requested_predicates.p), { restrictions: undefined }),
            } }), Object.assign(Object.assign({}, proofRequest), { requested_predicates: {
                p: Object.assign(Object.assign({}, proofRequest.requested_predicates.p), { restrictions: [] }),
            } }))).toBe(true);
    });
    test('checks predicate restriction differences', () => {
        expect((0, areRequestsEqual_1.areAnonCredsProofRequestsEqual)(proofRequest, Object.assign(Object.assign({}, proofRequest), { requested_attributes: {
                p: Object.assign(Object.assign({}, proofRequest.requested_predicates.p), { restrictions: [
                        {
                            cred_def_id: 'cred_def_id1',
                        },
                        {
                            cred_def_id: 'cred_def_id2',
                        },
                    ] }),
            } }))).toBe(false);
    });
    test('checks predicate name differences', () => {
        expect((0, areRequestsEqual_1.areAnonCredsProofRequestsEqual)(proofRequest, Object.assign(Object.assign({}, proofRequest), { requested_predicates: {
                p: Object.assign(Object.assign({}, proofRequest.requested_predicates.p), { name: 'name3' }),
            } }))).toBe(false);
    });
    test('checks predicate non_revocation interval', () => {
        // empty object is semantically equal to undefined
        expect((0, areRequestsEqual_1.areAnonCredsProofRequestsEqual)(proofRequest, Object.assign(Object.assign({}, proofRequest), { requested_predicates: {
                p: Object.assign(Object.assign({}, proofRequest.requested_predicates.p), { non_revoked: {} }),
            } }))).toBe(true);
        // properties inside object are different
        expect((0, areRequestsEqual_1.areAnonCredsProofRequestsEqual)(Object.assign(Object.assign({}, proofRequest), { requested_predicates: {
                p: Object.assign(Object.assign({}, proofRequest.requested_predicates.p), { non_revoked: {
                        to: 5,
                    } }),
            } }), Object.assign(Object.assign({}, proofRequest), { requested_predicates: {
                p: Object.assign(Object.assign({}, proofRequest.requested_predicates.p), { non_revoked: {
                        from: 5,
                    } }),
            } }))).toBe(false);
        // One has non_revoked, other doesn't
        expect((0, areRequestsEqual_1.areAnonCredsProofRequestsEqual)(proofRequest, Object.assign(Object.assign({}, proofRequest), { requested_predicates: {
                p: Object.assign(Object.assign({}, proofRequest.requested_predicates.p), { non_revoked: {
                        from: 5,
                    } }),
            } }))).toBe(false);
    });
    test('checks predicate p_type and p_value', () => {
        expect((0, areRequestsEqual_1.areAnonCredsProofRequestsEqual)(proofRequest, Object.assign(Object.assign({}, proofRequest), { requested_predicates: {
                p: Object.assign(Object.assign({}, proofRequest.requested_predicates.p), { p_type: '<', p_value: 134134 }),
            } }))).toBe(false);
    });
});
