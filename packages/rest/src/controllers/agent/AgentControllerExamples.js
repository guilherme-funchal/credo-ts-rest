"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentInfoExample = void 0;
// NOTE: using satisfies breaks the tsoa example generation
exports.agentInfoExample = {
    config: {
        label: 'Example Agent',
        endpoints: ['http://localhost:3000'],
    },
    isInitialized: true,
};
