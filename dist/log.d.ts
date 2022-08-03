/// <reference types="node" />
export declare const LOG_BUFFER_SIZE: number;
export interface MessageLogData {
    messageId: number;
    sentTimestamp: bigint;
    receivedTimestamp: bigint;
}
export declare class MessageLogWriter {
    private out;
    constructor(logFilePath: string);
    close(): Promise<void>;
    /**
     * @param buffer 17 bytes
     * @param header 9 bytes
     */
    recordToLog(buffer: Buffer, header: Buffer, timestamp: bigint): Promise<void>;
}
export declare class MessageLogReader {
    private in;
    constructor(logFilePath: string);
    close(): Promise<void>;
    read(): Generator<MessageLogData, void, unknown>;
}
