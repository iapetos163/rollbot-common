/// <reference types="node" />
import type { Accelerometer } from 'johnny-five';
export declare enum MessageType {
    ClientData = 0,
    ManualCommand = 1,
    FeedbackCommand = 2,
    FeedbackTraining = 3
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
export declare type DecodedMessage = DecodedClientData | DecodedManualCommand | DecodedFeedbackCommand | DecodedFeedbackTraining;
export declare const encodeClientData: ({ accelerometer, messageId, timestamp, image }: EncodeClientData) => Buffer;
export declare const encodeManualCommand: ({ command }: EncodeManualCommand) => Buffer;
export declare const encodeFeedbackCommand: ({ header, command }: EncodeFeedbackCommand) => Buffer;
export declare const encodeFeedbackTraining: ({ header }: EncodeFeedbackTraining) => Buffer;
export declare const decodeMessage: (message: Buffer) => DecodedMessage;
export {};
