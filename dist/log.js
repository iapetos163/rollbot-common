"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageLogReader = exports.MessageLogWriter = exports.LOG_BUFFER_SIZE = void 0;
const fs_1 = require("fs");
const header_1 = require("./header");
exports.LOG_BUFFER_SIZE = header_1.HEADER_SIZE + 8;
const readLogData = (buffer, offset) => {
    const { messageId, timestamp: sentTimestamp } = (0, header_1.decodeHeader)(buffer.slice(offset, offset + header_1.HEADER_SIZE));
    const receivedTimestamp = buffer.readBigUInt64BE(offset + header_1.HEADER_SIZE);
    return { messageId, sentTimestamp, receivedTimestamp };
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
     * @param buffer 17 bytes
     * @param header 9 bytes
     */
    recordToLog(buffer, header, timestamp) {
        return new Promise((resolve, reject) => {
            buffer.fill(header, 0);
            buffer.writeBigUInt64BE(timestamp, header_1.HEADER_SIZE);
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
class MessageLogReader {
    in;
    constructor(logFilePath) {
        this.in = (0, fs_1.createReadStream)(logFilePath);
    }
    close() {
        return new Promise((resolve, reject) => {
            this.in.close(err => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
    *read() {
        const partial = Buffer.alloc(exports.LOG_BUFFER_SIZE);
        let partialFilled = 0;
        let chunk = this.in.read();
        while (chunk) {
            let offset = 0;
            if (partialFilled > 0) {
                offset = exports.LOG_BUFFER_SIZE - partialFilled;
                partial.fill(chunk.slice(0, exports.LOG_BUFFER_SIZE - partialFilled), partialFilled);
                yield readLogData(partial, 0);
            }
            while (offset + exports.LOG_BUFFER_SIZE <= chunk.length) {
                yield readLogData(chunk, offset);
                offset += exports.LOG_BUFFER_SIZE;
            }
            partialFilled = chunk.length - offset;
            if (partialFilled > 0) {
                partial.fill(chunk.slice(offset), 0, partialFilled);
            }
            chunk = this.in.read();
        }
        if (partialFilled > 0) {
            throw new Error(`Input file size was not a multiple of ${exports.LOG_BUFFER_SIZE} bytes`);
        }
    }
}
exports.MessageLogReader = MessageLogReader;
