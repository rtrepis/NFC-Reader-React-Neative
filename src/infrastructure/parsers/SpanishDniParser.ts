import type { IDocumentParser } from '../../domain/interfaces/IDocumentParser';
import type { NFCReadResult } from '../../domain/interfaces/INFCReader';
import type { TinDocument, DocumentType, Gender } from '../../domain/entities/TinDocument';
import { DocumentParseError } from '../../domain/errors/NFCErrors';

const TLV_TAGS = {
  DOCUMENT_NUMBER: '5A',
  NATIONALITY: '5F03',
  DATE_OF_BIRTH: '5F04',
  EXPIRY_DATE: '5F06',
  GENDER: '5F35',
  SURNAME_1: '61',
  SURNAME_2: '62',
  GIVEN_NAME: '63',
} as const;

export class SpanishDniParser implements IDocumentParser {
  canParse(data: NFCReadResult): boolean {
    return data.records.some(
      (r) => r.recordType === 'mime' && r.data.length > 0
    );
  }

  parse(data: NFCReadResult): TinDocument {
    try {
      const record = data.records.find((r) => r.recordType === 'mime');
      if (!record) throw new DocumentParseError('No MIME record found');

      const tlvData = this.parseTLV(record.data);
      return this.buildDocument(tlvData);
    } catch (error) {
      if (error instanceof DocumentParseError) throw error;
      throw new DocumentParseError((error as Error).message);
    }
  }

  private parseTLV(data: Uint8Array): Record<string, string> {
    const result: Record<string, string> = {};
    let i = 0;

    // Skip outer Application tag if present
    if (data[0] === 0x6F) i = 1;

    while (i < data.length) {
      const tag = data[i].toString(16).toUpperCase().padStart(2, '0');
      i++;

      // Multi-byte tag
      let fullTag = tag;
      if ((data[i - 1] & 0x1F) === 0x1F) {
        fullTag += data[i].toString(16).toUpperCase().padStart(2, '0');
        i++;
      }

      if (i >= data.length) break;

      const length = data[i++];
      if (i + length > data.length) break;

      const valueBytes = data.slice(i, i + length);
      result[fullTag] = new TextDecoder('ascii').decode(valueBytes).trim();
      i += length;
    }

    return result;
  }

  private buildDocument(tlv: Record<string, string>): TinDocument {
    const documentNumber = tlv[TLV_TAGS.DOCUMENT_NUMBER] ?? '';
    return {
      documentNumber,
      documentType: this.inferDocumentType(documentNumber),
      firstName: tlv[TLV_TAGS.GIVEN_NAME] ?? '',
      lastName1: tlv[TLV_TAGS.SURNAME_1] ?? '',
      lastName2: tlv[TLV_TAGS.SURNAME_2] ?? '',
      dateOfBirth: this.parseDate(tlv[TLV_TAGS.DATE_OF_BIRTH]),
      expiryDate: this.parseDate(tlv[TLV_TAGS.EXPIRY_DATE]),
      gender: this.parseGender(tlv[TLV_TAGS.GENDER]),
      nationality: tlv[TLV_TAGS.NATIONALITY] ?? 'ESP',
      rawData: tlv,
    };
  }

  private inferDocumentType(docNumber: string): DocumentType {
    if (/^\d{8}[A-Z]$/.test(docNumber)) return 'DNI';
    if (/^[XYZ]\d{7}[A-Z]$/.test(docNumber)) return 'NIE';
    if (/^[A-Z]{3}\d{6}$/.test(docNumber)) return 'PASSPORT';
    return 'UNKNOWN';
  }

  private parseDate(yymmdd?: string): Date | null {
    if (!yymmdd || yymmdd.length !== 6) return null;
    const yy = parseInt(yymmdd.slice(0, 2), 10);
    const mm = parseInt(yymmdd.slice(2, 4), 10) - 1;
    const dd = parseInt(yymmdd.slice(4, 6), 10);
    const year = yy >= 0 && yy <= 30 ? 2000 + yy : 1900 + yy;
    const date = new Date(year, mm, dd);
    return isNaN(date.getTime()) ? null : date;
  }

  private parseGender(raw?: string): Gender {
    if (raw === 'M') return 'M';
    if (raw === 'F') return 'F';
    return 'UNKNOWN';
  }
}
