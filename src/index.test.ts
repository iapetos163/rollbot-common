import { randomBytes } from 'crypto';
import type { Accelerometer } from 'johnny-five';
import { DecodedClientData, DecodedFeedbackCommand, DecodedFeedbackTraining, decodeMessage, encodeClientData, encodeFeedbackCommand, encodeFeedbackTraining, MessageType } from '.';

class MockAccelerometer {
  private static randomDegree() {
    return Math.round(Math.random() * 360);
  }

  private static randomG() {
    return Math.random() * 10 - 5;
  }

  public get inclination() {
    return MockAccelerometer.randomDegree();
  }

  public get pitch() {
    return MockAccelerometer.randomDegree();
  }

  public get roll() {
    return MockAccelerometer.randomDegree();
  }

  public get x() {
    return MockAccelerometer.randomG();
  }

  public get y() {
    return MockAccelerometer.randomG();
  }

  public get z() {
    return MockAccelerometer.randomG();
  }
}

describe('ClientData', () => {
  it('accurately decodes data', () => {
    const accelerometer = (new MockAccelerometer()) as Accelerometer;
    const image = randomBytes(1000);
    const messageId = Uint8Array.from([Math.floor(Math.random() * 256)]);
    const timestamp = BigUint64Array.from([process.hrtime.bigint()]);

    const message = encodeClientData({
      accelerometer,
      messageId,
      timestamp,
      image,
    });

    const decoded = decodeMessage(message);

    expect(decoded.type).toBe(MessageType.ClientData);

    const { header, image: decodedImage } = decoded as DecodedClientData;
    expect(header.readUint8(0)).toBe(messageId[0]);
    expect(header.readBigUInt64BE(1)).toBe(timestamp[0]);
    expect(decodedImage.equals(image)).toBe(true);
  });
});

describe('FeedbackCommand', () => {
  it('accurately decodes data', () => {
    const header = randomBytes(9);
    const command = new Int8Array(2);

    const message = encodeFeedbackCommand({
      header,
      command,
    });

    const decoded = decodeMessage(message);

    expect(decoded.type).toBe(MessageType.FeedbackCommand);

    const { header: decodedHeader } = decoded as DecodedFeedbackCommand;
    expect(decodedHeader.equals(header)).toBe(true);
  });
});

describe('FeedbackTraining', () => {
  it('accurately decodes data', () => {
    const header = randomBytes(9);

    const message = encodeFeedbackTraining({
      header,
    });

    const decoded = decodeMessage(message);

    expect(decoded.type).toBe(MessageType.FeedbackTraining);

    const { header: decodedHeader } = decoded as DecodedFeedbackTraining;
    expect(decodedHeader.equals(header)).toBe(true);
  });
});
