'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useUserStore } from '@/stores/userStore';
import { useConsentStore } from '@/stores/consentStore';
import { useRecordStore } from '@/stores/recordStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Pill, Activity, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function PharmacistDashboard() {
    const { currentUser, users } = useUserStore();
    const router = useRouter();
    const { hasConsent } = useConsentStore();
    const allRecords = useRecordStore((state) => state.records);

    const patients = useMemo(() => {
        return users.filter((u) => u.role === 'PATIENT' && u.status === 'ACTIVE');
    }, [users]);

    const patientsWithConsent = useMemo(() => {
        return patients.filter((p) => hasConsent(p.id, currentUser?.id || ''));
    }, [patients, hasConsent, currentUser]);

    const prescriptions = useMemo(() => {
        return allRecords.filter((r) =>
            r.type === 'PRESCRIPTION' &&
            currentUser &&
            hasConsent(r.patientId, currentUser.id, 'PRESCRIPTION')
        );
    }, [allRecords, hasConsent, currentUser]);

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'PHARMACIST') {
            router.push('/login');
        }
    }, [currentUser, router]);

    if (!currentUser) return null;

    const handleMarkFulfilled = (prescriptionId: string) => {
        toast.success('Prescription marked as fulfilled');
    };

    return (
        <DashboardLayout role="PHARMACIST">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pharmacist Portal</h1>
                    <p className="text-muted-foreground">View and fulfill prescriptions</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="glass-card border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{patients.length}</div>
                            <p className="text-xs text-muted-foreground">Registered patients</p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Consents</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-accent">{patientsWithConsent.length}</div>
                            <p className="text-xs text-muted-foreground">With access</p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Prescriptions</CardTitle>
                            <Pill className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-400">{prescriptions.length}</div>
                            <p className="text-xs text-muted-foreground">Accessible</p>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-2">Prescriptions</h2>
                    <p className="text-sm text-muted-foreground mb-4">Review and fulfill patient prescriptions</p>

                    {prescriptions.length === 0 ? (
                        <Card className="glass-card border-white/10">
                            <CardContent className="pt-6">
                                <div className="text-center py-8 text-muted-foreground">
                                    <Pill className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No prescriptions available</p>
                                    <p className="text-xs mt-2">Patients need to grant you consent to view prescriptions</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {prescriptions.map((prescription) => {
                                const patient = users.find((u) => u.id === prescription.patientId);
                                return (
                                    <Card key={prescription.id} className="glass-card border-white/10">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-3xl">💊</span>
                                                    <div>
                                                        <CardTitle className="text-lg">{prescription.title}</CardTitle>
                                                        <CardDescription className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs">Patient: {patient?.name}</span>
                                                            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                                                                Prescription
                                                            </Badge>
                                                            <span className="text-xs">{new Date(prescription.date).toLocaleDateString()}</span>
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground mb-3">{prescription.description}</p>
                                            <Button
                                                size="sm"
                                                className="bg-green-500 hover:bg-green-600"
                                                onClick={() => handleMarkFulfilled(prescription.id)}
                                            >
                                                <CheckCircle2 className="w-3 h-3 mr-2" />
                                                Mark as Fulfilled
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
