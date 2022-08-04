/// <reference types="node" />
export declare const LOG_BUFFER_SIZE: number;
export declare enum LogType {
    Feedback = 0,
    ManualCommand = 1
}
interface DiscriminatedLogData {
    type: LogType;
}
export interface FeedbackLogData extends DiscriminatedLogData {
    type: LogType.Feedback;
    messageId: number;
    sentTimestamp: bigint;
    receivedTimestamp: bigint;
}
export interface CommandLogData extends DiscriminatedLogData {
    type: LogType.ManualCommand;
    /** 2 bytes */
    rawCommandData: Buffer;
    receivedTimestamp: bigint;
}
export declare type MessageLogData = FeedbackLogData | CommandLogData;
export declare class MessageLogWriter {
    private out;
    constructor(logFilePath: string);
    close(): Promise<void>;
    /**
     * @param buffer size: `LOG_BUFFER_SIZE`
     * @param header 9 bytes
     */
    writeFeedback(buffer: Buffer, header: Buffer, timestamp: bigint): Promise<void>;
    /**
     * @param buffer size: `LOG_BUFFER_SIZE`
     * @param rawCommandData 2 bytes
     */
    writeCommand(buffer: Buffer, rawCommandData: Buffer, timestamp: bigint): Promise<void>;
}
export declare class MessageLogReader {
    private in;
    constructor(logFilePath: string);
    close(): Promise<void>;
    read(): Generator<MessageLogData, void, unknown>;
}
export {};
