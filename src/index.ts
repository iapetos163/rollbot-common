import type { Accelerometer } from 'johnny-five';

export enum MessageType {
  ClientData,
  ManualCommand,
  FeedbackCommand,
  FeedbackTraining,
}

interface DiscriminatedDecodedMessage {
  type: MessageType;
}

export interface EncodeClientData {
  messageId: Uint8Array;
  timestamp: BigUint64Array;
  accelerometer: Accelerometer;
  image: Buffer;
}

export interface DecodedClientData extends DiscriminatedDecodedMessage {
  type: MessageType.ClientData;
  /** 9 bytes */
  header: Buffer;
  /** length 6 */
  accelerometerData: Float32Array;
  /** JPEG */
  image: Buffer;
}

export interface EncodeManualCommand {
  // TODO
}

export interface DecodedManualCommand extends DiscriminatedDecodedMessage {
  type: MessageType.ManualCommand;
  // TODO
}

export interface EncodeFeedbackCommand {
  /** 9 bytes */
  header: Buffer;
  // TODO
}

export interface DecodedFeedbackCommand extends DiscriminatedDecodedMessage {
  type: MessageType.FeedbackCommand;
  // TODO
}

export interface EncodeFeedbackTraining {
  /** 9 bytes */
  header: Buffer;
}

export interface DecodedFeedbackTraining extends DiscriminatedDecodedMessage {
  type: MessageType.FeedbackTraining;
  // TODO
}

export type DecodedMessage = DecodedClientData | DecodedManualCommand | DecodedFeedbackCommand | DecodedFeedbackTraining;

const ACCEL_OFFSET = 10;
const IMAGE_OFFSET = ACCEL_OFFSET + 6 * 4;

export const encodeMessage = ({ accelerometer, messageId, timestamp, image }: EncodeClientData) => {
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


const decodeClientData = (message: Buffer): DecodedClientData => {
  const header = message.slice(1, ACCEL_OFFSET);

  const accelerometerData = new Float32Array(6);
  for (let i = 0; i < 6; i++) {
    const offset = i * 4 + ACCEL_OFFSET;
    accelerometerData[i] = message.readFloatBE(offset);
  }
  const image = message.slice(IMAGE_OFFSET);
  return { type: MessageType.ClientData, header, accelerometerData, image };
};

const decodeManualCommand = (message: Buffer): DecodedManualCommand => {
  throw 'Not implemented';
};

const decodeFeedbackCommand = (message: Buffer): DecodedFeedbackCommand => {
  throw 'Not implemented';
};

const decodeFeedbackTraining = (message: Buffer): DecodedFeedbackTraining => {
  throw 'Not implemented';
};

const decodeMessage = (message: Buffer): DecodedMessage => {
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
