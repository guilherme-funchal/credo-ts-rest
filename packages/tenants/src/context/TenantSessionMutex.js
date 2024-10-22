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
exports.TenantSessionMutex = void 0;
const core_1 = require("@aries-framework/core");
const async_mutex_1 = require("async-mutex");
/**
 * Keep track of the total number of tenant sessions currently active. This doesn't actually manage the tenant sessions itself, or have anything to do with
 * the agent context. It merely counts the current number of sessions, and provides a mutex to lock new sessions from being created once the maximum number
 * of sessions has been created. Session that can't be required withing the specified sessionsAcquireTimeout will throw an error.
 */
class TenantSessionMutex {
    constructor(logger, maxSessions = Infinity, sessionAcquireTimeout) {
        this._currentSessions = 0;
        this.maxSessions = Infinity;
        this.logger = logger;
        this.maxSessions = maxSessions;
        // Session mutex, it can take at most sessionAcquireTimeout to acquire a session, otherwise it will fail with the error below
        this.sessionMutex = (0, async_mutex_1.withTimeout)(new async_mutex_1.Mutex(), sessionAcquireTimeout, new core_1.AriesFrameworkError(`Failed to acquire an agent context session within ${sessionAcquireTimeout}ms`));
    }
    /**
     * Getter to retrieve the total number of current sessions.
     */
    get currentSessions() {
        return this._currentSessions;
    }
    set currentSessions(value) {
        this._currentSessions = value;
    }
    /**
     * Wait to acquire a session. Will use the session semaphore to keep total number of sessions limited.
     * For each session that is acquired using this method, the sessions MUST be closed by calling `releaseSession`.
     * Failing to do so can lead to deadlocks over time.
     */
    acquireSession() {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: We should update this to be weighted
            // This will allow to weight sessions for contexts that already exist lower than sessions
            // for contexts that need to be created (new injection container, wallet session etc..)
            // E.g. opening a context could weigh 5, adding sessions to it would be 1 for each
            this.logger.debug('Acquiring tenant session');
            // If we're out of sessions, wait for one to be released.
            if (this.sessionMutex.isLocked()) {
                this.logger.debug('Session mutex is locked, waiting for it to unlock');
                // FIXME: waitForUnlock doesn't work with withTimeout but provides a better API (would rather not acquire and lock)
                // await this.sessionMutex.waitForUnlock()
                // Workaround https://github.com/MatrixAI/js-async-locks/pull/3/files#diff-4ee6a7d91cb8428765713bc3045e1dda5d43214030657a9c04804e96d68778bfR46-R61
                yield this.sessionMutex.acquire();
                if (this.currentSessions < this.maxSessions) {
                    this.sessionMutex.release();
                }
            }
            this.logger.debug(`Increasing current session count to ${this.currentSessions + 1} (max: ${this.maxSessions})`);
            // We have waited for the session to unlock,
            this.currentSessions++;
            // If we reached the limit we should lock the session mutex
            if (this.currentSessions >= this.maxSessions) {
                this.logger.debug(`Reached max number of sessions ${this.maxSessions}, locking mutex`);
                yield this.sessionMutex.acquire();
            }
            this.logger.debug(`Acquired tenant session (${this.currentSessions} / ${this.maxSessions})`);
        });
    }
    /**
     * Release a session from the session mutex. If the total number of current sessions drops below
     * the max number of sessions, the session mutex will be released so new sessions can be started.
     */
    releaseSession() {
        this.logger.debug('Releasing tenant session');
        if (this.currentSessions > 0) {
            this.logger.debug(`Decreasing current sessions to ${this.currentSessions - 1} (max: ${this.maxSessions})`);
            this.currentSessions--;
        }
        else {
            this.logger.warn('Total sessions is already at 0, and releasing a session should not happen in this case. Not decrementing current session count.');
        }
        // If the number of current sessions is lower than the max number of sessions we can release the mutex
        if (this.sessionMutex.isLocked() && this.currentSessions < this.maxSessions) {
            this.logger.debug(`Releasing session mutex as number of current sessions ${this.currentSessions} is below max number of sessions ${this.maxSessions}`);
            // Even though marked as deprecated, it is not actually deprecated and will be kept
            // https://github.com/DirtyHairy/async-mutex/issues/50#issuecomment-1007785141
            this.sessionMutex.release();
        }
    }
}
exports.TenantSessionMutex = TenantSessionMutex;
