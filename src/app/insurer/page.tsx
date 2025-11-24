'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useUserStore } from '@/stores/userStore';
import { useConsentStore } from '@/stores/consentStore';
import { useRecordStore } from '@/stores/recordStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, DollarSign, Activity, FileCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function InsurerDashboard() {
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

    const accessibleRecords = useMemo(() => {
        return allRecords.filter((r) =>
            currentUser && hasConsent(r.patientId, currentUser.id)
        );
    }, [allRecords, hasConsent, currentUser]);

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'INSURER') {
            router.push('/login');
        }
    }, [currentUser, router]);

    if (!currentUser) return null;

    const handleProcessClaim = (recordId: string) => {
        toast.success('Claim processed successfully');
    };

    return (
        <DashboardLayout role="INSURER">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Insurance Portal</h1>
                    <p className="text-muted-foreground">Review claims and patient records</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="glass-card border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Insured Patients</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{patients.length}</div>
                            <p className="text-xs text-muted-foreground">Total patients</p>
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
                            <CardTitle className="text-sm font-medium">Claims Data</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-400">{accessibleRecords.length}</div>
                            <p className="text-xs text-muted-foreground">Records available</p>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-2">Claims & Records</h2>
                    <p className="text-sm text-muted-foreground mb-4">Process insurance claims with patient consent</p>

                    {accessibleRecords.length === 0 ? (
                        <Card className="glass-card border-white/10">
                            <CardContent className="pt-6">
                                <div className="text-center py-8 text-muted-foreground">
                                    <FileCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No claims data available</p>
                                    <p className="text-xs mt-2">Patients need to grant you consent to view records</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {accessibleRecords.map((record) => {
                                const patient = users.find((u) => u.id === record.patientId);
                                return (
                                    <Card key={record.id} className="glass-card border-white/10">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-3xl">📄</span>
                                                    <div>
                                                        <CardTitle className="text-lg">{record.title}</CardTitle>
                                                        <CardDescription className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs">Patient: {patient?.name}</span>
                                                            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                                                                {record.type.replace('_', ' ')}
                                                            </Badge>
                                                            <span className="text-xs">{new Date(record.date).toLocaleDateString()}</span>
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <Badge className="bg-blue-500/10 text-blue-400 text-xs">
                                                    CLAIM
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground mb-3">{record.description}</p>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="bg-green-500 hover:bg-green-600"
                                                    onClick={() => handleProcessClaim(record.id)}
                                                >
                                                    <FileCheck className="w-3 h-3 mr-2" />
                                                    Approve Claim
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-destructive/30 text-destructive"
                                                >
                                                    Reject
                                                </Button>
                                            </div>
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
