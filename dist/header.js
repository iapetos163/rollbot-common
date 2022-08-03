"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeHeader = exports.encodeHeader = exports.HEADER_SIZE = void 0;
exports.HEADER_SIZE = 9;
const encodeHeader = ({ messageId, timestamp }) => {
    const buffer = Buffer.alloc(exports.HEADER_SIZE);
    buffer.writeUInt8(messageId[0], 0);
    buffer.writeBigUint64BE(timestamp[0], 1);
    return buffer;
};
exports.encodeHeader = encodeHeader;
const decodeHeader = (buffer) => {
    return {
        messageId: buffer.readUint8(0),
        timestamp: buffer.readBigUInt64BE(1),
    };
};
exports.decodeHeader = decodeHeader;
