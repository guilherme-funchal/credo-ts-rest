"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rightSplit = rightSplit;
function rightSplit(string, sep, limit) {
    const split = string.split(sep);
    return limit ? [split.slice(0, -limit).join(sep)].concat(split.slice(-limit)) : split;
}
