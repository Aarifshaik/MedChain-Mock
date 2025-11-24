export type Role = 'ADMIN' | 'DOCTOR' | 'PATIENT' | 'LAB' | 'PHARMACIST' | 'INSURER' | 'RESEARCHER';

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    status: 'PENDING' | 'ACTIVE' | 'REJECTED';
    publicKey?: string;
}

export type RecordType = 'LAB_REPORT' | 'PRESCRIPTION' | 'IMAGING' | 'CLINICAL_NOTE' | 'VACCINATION';

export interface MedicalRecord {
    id: string;
    patientId: string;
    uploadedBy: string; // User ID (Doctor or Patient)
    type: RecordType;
    title: string;
    description: string;
    date: string;
    fileData?: string; // Base64 encoded file data
    fileName?: string;
    fileType?: string;
    encryption: {
        iv: string;
        keyMeta: { type: 'QUANTUM_MOCK'; wrappedKey: string };
    };
    timestamp: number;
}

export interface ConsentToken {
    id: string;
    patientId: string;
    granteeId: string; // Doctor/Researcher ID
    granteeName: string;
    granteeRole: Role;
    scope: RecordType[];
    expiry: number;
    status: 'ACTIVE' | 'REVOKED';
    createdAt: number;
    isEmergency?: boolean;
}

export interface EmergencyAccessRequest {
    id: string;
    doctorId: string;
    doctorName: string;
    patientId: string;
    patientName: string;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    requestedAt: number;
    reviewedAt?: number;
    reviewedBy?: string;
}

export interface Block {
    number: number;
    hash: string;
    previousHash: string;
    transactions: Transaction[];
    timestamp: number;
}

export interface Transaction {
    txId: string;
    functionName: string;
    args: string[];
    callerId: string;
    timestamp: number;
    status: 'VALID' | 'INVALID';
}
