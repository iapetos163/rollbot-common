import { createReadStream, createWriteStream, ReadStream, WriteStream } from 'fs';
import { decodeHeader, HEADER_SIZE } from './header';

export const LOG_BUFFER_SIZE = 9 + HEADER_SIZE;

export enum LogType {
  Feedback,
  ManualCommand,
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

export type MessageLogData = FeedbackLogData | CommandLogData;

const readLogData = (buffer: Buffer, offset: number): MessageLogData => {
  const type = buffer.readUInt8(offset);
  const receivedTimestamp = buffer.readBigUInt64BE(offset + 1);

  switch (type) {
    case LogType.Feedback: {
      const { messageId, timestamp: sentTimestamp } = decodeHeader(buffer.slice(offset + 9, offset + 9 + HEADER_SIZE));
      return { type, messageId, sentTimestamp, receivedTimestamp };
    }
    case LogType.ManualCommand:
      return {
        type,
        receivedTimestamp,
        rawCommandData: buffer.slice(offset + 9, offset + 11),
      };

    default:
      throw `Unknown message type: ${type}`;
  }

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
   * @param buffer size: `LOG_BUFFER_SIZE`
   * @param header 9 bytes
   */
  public writeFeedback(buffer: Buffer, header: Buffer, timestamp: bigint) {
    return new Promise<void>((resolve, reject) => {
      buffer.writeUint8(LogType.Feedback, 0);
      buffer.writeBigUInt64BE(timestamp, 1);
      buffer.fill(header, 9);
      this.out.write(buffer, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  /**
   * @param buffer size: `LOG_BUFFER_SIZE`
   * @param rawCommandData 2 bytes
   */
  public writeCommand(buffer: Buffer, rawCommandData: Buffer, timestamp: bigint) {
    return new Promise<void>((resolve, reject) => {
      buffer.writeUint8(LogType.ManualCommand, 0);
      buffer.writeBigUInt64BE(timestamp, 1);
      buffer.fill(rawCommandData, 9);
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
