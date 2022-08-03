import type { Accelerometer } from 'johnny-five';
import { decodeHeader, encodeHeader, HEADER_SIZE } from './header';

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
  /** integer 0-255 */
  messageId: number;
  timestamp: bigint;
  /** length 6 */
  accelerometerData: Float32Array;
  /** JPEG */
  image: Buffer;
}

export interface EncodeManualCommand {
  /** length 2 */
  command: Int8Array;
}

export interface DecodedManualCommand extends DiscriminatedDecodedMessage {
  type: MessageType.ManualCommand;
  /** even number from -254 to 254, or -255 */
  leftSpeed: number;
  /** even number from -254 to 254, or -255 */
  rightSpeed: number;
}

export interface EncodeFeedbackCommand {
  /** 9 bytes */
  header: Buffer;
  /** length 2 */
  command: Int8Array;
}

export interface DecodedFeedbackCommand extends DiscriminatedDecodedMessage {
  type: MessageType.FeedbackCommand;
  /** 9 bytes */
  header: Buffer;
  /** even number from -254 to 254, or -255 */
  leftSpeed: number;
  /** even number from -254 to 254, or -255 */
  rightSpeed: number;
}

export interface EncodeFeedbackTraining {
  /** 9 bytes */
  header: Buffer;
}

export interface DecodedFeedbackTraining extends DiscriminatedDecodedMessage {
  type: MessageType.FeedbackTraining;
  /** 9 bytes */
  header: Buffer;
}

export type DecodedMessage = DecodedClientData | DecodedManualCommand | DecodedFeedbackCommand | DecodedFeedbackTraining;

const COMMAND_SIZE = 2;
const ACCEL_OFFSET = 1 + HEADER_SIZE;
const IMAGE_OFFSET = ACCEL_OFFSET + 6 * 4;
const FEEDBACK_COMMAND_OFFSET = 1 + HEADER_SIZE;

export const encodeClientData = ({ accelerometer, messageId, timestamp, image }: EncodeClientData) => {
  const buffer = Buffer.allocUnsafe(IMAGE_OFFSET + image.length);
  buffer.writeUint8(MessageType.ClientData, 0);
  buffer.fill(encodeHeader({ messageId, timestamp }), 1, ACCEL_OFFSET);

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
  const header = message.slice(1, 1 + HEADER_SIZE);
  const { messageId, timestamp } = decodeHeader(header);

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

export const encodeManualCommand = ({ command }: EncodeManualCommand) => {
  const buffer = Buffer.alloc(1 + COMMAND_SIZE);
  buffer.writeUint8(MessageType.ManualCommand, 0);
  buffer.writeInt8(command[0], 1);
  buffer.writeInt8(command[1], 2);
  return buffer;
};

const decodeSpeed = (message: Buffer, offset: number) => {
  let speed = message.readInt8(offset) * 2;
  if (speed < -255) speed = -255;
  return speed;
};

const decodeManualCommand = (message: Buffer): DecodedManualCommand => {
  return {
    type: MessageType.ManualCommand,
    leftSpeed: decodeSpeed(message, 1),
    rightSpeed: decodeSpeed(message, 2),
  };
};

export const encodeFeedbackCommand = ({ header, command }: EncodeFeedbackCommand) => {
  const buffer = Buffer.alloc(1 + HEADER_SIZE + COMMAND_SIZE);
  buffer.writeUint8(MessageType.FeedbackCommand, 0);
  buffer.fill(header, 1, FEEDBACK_COMMAND_OFFSET);
  buffer.writeInt8(command[0], FEEDBACK_COMMAND_OFFSET);
  buffer.writeInt8(command[1], FEEDBACK_COMMAND_OFFSET + 1);
  return buffer;
};

const decodeFeedbackCommand = (message: Buffer): DecodedFeedbackCommand => {
  const header = message.slice(1, 1 + HEADER_SIZE);
  return {
    type: MessageType.FeedbackCommand,
    header,
    leftSpeed: decodeSpeed(message, 1),
    rightSpeed: decodeSpeed(message, 2),
  };
};

export const encodeFeedbackTraining = ({ header }: EncodeFeedbackTraining) => {
  const buffer = Buffer.alloc(1 + HEADER_SIZE + COMMAND_SIZE);
  buffer.writeUint8(MessageType.FeedbackTraining, 0);
  buffer.fill(header, 1);
  return buffer;
};

const decodeFeedbackTraining = (message: Buffer): DecodedFeedbackTraining => {
  const header = message.slice(1, 1 + HEADER_SIZE);
  return { type: MessageType.FeedbackTraining, header };
};

export const decodeMessage = (message: Buffer): DecodedMessage => {
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
