import { createReadStream, createWriteStream, ReadStream, WriteStream } from 'fs';
import { decodeHeader, HEADER_SIZE } from './header';

export const LOG_BUFFER_SIZE = HEADER_SIZE + 8;

export interface MessageLogData {
  messageId: number;
  sentTimestamp: bigint;
  receivedTimestamp: bigint;
}

const readLogData = (buffer: Buffer, offset: number): MessageLogData => {
  const { messageId, timestamp: sentTimestamp } = decodeHeader(buffer.slice(offset, offset + HEADER_SIZE));
  const receivedTimestamp = buffer.readBigUInt64BE(offset + HEADER_SIZE);
  return { messageId, sentTimestamp, receivedTimestamp };
};

export class MessageLogWriter {
  private out: WriteStream;

  constructor(logFilePath: string) {
    this.out = createWriteStream(logFilePath);
  }

  public close() {
    return new Promise<void>((resolve, reject) => {
      this.out.close(err => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  /**
   * @param buffer 17 bytes
   * @param header 9 bytes
   */
  public recordToLog(buffer: Buffer, header: Buffer, timestamp: bigint) {
    return new Promise<void>((resolve, reject) => {
      buffer.fill(header, 0);
      buffer.writeBigUInt64BE(timestamp, HEADER_SIZE);
      this.out.write(buffer, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }
}

export class MessageLogReader {
  private in: ReadStream;

  constructor(logFilePath: string) {
    this.in = createReadStream(logFilePath);
  }

  public close() {
    return new Promise<void>((resolve, reject) => {
      this.in.close(err => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  public *read() {
    const partial = Buffer.alloc(LOG_BUFFER_SIZE);
    let partialFilled = 0;

    let chunk = this.in.read() as Buffer | null;
    while (chunk) {
      let offset = 0;
      if (partialFilled > 0) {
        offset = LOG_BUFFER_SIZE - partialFilled;
        partial.fill(chunk.slice(0, LOG_BUFFER_SIZE - partialFilled), partialFilled);
        yield readLogData(partial, 0);
      }

      while (offset + LOG_BUFFER_SIZE <= chunk.length) {
        yield readLogData(chunk, offset);
        offset += LOG_BUFFER_SIZE;
      }

      partialFilled = chunk.length - offset;
      if (partialFilled > 0) {
        partial.fill(chunk.slice(offset), 0, partialFilled);
      }

      chunk = this.in.read() as Buffer | null;
    }

    if (partialFilled > 0) {
      throw new Error(`Input file size was not a multiple of ${LOG_BUFFER_SIZE} bytes`);
    }
  }
}
