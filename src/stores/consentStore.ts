import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ConsentToken, RecordType, EmergencyAccessRequest } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { useDLTStore } from './dltStore';

interface ConsentState {
    consents: ConsentToken[];
    emergencyRequests: EmergencyAccessRequest[];

    grantConsent: (
        patientId: string,
        granteeId: string,
        granteeName: string,
        granteeRole: any,
        scope: RecordType[],
        expiryDays?: number
    ) => void;

    revokeConsent: (consentId: string, patientId: string) => void;

    getPatientConsents: (patientId: string) => ConsentToken[];
    getGranteeConsents: (granteeId: string) => ConsentToken[];
    hasConsent: (patientId: string, granteeId: string, recordType?: RecordType) => boolean;

    requestEmergencyAccess: (
        doctorId: string,
        doctorName: string,
        patientId: string,
        patientName: string,
        reason: string
    ) => void;

    approveEmergencyAccess: (requestId: string, adminId: string) => void;
    rejectEmergencyAccess: (requestId: string, adminId: string) => void;
    getPendingEmergencyRequests: () => EmergencyAccessRequest[];
}

export const useConsentStore = create<ConsentState>()(
    persist(
        (set, get) => ({
            consents: [],
            emergencyRequests: [],

            grantConsent: (patientId, granteeId, granteeName, granteeRole, scope, expiryDays = 30) => {
                const newConsent: ConsentToken = {
                    id: uuidv4(),
                    patientId,
                    granteeId,
                    granteeName,
                    granteeRole,
                    scope,
                    expiry: Date.now() + expiryDays * 24 * 60 * 60 * 1000,
                    status: 'ACTIVE',
                    createdAt: Date.now(),
                };

                set((state) => ({ consents: [...state.consents, newConsent] }));

                // Record on DLT
                useDLTStore.getState().addTransaction(
                    'GrantConsent',
                    [newConsent.id, patientId, granteeId, scope.join(',')],
                    patientId
                );
                setTimeout(() => useDLTStore.getState().mineBlock(), 1000);
            },

            revokeConsent: (consentId, patientId) => {
                set((state) => ({
                    consents: state.consents.map((c) =>
                        c.id === consentId ? { ...c, status: 'REVOKED' as const } : c
                    ),
                }));

                // Record on DLT
                useDLTStore.getState().addTransaction(
                    'RevokeConsent',
                    [consentId],
                    patientId
                );
                setTimeout(() => useDLTStore.getState().mineBlock(), 1000);
            },

            getPatientConsents: (patientId) => {
                return get().consents.filter((c) => c.patientId === patientId);
            },

            getGranteeConsents: (granteeId) => {
                return get().consents.filter((c) => c.granteeId === granteeId && c.status === 'ACTIVE');
            },

            hasConsent: (patientId, granteeId, recordType) => {
                const consents = get().consents.filter(
                    (c) => c.patientId === patientId && c.granteeId === granteeId && c.status === 'ACTIVE' && c.expiry > Date.now()
                );

                if (!recordType) return consents.length > 0;
                return consents.some((c) => c.scope.includes(recordType));
            },

            requestEmergencyAccess: (doctorId, doctorName, patientId, patientName, reason) => {
                const request: EmergencyAccessRequest = {
                    id: uuidv4(),
                    doctorId,
                    doctorName,
                    patientId,
                    patientName,
                    reason,
                    status: 'PENDING',
                    requestedAt: Date.now(),
                };

                set((state) => ({
                    emergencyRequests: [...state.emergencyRequests, request],
                }));

                useDLTStore.getState().addTransaction(
                    'RequestEmergencyAccess',
                    [request.id, doctorId, patientId, reason],
                    doctorId
                );
                setTimeout(() => useDLTStore.getState().mineBlock(), 1000);
            },

            approveEmergencyAccess: (requestId, adminId) => {
                const request = get().emergencyRequests.find((r) => r.id === requestId);
                if (!request) return;

                // Update request
                set((state) => ({
                    emergencyRequests: state.emergencyRequests.map((r) =>
                        r.id === requestId
                            ? { ...r, status: 'APPROVED' as const, reviewedAt: Date.now(), reviewedBy: adminId }
                            : r
                    ),
                }));

                // Grant emergency consent
                const emergencyConsent: ConsentToken = {
                    id: uuidv4(),
                    patientId: request.patientId,
                    granteeId: request.doctorId,
                    granteeName: request.doctorName,
                    granteeRole: 'DOCTOR',
                    scope: ['LAB_REPORT', 'PRESCRIPTION', 'IMAGING', 'CLINICAL_NOTE', 'VACCINATION'],
                    expiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
                    status: 'ACTIVE',
                    createdAt: Date.now(),
                    isEmergency: true,
                };

                set((state) => ({ consents: [...state.consents, emergencyConsent] }));

                useDLTStore.getState().addTransaction(
                    'ApproveEmergencyAccess',
                    [requestId, emergencyConsent.id],
                    adminId
                );
                setTimeout(() => useDLTStore.getState().mineBlock(), 1000);
            },

            rejectEmergencyAccess: (requestId, adminId) => {
                set((state) => ({
                    emergencyRequests: state.emergencyRequests.map((r) =>
                        r.id === requestId
                            ? { ...r, status: 'REJECTED' as const, reviewedAt: Date.now(), reviewedBy: adminId }
                            : r
                    ),
                }));

                useDLTStore.getState().addTransaction(
                    'RejectEmergencyAccess',
                    [requestId],
                    adminId
                );
                setTimeout(() => useDLTStore.getState().mineBlock(), 1000);
            },

            getPendingEmergencyRequests: () => {
                return get().emergencyRequests.filter((r) => r.status === 'PENDING');
            },
        }),
        {
            name: 'medchain-consent-storage',
        }
    )
);
