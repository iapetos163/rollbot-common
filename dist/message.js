"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeMessage = exports.encodeFeedbackTraining = exports.encodeFeedbackCommand = exports.encodeManualCommand = exports.encodeClientData = exports.MessageType = void 0;
const header_1 = require("./header");
var MessageType;
(function (MessageType) {
    MessageType[MessageType["ClientData"] = 0] = "ClientData";
    MessageType[MessageType["ManualCommand"] = 1] = "ManualCommand";
    MessageType[MessageType["FeedbackCommand"] = 2] = "FeedbackCommand";
    MessageType[MessageType["FeedbackTraining"] = 3] = "FeedbackTraining";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
const COMMAND_SIZE = 2;
const ACCEL_OFFSET = 1 + header_1.HEADER_SIZE;
const IMAGE_OFFSET = ACCEL_OFFSET + 6 * 4;
const FEEDBACK_COMMAND_OFFSET = 1 + header_1.HEADER_SIZE;
const encodeClientData = ({ accelerometer, messageId, timestamp, image }) => {
    const buffer = Buffer.allocUnsafe(IMAGE_OFFSET + image.length);
    buffer.writeUint8(MessageType.ClientData, 0);
    buffer.fill((0, header_1.encodeHeader)({ messageId, timestamp }), 1, ACCEL_OFFSET);
    buffer.writeFloatBE(accelerometer.inclination / 360, ACCEL_OFFSET);
    buffer.writeFloatBE(accelerometer.pitch / 360, 13);
    buffer.writeFloatBE(accelerometer.roll / 360, 17);
    buffer.writeFloatBE(accelerometer.x, 21);
    buffer.writeFloatBE(accelerometer.y, 15);
    buffer.writeFloatBE(accelerometer.z, 29);
    buffer.fill(image, IMAGE_OFFSET);
    return buffer;
};
exports.encodeClientData = encodeClientData;
const decodeClientData = (message) => {
    const header = message.slice(1, 1 + header_1.HEADER_SIZE);
    const { messageId, timestamp } = (0, header_1.decodeHeader)(header);
    const accelerometerData = new Float32Array(6);
    for (let i = 0; i < 6; i++) {
        const offset = i * 4 + ACCEL_OFFSET;
        accelerometerData[i] = message.readFloatBE(offset);
    }
    const image = message.slice(IMAGE_OFFSET);
    return {
        type: MessageType.ClientData,
        header,
        messageId,
        timestamp,
        accelerometerData,
        image,
    };
};
const encodeManualCommand = ({ command }) => {
    const buffer = Buffer.alloc(1 + COMMAND_SIZE);
    buffer.writeUint8(MessageType.ManualCommand, 0);
    buffer.writeInt8(command[0], 1);
    buffer.writeInt8(command[1], 2);
    return buffer;
};
exports.encodeManualCommand = encodeManualCommand;
const decodeSpeed = (message, offset) => {
    let speed = message.readInt8(offset) * 2;
    if (speed < -255)
        speed = -255;
    return speed;
};
const decodeManualCommand = (message) => {
    const rawCommandData = message.slice(1);
    return {
        type: MessageType.ManualCommand,
        rawCommandData,
        leftSpeed: decodeSpeed(rawCommandData, 0),
        rightSpeed: decodeSpeed(rawCommandData, 1),
    };
};
const encodeFeedbackCommand = ({ header, command }) => {
    const buffer = Buffer.alloc(1 + header_1.HEADER_SIZE + COMMAND_SIZE);
    buffer.writeUint8(MessageType.FeedbackCommand, 0);
    buffer.fill(header, 1, FEEDBACK_COMMAND_OFFSET);
    buffer.writeInt8(command[0], FEEDBACK_COMMAND_OFFSET);
    buffer.writeInt8(command[1], FEEDBACK_COMMAND_OFFSET + 1);
    return buffer;
};
exports.encodeFeedbackCommand = encodeFeedbackCommand;
const decodeFeedbackCommand = (message) => {
    const header = message.slice(1, 1 + header_1.HEADER_SIZE);
    return {
        type: MessageType.FeedbackCommand,
        header,
        leftSpeed: decodeSpeed(message, 1),
        rightSpeed: decodeSpeed(message, 2),
    };
};
const encodeFeedbackTraining = ({ header }) => {
    const buffer = Buffer.alloc(1 + header_1.HEADER_SIZE + COMMAND_SIZE);
    buffer.writeUint8(MessageType.FeedbackTraining, 0);
    buffer.fill(header, 1);
    return buffer;
};
exports.encodeFeedbackTraining = encodeFeedbackTraining;
const decodeFeedbackTraining = (message) => {
    const header = message.slice(1, 1 + header_1.HEADER_SIZE);
    return { type: MessageType.FeedbackTraining, header };
};
const decodeMessage = (message) => {
    const type = message.readUInt8(0);
    switch (type) {
        case MessageType.ClientData:
            return decodeClientData(message);
        case MessageType.ManualCommand:
            return decodeManualCommand(message);
        case MessageType.FeedbackCommand:
            return decodeFeedbackCommand(message);
        case MessageType.FeedbackTraining:
            return decodeFeedbackTraining(message);
        default:
            throw `Unknown message type: ${type}`;
    }
};
exports.decodeMessage = decodeMessage;
