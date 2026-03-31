export type DocumentType = 'DNI' | 'NIE' | 'PASSPORT' | 'UNKNOWN';
export type Gender = 'M' | 'F' | 'UNKNOWN';

export interface TinDocument {
  readonly documentNumber: string;
  readonly documentType: DocumentType;
  readonly firstName: string;
  readonly lastName1: string;
  readonly lastName2: string;
  readonly dateOfBirth: Date | null;
  readonly expiryDate: Date | null;
  readonly gender: Gender;
  readonly nationality: string;
  readonly rawData: Record<string, string>;
}

export function createEmptyDocument(): TinDocument {
  return {
    documentNumber: '',
    documentType: 'UNKNOWN',
    firstName: '',
    lastName1: '',
    lastName2: '',
    dateOfBirth: null,
    expiryDate: null,
    gender: 'UNKNOWN',
    nationality: '',
    rawData: {},
  };
}
