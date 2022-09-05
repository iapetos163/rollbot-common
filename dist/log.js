"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readMessageLog = exports.MessageLogWriter = exports.LogType = exports.LOG_BUFFER_SIZE = void 0;
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const header_1 = require("./header");
exports.LOG_BUFFER_SIZE = 9 + header_1.HEADER_SIZE;
var LogType;
(function (LogType) {
    LogType[LogType["Feedback"] = 0] = "Feedback";
    LogType[LogType["ManualCommand"] = 1] = "ManualCommand";
})(LogType = exports.LogType || (exports.LogType = {}));
const readLogData = (buffer, offset) => {
    const type = buffer.readUInt8(offset);
    const receivedTimestamp = buffer.readBigUInt64BE(offset + 1);
    switch (type) {
        case LogType.Feedback: {
            const { messageId, timestamp: sentTimestamp } = (0, header_1.decodeHeader)(buffer.slice(offset + 9, offset + 9 + header_1.HEADER_SIZE));
            return { type, messageId, sentTimestamp, receivedTimestamp };
        }
        case LogType.ManualCommand:
            return {
                type,
                receivedTimestamp,
                rawCommandData: buffer.slice(offset + 9, offset + 11),
            };
        default:
            throw `Unknown message type: ${type}`;
    }
};
class MessageLogWriter {
    out;
    constructor(logFilePath) {
        this.out = (0, fs_1.createWriteStream)(logFilePath);
    }
    close() {
        return new Promise((resolve, reject) => {
            this.out.close(err => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
    /**
     * @param buffer size: `LOG_BUFFER_SIZE`
     * @param header 9 bytes
     */
    writeFeedback(buffer, header, timestamp) {
        return new Promise((resolve, reject) => {
            buffer.writeUint8(LogType.Feedback, 0);
            buffer.writeBigUInt64BE(timestamp, 1);
            buffer.fill(header, 9);
            this.out.write(buffer, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
    /**
     * @param buffer size: `LOG_BUFFER_SIZE`
     * @param rawCommandData 2 bytes
     */
    writeCommand(buffer, rawCommandData, timestamp) {
        return new Promise((resolve, reject) => {
            buffer.writeUint8(LogType.ManualCommand, 0);
            buffer.writeBigUInt64BE(timestamp, 1);
            buffer.fill(rawCommandData, 9);
            this.out.write(buffer, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
}
exports.MessageLogWriter = MessageLogWriter;
const readMessageLog = async (logFilePath) => {
    const data = await (0, promises_1.readFile)(logFilePath);
    const messages = [];
    let offset = 0;
    while (offset + exports.LOG_BUFFER_SIZE <= data.length) {
        messages.push(readLogData(data, offset));
        offset += exports.LOG_BUFFER_SIZE;
    }
    if (offset !== data.length) {
        throw new Error(`Input file size was not a multiple of ${exports.LOG_BUFFER_SIZE} bytes`);
    }
    return messages;
};
exports.readMessageLog = readMessageLog;
