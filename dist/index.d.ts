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
}
export interface DecodedManualCommand extends DiscriminatedDecodedMessage {
    type: MessageType.ManualCommand;
}
export interface EncodeFeedbackCommand {
    /** 9 bytes */
    header: Buffer;
}
export interface DecodedFeedbackCommand extends DiscriminatedDecodedMessage {
    type: MessageType.FeedbackCommand;
}
export interface EncodeFeedbackTraining {
    /** 9 bytes */
    header: Buffer;
}
export interface DecodedFeedbackTraining extends DiscriminatedDecodedMessage {
    type: MessageType.FeedbackTraining;
}
export declare type DecodedMessage = DecodedClientData | DecodedManualCommand | DecodedFeedbackCommand | DecodedFeedbackTraining;
export declare const encodeMessage: ({ accelerometer, messageId, timestamp, image }: EncodeClientData) => Buffer;
export {};
