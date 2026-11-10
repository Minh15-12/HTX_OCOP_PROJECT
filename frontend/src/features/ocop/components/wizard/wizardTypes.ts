export interface UploadedEvidence {
  id: string;
  title: string;
  criterionCode: string;
  category: string;
  fileName: string;
  fileSize: string;
  sha256: string;
  status: 'Hợp lệ' | 'Chờ duyệt';
  previewUrl?: string;
  sourceType?: 'UPLOAD' | 'AUTO_EXTRACTED' | 'VAULT_PICK';
  extractedType?: 'FARM_PLOT' | 'MEMBER_LIST' | 'MEMBER_CHAIN' | 'PHI_JOURNAL';
  extractedData?: any;
  downloadUrl?: string;
  mimeType?: string;
  uploadedAt?: string;
}


export interface WizardFormData {
  dossierCode: string;
  evalYear: string;
  evalBatch: string;
  createdDate: string;
  status: string;
  evalLevel: string;
  creatorName: string;
  creatorRole: string;

  subjectName: string;
  subjectCode: string;
  subjectType: string;
  address: string;
  phone: string;
  email: string;

  repName: string;
  repRole: string;
  repPhone: string;
  repEmail: string;

  memberCount: string;
  laborCount: string;
  establishedDate: string;
  notes: string;

  // Step 2: Product info
  productName: string;
  productCode: string;
  category: string;
  rawLocation: string;
  area: string;
  yield: string;
}
