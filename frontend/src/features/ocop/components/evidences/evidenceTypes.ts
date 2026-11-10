export interface EvidenceRecord {
  stt: number;
  id: string;
  name: string;
  category: string;
  dossierCode: string;
  size: string;
  format: 'PDF' | 'JPG' | 'PNG' | 'DOCX';
  checksum: string;
  status: 'VALID' | 'PENDING' | 'EXPIRING' | 'REJECTED';
  statusLabel: string;
  uploadDate: string;
  uploader: string;
  sourceType?: string;
  rawModel?: any;
  downloadUrl?: string;
  fileName?: string;
}

