import type { TinDocument } from '../entities/TinDocument';
import type { NFCReadResult } from './INFCReader';

export interface IDocumentParser {
  canParse(data: NFCReadResult): boolean;
  parse(data: NFCReadResult): TinDocument;
}
