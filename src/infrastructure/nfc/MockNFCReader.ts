import type { INFCReader, NFCReadResult } from '../../domain/interfaces/INFCReader';

const MOCK_DNI_DATA: Record<string, string> = {
  '5A': '12345678Z',  // Document number
  '5B': 'GARCIA LOPEZ MARIA',  // Full name (MRZ format)
  '5F03': 'ESP',  // Nationality
  '5F04': '850315',  // Date of birth YYMMDD
  '5F06': '300315',  // Expiry date YYMMDD
  '5F35': 'F',  // Gender
  '61': 'GARCIA',  // First surname
  '62': 'LOPEZ',  // Second surname
  '63': 'MARIA',  // Given name
};

function buildMockPayload(data: Record<string, string>): Uint8Array {
  const entries = Object.entries(data);
  const bytes: number[] = [0x6F]; // Application tag

  for (const [tag, value] of entries) {
    const tagBytes = tag.match(/.{1,2}/g)!.map((h) => parseInt(h, 16));
    const valueBytes = Array.from(new TextEncoder().encode(value));
    bytes.push(...tagBytes, valueBytes.length, ...valueBytes);
  }

  return new Uint8Array(bytes);
}

export class MockNFCReader implements INFCReader {
  private readonly delayMs: number;

  constructor(delayMs = 2000) {
    this.delayMs = delayMs;
  }

  isSupported(): boolean {
    return true;
  }

  async startReading(): Promise<NFCReadResult> {
    await new Promise((resolve) => setTimeout(resolve, this.delayMs));

    return {
      serialNumber: 'AB:CD:EF:12:34:56',
      records: [
        {
          recordType: 'mime',
          mediaType: 'application/octet-stream',
          data: buildMockPayload(MOCK_DNI_DATA),
        },
      ],
    };
  }

  stopReading(): void {
    // No-op for mock
  }
}
