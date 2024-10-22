"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FeatureRegistry_1 = require("../../../agent/FeatureRegistry");
const models_1 = require("../../../agent/models");
const JsonTransformer_1 = require("../../../utils/JsonTransformer");
describe('Feature Registry', () => {
    test('register goal codes', () => {
        const featureRegistry = new FeatureRegistry_1.FeatureRegistry();
        const goalCode = new models_1.GoalCode({ id: 'aries.vc.issue' });
        expect(JsonTransformer_1.JsonTransformer.toJSON(goalCode)).toMatchObject({ id: 'aries.vc.issue', 'feature-type': 'goal-code' });
        featureRegistry.register(goalCode);
        const found = featureRegistry.query({ featureType: models_1.GoalCode.type, match: 'aries.*' });
        expect(found.map((t) => t.toJSON())).toStrictEqual([{ id: 'aries.vc.issue', 'feature-type': 'goal-code' }]);
    });
    test('register generic feature', () => {
        const featureRegistry = new FeatureRegistry_1.FeatureRegistry();
        class GenericFeature extends models_1.Feature {
            constructor(id, customFieldString, customFieldNumber) {
                super({ id, type: 'generic' });
                this.customFieldString = customFieldString;
                this.customFieldNumber = customFieldNumber;
            }
        }
        featureRegistry.register(new GenericFeature('myId', 'myString', 42));
        const found = featureRegistry.query({ featureType: 'generic', match: '*' });
        expect(found.map((t) => t.toJSON())).toStrictEqual([
            { id: 'myId', 'feature-type': 'generic', customFieldString: 'myString', customFieldNumber: 42 },
        ]);
    });
    test('register combined features', () => {
        const featureRegistry = new FeatureRegistry_1.FeatureRegistry();
        featureRegistry.register(new models_1.Protocol({ id: 'https://didcomm.org/dummy/1.0', roles: ['requester'] }), new models_1.Protocol({ id: 'https://didcomm.org/dummy/1.0', roles: ['responder'] }), new models_1.Protocol({ id: 'https://didcomm.org/dummy/1.0', roles: ['responder'] }));
        const found = featureRegistry.query({ featureType: models_1.Protocol.type, match: 'https://didcomm.org/dummy/1.0' });
        expect(found.map((t) => t.toJSON())).toStrictEqual([
            { id: 'https://didcomm.org/dummy/1.0', 'feature-type': 'protocol', roles: ['requester', 'responder'] },
        ]);
    });
});
