"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionAnswerService = void 0;
const core_1 = require("@aries-framework/core");
const QuestionAnswerEvents_1 = require("../QuestionAnswerEvents");
const QuestionAnswerRole_1 = require("../QuestionAnswerRole");
const messages_1 = require("../messages");
const models_1 = require("../models");
const repository_1 = require("../repository");
let QuestionAnswerService = (() => {
    let _classDecorators = [(0, core_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var QuestionAnswerService = _classThis = class {
        constructor(questionAnswerRepository, eventEmitter, logger) {
            this.questionAnswerRepository = questionAnswerRepository;
            this.eventEmitter = eventEmitter;
            this.logger = logger;
        }
        /**
         * Create a question message and a new QuestionAnswer record for the questioner role
         *
         * @param question text for question message
         * @param details optional details for question message
         * @param connectionId connection for QuestionAnswer record
         * @param validResponses array of valid responses for question
         * @returns question message and QuestionAnswer record
         */
        createQuestion(agentContext, connectionId, config) {
            return __awaiter(this, void 0, void 0, function* () {
                const questionMessage = new messages_1.QuestionMessage({
                    questionText: config.question,
                    questionDetail: config === null || config === void 0 ? void 0 : config.detail,
                    signatureRequired: false,
                    validResponses: config.validResponses,
                });
                const questionAnswerRecord = yield this.createRecord({
                    questionText: questionMessage.questionText,
                    questionDetail: questionMessage.questionDetail,
                    threadId: questionMessage.threadId,
                    connectionId: connectionId,
                    role: QuestionAnswerRole_1.QuestionAnswerRole.Questioner,
                    signatureRequired: false,
                    state: models_1.QuestionAnswerState.QuestionSent,
                    validResponses: questionMessage.validResponses,
                });
                yield this.questionAnswerRepository.save(agentContext, questionAnswerRecord);
                this.eventEmitter.emit(agentContext, {
                    type: QuestionAnswerEvents_1.QuestionAnswerEventTypes.QuestionAnswerStateChanged,
                    payload: { previousState: null, questionAnswerRecord },
                });
                return { questionMessage, questionAnswerRecord };
            });
        }
        /**
         * receive question message and create record for responder role
         *
         * @param messageContext the message context containing a question message
         * @returns QuestionAnswer record
         */
        processReceiveQuestion(messageContext) {
            return __awaiter(this, void 0, void 0, function* () {
                const { message: questionMessage } = messageContext;
                this.logger.debug(`Receiving question message with id ${questionMessage.id}`);
                const connection = messageContext.assertReadyConnection();
                const questionRecord = yield this.findByThreadAndConnectionId(messageContext.agentContext, connection.id, questionMessage.id);
                if (questionRecord) {
                    throw new core_1.AriesFrameworkError(`Question answer record with thread Id ${questionMessage.id} already exists.`);
                }
                const questionAnswerRecord = yield this.createRecord({
                    questionText: questionMessage.questionText,
                    questionDetail: questionMessage.questionDetail,
                    connectionId: connection === null || connection === void 0 ? void 0 : connection.id,
                    threadId: questionMessage.threadId,
                    role: QuestionAnswerRole_1.QuestionAnswerRole.Responder,
                    signatureRequired: false,
                    state: models_1.QuestionAnswerState.QuestionReceived,
                    validResponses: questionMessage.validResponses,
                });
                yield this.questionAnswerRepository.save(messageContext.agentContext, questionAnswerRecord);
                this.eventEmitter.emit(messageContext.agentContext, {
                    type: QuestionAnswerEvents_1.QuestionAnswerEventTypes.QuestionAnswerStateChanged,
                    payload: { previousState: null, questionAnswerRecord },
                });
                return questionAnswerRecord;
            });
        }
        /**
         * create answer message, check that response is valid
         *
         * @param questionAnswerRecord record containing question and valid responses
         * @param response response used in answer message
         * @returns answer message and QuestionAnswer record
         */
        createAnswer(agentContext, questionAnswerRecord, response) {
            return __awaiter(this, void 0, void 0, function* () {
                const answerMessage = new messages_1.AnswerMessage({ response: response, threadId: questionAnswerRecord.threadId });
                questionAnswerRecord.assertState(models_1.QuestionAnswerState.QuestionReceived);
                questionAnswerRecord.response = response;
                if (questionAnswerRecord.validResponses.some((e) => e.text === response)) {
                    yield this.updateState(agentContext, questionAnswerRecord, models_1.QuestionAnswerState.AnswerSent);
                }
                else {
                    throw new core_1.AriesFrameworkError(`Response does not match valid responses`);
                }
                return { answerMessage, questionAnswerRecord };
            });
        }
        /**
         * receive answer as questioner
         *
         * @param messageContext the message context containing an answer message message
         * @returns QuestionAnswer record
         */
        receiveAnswer(messageContext) {
            return __awaiter(this, void 0, void 0, function* () {
                const { message: answerMessage } = messageContext;
                this.logger.debug(`Receiving answer message with id ${answerMessage.id}`);
                const connection = messageContext.assertReadyConnection();
                const questionAnswerRecord = yield this.findByThreadAndConnectionId(messageContext.agentContext, connection.id, answerMessage.threadId);
                if (!questionAnswerRecord) {
                    throw new core_1.AriesFrameworkError(`Question Answer record with thread Id ${answerMessage.threadId} not found.`);
                }
                questionAnswerRecord.assertState(models_1.QuestionAnswerState.QuestionSent);
                questionAnswerRecord.assertRole(QuestionAnswerRole_1.QuestionAnswerRole.Questioner);
                questionAnswerRecord.response = answerMessage.response;
                yield this.updateState(messageContext.agentContext, questionAnswerRecord, models_1.QuestionAnswerState.AnswerReceived);
                return questionAnswerRecord;
            });
        }
        /**
         * Update the record to a new state and emit an state changed event. Also updates the record
         * in storage.
         *
         * @param questionAnswerRecord The question answer record to update the state for
         * @param newState The state to update to
         *
         */
        updateState(agentContext, questionAnswerRecord, newState) {
            return __awaiter(this, void 0, void 0, function* () {
                const previousState = questionAnswerRecord.state;
                questionAnswerRecord.state = newState;
                yield this.questionAnswerRepository.update(agentContext, questionAnswerRecord);
                this.eventEmitter.emit(agentContext, {
                    type: QuestionAnswerEvents_1.QuestionAnswerEventTypes.QuestionAnswerStateChanged,
                    payload: {
                        previousState,
                        questionAnswerRecord: questionAnswerRecord,
                    },
                });
            });
        }
        createRecord(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const questionMessageRecord = new repository_1.QuestionAnswerRecord({
                    questionText: options.questionText,
                    questionDetail: options.questionDetail,
                    connectionId: options.connectionId,
                    threadId: options.threadId,
                    role: options.role,
                    signatureRequired: options.signatureRequired,
                    state: options.state,
                    validResponses: options.validResponses,
                });
                return questionMessageRecord;
            });
        }
        /**
         * Retrieve a question answer record by connection id and thread id
         *
         * @param connectionId The connection id
         * @param threadId The thread id
         * @throws {RecordNotFoundError} If no record is found
         * @throws {RecordDuplicateError} If multiple records are found
         * @returns The question answer record
         */
        getByThreadAndConnectionId(agentContext, connectionId, threadId) {
            return this.questionAnswerRepository.getSingleByQuery(agentContext, {
                connectionId,
                threadId,
            });
        }
        /**
         * Retrieve a question answer record by thread id
         *
         * @param connectionId The connection id
         * @param threadId The thread id
         * @returns The question answer record or null if not found
         */
        findByThreadAndConnectionId(agentContext, connectionId, threadId) {
            return this.questionAnswerRepository.findSingleByQuery(agentContext, {
                connectionId,
                threadId,
            });
        }
        /**
         * Retrieve a question answer record by id
         *
         * @param questionAnswerId The questionAnswer record id
         * @throws {RecordNotFoundError} If no record is found
         * @return The question answer record
         *
         */
        getById(agentContext, questionAnswerId) {
            return this.questionAnswerRepository.getById(agentContext, questionAnswerId);
        }
        /**
         * Retrieve a question answer record by id
         *
         * @param questionAnswerId The questionAnswer record id
         * @return The question answer record or null if not found
         *
         */
        findById(agentContext, questionAnswerId) {
            return this.questionAnswerRepository.findById(agentContext, questionAnswerId);
        }
        /**
         * Retrieve a question answer record by id
         *
         * @param questionAnswerId The questionAnswer record id
         * @return The question answer record or null if not found
         *
         */
        getAll(agentContext) {
            return this.questionAnswerRepository.getAll(agentContext);
        }
        findAllByQuery(agentContext, query) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.questionAnswerRepository.findByQuery(agentContext, query);
            });
        }
    };
    __setFunctionName(_classThis, "QuestionAnswerService");
    (() => {
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        QuestionAnswerService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return QuestionAnswerService = _classThis;
})();
exports.QuestionAnswerService = QuestionAnswerService;
