"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockWallet = void 0;
class MockWallet {
    constructor() {
        this.isInitialized = true;
        this.isProvisioned = true;
        this.supportedKeyTypes = [];
    }
    create(walletConfig) {
        throw new Error('Method not implemented.');
    }
    createAndOpen(walletConfig) {
        throw new Error('Method not implemented.');
    }
    open(walletConfig) {
        throw new Error('Method not implemented.');
    }
    rotateKey(walletConfig) {
        throw new Error('Method not implemented.');
    }
    close() {
        throw new Error('Method not implemented.');
    }
    delete() {
        throw new Error('Method not implemented.');
    }
    export(exportConfig) {
        throw new Error('Method not implemented.');
    }
    import(walletConfig, importConfig) {
        throw new Error('Method not implemented.');
    }
    pack(payload, recipientKeys, senderVerkey) {
        throw new Error('Method not implemented.');
    }
    unpack(encryptedMessage) {
        throw new Error('Method not implemented.');
    }
    sign(options) {
        throw new Error('Method not implemented.');
    }
    verify(options) {
        throw new Error('Method not implemented.');
    }
    createKey(options) {
        throw new Error('Method not implemented.');
    }
    generateNonce() {
        throw new Error('Method not implemented.');
    }
    generateWalletKey() {
        throw new Error('Method not implemented.');
    }
    dispose() {
        // Nothing to do here
    }
}
exports.MockWallet = MockWallet;
