export interface NFCReadResult {
  readonly records: NFCRecord[];
  readonly serialNumber: string;
}

export interface NFCRecord {
  readonly recordType: string;
  readonly data: Uint8Array;
  readonly mediaType?: string;
}

export interface INFCReader {
  isSupported(): boolean;
  startReading(): Promise<NFCReadResult>;
  stopReading(): void;
}
