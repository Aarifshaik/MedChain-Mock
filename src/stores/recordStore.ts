import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MedicalRecord, RecordType } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { mockQuantum } from '@/api/crypto/mockQuantum';
import { useDLTStore } from './dltStore';

interface RecordState {
    records: MedicalRecord[];

    uploadRecord: (
        patientId: string,
        uploadedBy: string,
        type: RecordType,
        title: string,
        description: string,
        fileData?: string,
        fileName?: string,
        fileType?: string
    ) => Promise<void>;

    getPatientRecords: (patientId: string) => MedicalRecord[];
    getRecordById: (id: string) => MedicalRecord | undefined;
}

export const useRecordStore = create<RecordState>()(
    persist(
        (set, get) => ({
            records: [],

            uploadRecord: async (
                patientId,
                uploadedBy,
                type,
                title,
                description,
                fileData,
                fileName,
                fileType
            ) => {
                // Simulate encryption
                const encrypted = await mockQuantum.encrypt(
                    fileData || 'mock-file-content',
                    'patient-public-key'
                );

                const newRecord: MedicalRecord = {
                    id: uuidv4(),
                    patientId,
                    uploadedBy,
                    type,
                    title,
                    description,
                    date: new Date().toISOString(),
                    fileData,
                    fileName,
                    fileType,
                    encryption: {
                        iv: encrypted.iv.join(','),
                        keyMeta: {
                            type: 'QUANTUM_MOCK' as const,
                            wrappedKey: encrypted.keyMeta.wrappedKey,
                        },
                    },
                    timestamp: Date.now(),
                };

                set((state) => ({ records: [...state.records, newRecord] }));

                // Record transaction on DLT
                useDLTStore.getState().addTransaction(
                    'UploadRecord',
                    [newRecord.id, patientId, type, title],
                    uploadedBy
                );

                // Auto-mine block
                setTimeout(() => {
                    useDLTStore.getState().mineBlock();
                }, 1000);
            },

            getPatientRecords: (patientId) => {
                return get().records.filter((r) => r.patientId === patientId);
            },

            getRecordById: (id) => {
                return get().records.find((r) => r.id === id);
            },
        }),
        {
            name: 'medchain-records-storage',
        }
    )
);
