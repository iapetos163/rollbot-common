/// <reference types="node" />
export type { EncodeHeaderData, DecodeHeaderData } from './header';
export { HEADER_SIZE } from './header';
export type { FeedbackLogData, CommandLogData, MessageLogData } from './log';
export { LOG_BUFFER_SIZE, LogType, MessageLogReader, MessageLogWriter } from './log';
export type { EncodeClientData, EncodeFeedbackCommand, EncodeFeedbackTraining, EncodeManualCommand, DecodedClientData, DecodedFeedbackCommand, DecodedFeedbackTraining, DecodedManualCommand, DecodedMessage } from './message';
export { MessageType } from './message';
export declare const message: {
    encodeClientData: ({ accelerometer, messageId, timestamp, image }: import("./message").EncodeClientData) => Buffer;
    encodeFeedbackCommand: ({ header, command }: import("./message").EncodeFeedbackCommand) => Buffer;
    encodeFeedbackTraining: ({ header }: import("./message").EncodeFeedbackTraining) => Buffer;
    encodeManualCommand: ({ command }: import("./message").EncodeManualCommand) => Buffer;
    decode: (message: Buffer) => import("./message").DecodedMessage;
};
