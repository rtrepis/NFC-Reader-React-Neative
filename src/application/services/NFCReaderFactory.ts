import type { INFCReader } from '../../domain/interfaces/INFCReader';
import { ReactNativeNFCReader } from '../../infrastructure/nfc/ReactNativeNFCReader';
import { MockNFCReader } from '../../infrastructure/nfc/MockNFCReader';

export class NFCReaderFactory {
  static create(): INFCReader {
    const rnReader = new ReactNativeNFCReader();

    if (rnReader.isSupported()) {
      return rnReader;
    }

    // Fallback per a iOS o emulador sense NFC
    return new MockNFCReader();
  }
}
