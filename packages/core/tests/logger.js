"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestLogger = void 0;
const fs_1 = require("fs");
const tslog_1 = require("tslog");
const logger_1 = require("../src/logger");
const BaseLogger_1 = require("../src/logger/BaseLogger");
const replaceError_1 = require("../src/logger/replaceError");
function logToTransport(logObject) {
    (0, fs_1.appendFileSync)('logs.txt', JSON.stringify(logObject) + '\n');
}
class TestLogger extends BaseLogger_1.BaseLogger {
    static fromLogger(logger, name) {
        return new TestLogger(logger.logLevel, name, logger.logger);
    }
    constructor(logLevel, name, logger) {
        super(logLevel);
        // Map our log levels to tslog levels
        this.tsLogLevelStringMap = {
            [logger_1.LogLevel.test]: 'silly',
            [logger_1.LogLevel.trace]: 'trace',
            [logger_1.LogLevel.debug]: 'debug',
            [logger_1.LogLevel.info]: 'info',
            [logger_1.LogLevel.warn]: 'warn',
            [logger_1.LogLevel.error]: 'error',
            [logger_1.LogLevel.fatal]: 'fatal',
        };
        // Map our log levels to tslog levels
        this.tsLogLevelNumberMap = {
            [logger_1.LogLevel.test]: 0,
            [logger_1.LogLevel.trace]: 1,
            [logger_1.LogLevel.debug]: 2,
            [logger_1.LogLevel.info]: 3,
            [logger_1.LogLevel.warn]: 4,
            [logger_1.LogLevel.error]: 5,
            [logger_1.LogLevel.fatal]: 6,
        };
        if (logger) {
            this.logger = logger.getSubLogger({
                name,
                minLevel: this.logLevel == logger_1.LogLevel.off ? undefined : this.tsLogLevelNumberMap[this.logLevel],
            });
        }
        else {
            this.logger = new tslog_1.Logger({
                name,
                minLevel: this.logLevel == logger_1.LogLevel.off ? undefined : this.tsLogLevelNumberMap[this.logLevel],
                attachedTransports: [logToTransport],
            });
        }
    }
    log(level, message, data) {
        const tsLogLevel = this.tsLogLevelStringMap[level];
        if (this.logLevel === logger_1.LogLevel.off)
            return;
        if (data) {
            this.logger[tsLogLevel](message, JSON.parse(JSON.stringify(data, replaceError_1.replaceError, 2)));
        }
        else {
            this.logger[tsLogLevel](message);
        }
    }
    test(message, data) {
        this.log(logger_1.LogLevel.test, message, data);
    }
    trace(message, data) {
        this.log(logger_1.LogLevel.trace, message, data);
    }
    debug(message, data) {
        this.log(logger_1.LogLevel.debug, message, data);
    }
    info(message, data) {
        this.log(logger_1.LogLevel.info, message, data);
    }
    warn(message, data) {
        this.log(logger_1.LogLevel.warn, message, data);
    }
    error(message, data) {
        this.log(logger_1.LogLevel.error, message, data);
    }
    fatal(message, data) {
        this.log(logger_1.LogLevel.fatal, message, data);
    }
}
exports.TestLogger = TestLogger;
const testLogger = new TestLogger(logger_1.LogLevel.off);
exports.default = testLogger;
