import { Platform } from 'react-native';
import NfcManager, { NfcTech, type NdefRecord } from 'react-native-nfc-manager';
import type { INFCReader, NFCReadResult, NFCRecord } from '../../domain/interfaces/INFCReader';
import {
  NFCPermissionDeniedError,
  NFCReadError,
} from '../../domain/errors/NFCErrors';

export class ReactNativeNFCReader implements INFCReader {
  isSupported(): boolean {
    return Platform.OS === 'android';
  }

  async startReading(): Promise<NFCReadResult> {
    try {
      await NfcManager.start();
    } catch {
      // Already initialised — safe to ignore
    }

    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);

      const tag = await NfcManager.getTag();
      if (!tag) {
        throw new NFCReadError('No tag data found');
      }

      const records = this.mapRecords(tag.ndefMessage ?? []);
      const serialNumber = tag.id ?? '';

      return { records, serialNumber };
    } catch (error) {
      if (
        error instanceof NFCPermissionDeniedError ||
        error instanceof NFCReadError
      ) {
        throw error;
      }

      const err = error as Error;
      const msg = err.message ?? '';

      if (
        msg === 'UserCancel' ||
        msg.toLowerCase().includes('cancel')
      ) {
        const abortError = new Error('NFC scan cancelled');
        abortError.name = 'AbortError';
        throw abortError;
      }

      if (msg.toLowerCase().includes('permission')) {
        throw new NFCPermissionDeniedError();
      }

      throw new NFCReadError(msg);
    } finally {
      await NfcManager.cancelTechnologyRequest().catch(() => {});
    }
  }

  stopReading(): void {
    NfcManager.cancelTechnologyRequest().catch(() => {});
  }

  private mapRecords(ndefRecords: NdefRecord[]): NFCRecord[] {
    return ndefRecords.map((record) => {
      const recordType = this.mapTnfToRecordType(record.tnf);
      const data = new Uint8Array(record.payload as number[]);
      const mediaType =
        record.tnf === 0x02 ? this.decodeType(record.type) : undefined;

      return { recordType, data, mediaType };
    });
  }

  private mapTnfToRecordType(tnf: number): string {
    switch (tnf) {
      case 0x01: return 'well-known';
      case 0x02: return 'mime';
      case 0x03: return 'url';
      default:   return 'unknown';
    }
  }

  private decodeType(type: number[] | string): string {
    if (typeof type === 'string') return type;
    return String.fromCharCode(...type);
  }
}
