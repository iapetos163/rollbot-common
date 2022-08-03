/// <reference types="node" />
export declare const HEADER_SIZE = 9;
export interface EncodeHeaderData {
    /** length 1 */
    messageId: Uint8Array;
    /** length 1 */
    timestamp: BigUint64Array;
}
export interface DecodeHeaderData {
    /** 0-255 */
    messageId: number;
    timestamp: bigint;
}
export declare const encodeHeader: ({ messageId, timestamp }: EncodeHeaderData) => Buffer;
export declare const decodeHeader: (buffer: Buffer) => DecodeHeaderData;
