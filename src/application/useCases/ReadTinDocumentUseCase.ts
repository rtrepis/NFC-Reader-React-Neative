import type { TinDocument } from '../../domain/entities/TinDocument';
import type { INFCReader } from '../../domain/interfaces/INFCReader';
import type { IDocumentParser } from '../../domain/interfaces/IDocumentParser';
import { DocumentParseError } from '../../domain/errors/NFCErrors';

export class ReadTinDocumentUseCase {
  private readonly nfcReader: INFCReader;
  private readonly parsers: IDocumentParser[];

  constructor(nfcReader: INFCReader, parsers: IDocumentParser[]) {
    this.nfcReader = nfcReader;
    this.parsers = parsers;
  }

  async execute(): Promise<TinDocument> {
    const nfcData = await this.nfcReader.startReading();

    const parser = this.parsers.find((p) => p.canParse(nfcData));
    if (!parser) {
      throw new DocumentParseError('No compatible parser found for this document');
    }

    return parser.parse(nfcData);
  }

  cancel(): void {
    this.nfcReader.stopReading();
  }
}
