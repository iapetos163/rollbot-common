export const HEADER_SIZE = 9;

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

export const encodeHeader = ({ messageId, timestamp }: EncodeHeaderData) => {
  const buffer = Buffer.alloc(HEADER_SIZE);
  buffer.writeUInt8(messageId[0], 0);
  buffer.writeBigUint64BE(timestamp[0], 1);
  return buffer;
};

export const decodeHeader = (buffer: Buffer): DecodeHeaderData => {
  return {
    messageId: buffer.readUint8(0),
    timestamp: buffer.readBigUInt64BE(1),
  };
};
