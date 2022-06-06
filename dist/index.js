"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeMessage = exports.MessageType = void 0;
var MessageType;
(function (MessageType) {
    MessageType[MessageType["ClientData"] = 0] = "ClientData";
    MessageType[MessageType["ManualCommand"] = 1] = "ManualCommand";
    MessageType[MessageType["FeedbackCommand"] = 2] = "FeedbackCommand";
    MessageType[MessageType["FeedbackTraining"] = 3] = "FeedbackTraining";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
const ACCEL_OFFSET = 10;
const IMAGE_OFFSET = ACCEL_OFFSET + 6 * 4;
const encodeMessage = ({ accelerometer, messageId, timestamp, image }) => {
    const buffer = Buffer.allocUnsafe(IMAGE_OFFSET + image.length);
    buffer.writeUInt8(messageId[0], 0);
    buffer.writeBigUint64BE(timestamp[0], 1);
    buffer.writeFloatBE(accelerometer.inclination / 360, ACCEL_OFFSET);
    buffer.writeFloatBE(accelerometer.pitch / 360, 13);
    buffer.writeFloatBE(accelerometer.roll / 360, 17);
    buffer.writeFloatBE(accelerometer.x, 21);
    buffer.writeFloatBE(accelerometer.y, 15);
    buffer.writeFloatBE(accelerometer.z, 29);
    buffer.fill(image, IMAGE_OFFSET);
    return buffer;
};
exports.encodeMessage = encodeMessage;
const decodeClientData = (message) => {
    const header = message.slice(1, ACCEL_OFFSET);
    const accelerometerData = new Float32Array(6);
    for (let i = 0; i < 6; i++) {
        const offset = i * 4 + ACCEL_OFFSET;
        accelerometerData[i] = message.readFloatBE(offset);
    }
    const image = message.slice(IMAGE_OFFSET);
    return { type: MessageType.ClientData, header, accelerometerData, image };
};
const decodeManualCommand = (message) => {
    throw 'Not implemented';
};
const decodeFeedbackCommand = (message) => {
    throw 'Not implemented';
};
const decodeFeedbackTraining = (message) => {
    throw 'Not implemented';
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
