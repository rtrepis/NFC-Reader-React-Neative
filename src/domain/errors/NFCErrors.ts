export class NFCNotSupportedError extends Error {
  constructor() {
    super('NFC is not supported on this device');
    this.name = 'NFCNotSupportedError';
  }
}

export class NFCPermissionDeniedError extends Error {
  constructor() {
    super('NFC permission was denied by the user');
    this.name = 'NFCPermissionDeniedError';
  }
}

export class NFCReadError extends Error {
  constructor(cause?: string) {
    super(`Failed to read NFC tag${cause ? `: ${cause}` : ''}`);
    this.name = 'NFCReadError';
  }
}

export class DocumentParseError extends Error {
  constructor(cause?: string) {
    super(`Failed to parse document data${cause ? `: ${cause}` : ''}`);
    this.name = 'DocumentParseError';
  }
}
