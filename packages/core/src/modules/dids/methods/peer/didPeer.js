"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeerDidNumAlgo = void 0;
exports.isValidPeerDid = isValidPeerDid;
exports.getNumAlgoFromPeerDid = getNumAlgoFromPeerDid;
const error_1 = require("../../../../error");
const PEER_DID_REGEX = new RegExp('^did:peer:(([01](z)([1-9a-km-zA-HJ-NP-Z]{5,200}))|(2((.[AEVID](z)([1-9a-km-zA-HJ-NP-Z]{5,200}))+(.(S)[0-9a-zA-Z=]*)?)))$');
function isValidPeerDid(did) {
    const isValid = PEER_DID_REGEX.test(did);
    return isValid;
}
var PeerDidNumAlgo;
(function (PeerDidNumAlgo) {
    PeerDidNumAlgo[PeerDidNumAlgo["InceptionKeyWithoutDoc"] = 0] = "InceptionKeyWithoutDoc";
    PeerDidNumAlgo[PeerDidNumAlgo["GenesisDoc"] = 1] = "GenesisDoc";
    PeerDidNumAlgo[PeerDidNumAlgo["MultipleInceptionKeyWithoutDoc"] = 2] = "MultipleInceptionKeyWithoutDoc";
})(PeerDidNumAlgo || (exports.PeerDidNumAlgo = PeerDidNumAlgo = {}));
function getNumAlgoFromPeerDid(did) {
    const numAlgo = Number(did[9]);
    if (numAlgo !== PeerDidNumAlgo.InceptionKeyWithoutDoc &&
        numAlgo !== PeerDidNumAlgo.GenesisDoc &&
        numAlgo !== PeerDidNumAlgo.MultipleInceptionKeyWithoutDoc) {
        throw new error_1.AriesFrameworkError(`Invalid peer did numAlgo: ${numAlgo}`);
    }
    return numAlgo;
}
