"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.message = exports.MessageType = exports.MessageLogWriter = exports.MessageLogReader = exports.LOG_BUFFER_SIZE = exports.HEADER_SIZE = void 0;
var header_1 = require("./header");
Object.defineProperty(exports, "HEADER_SIZE", { enumerable: true, get: function () { return header_1.HEADER_SIZE; } });
var log_1 = require("./log");
Object.defineProperty(exports, "LOG_BUFFER_SIZE", { enumerable: true, get: function () { return log_1.LOG_BUFFER_SIZE; } });
Object.defineProperty(exports, "MessageLogReader", { enumerable: true, get: function () { return log_1.MessageLogReader; } });
Object.defineProperty(exports, "MessageLogWriter", { enumerable: true, get: function () { return log_1.MessageLogWriter; } });
const message_1 = require("./message");
var message_2 = require("./message");
Object.defineProperty(exports, "MessageType", { enumerable: true, get: function () { return message_2.MessageType; } });
exports.message = {
    encodeClientData: message_1.encodeClientData, encodeFeedbackCommand: message_1.encodeFeedbackCommand, encodeFeedbackTraining: message_1.encodeFeedbackTraining, encodeManualCommand: message_1.encodeManualCommand,
    decode: message_1.decodeMessage,
};
