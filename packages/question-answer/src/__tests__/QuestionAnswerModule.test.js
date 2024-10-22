"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@aries-framework/core");
const question_answer_1 = require("@aries-framework/question-answer");
const dependencyManager = {
    registerInstance: jest.fn(),
    registerSingleton: jest.fn(),
    registerContextScoped: jest.fn(),
};
const featureRegistry = {
    register: jest.fn(),
};
describe('QuestionAnswerModule', () => {
    test('registers dependencies on the dependency manager', () => {
        const questionAnswerModule = new question_answer_1.QuestionAnswerModule();
        questionAnswerModule.register(dependencyManager, featureRegistry);
        expect(dependencyManager.registerContextScoped).toHaveBeenCalledTimes(1);
        expect(dependencyManager.registerContextScoped).toHaveBeenCalledWith(question_answer_1.QuestionAnswerApi);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledTimes(2);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(question_answer_1.QuestionAnswerService);
        expect(dependencyManager.registerSingleton).toHaveBeenCalledWith(question_answer_1.QuestionAnswerRepository);
        expect(featureRegistry.register).toHaveBeenCalledTimes(1);
        expect(featureRegistry.register).toHaveBeenCalledWith(new core_1.Protocol({
            id: 'https://didcomm.org/questionanswer/1.0',
            roles: [question_answer_1.QuestionAnswerRole.Questioner, question_answer_1.QuestionAnswerRole.Responder],
        }));
    });
});
