'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useUserStore } from '@/stores/userStore';
import { useConsentStore } from '@/stores/consentStore';
import { useRecordStore } from '@/stores/recordStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Search, Activity, Database } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';

export default function ResearcherDashboard() {
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
        if (!currentUser || currentUser.role !== 'RESEARCHER') {
            router.push('/login');
        }
    }, [currentUser, router]);

    if (!currentUser) return null;

    // Anonymize data for research
    const anonymizedData = accessibleRecords.map((record, index) => ({
        id: `ANON-${index + 1}`,
        type: record.type,
        date: record.date,
        description: record.description,
    }));

    const recordTypeStats = accessibleRecords.reduce((acc, record) => {
        acc[record.type] = (acc[record.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <DashboardLayout role="RESEARCHER">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Researcher Portal</h1>
                    <p className="text-muted-foreground">Access anonymized patient data for research</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="glass-card hover:scale-[1.02] transition-all duration-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Consented Patients</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-accent">{patientsWithConsent.length}</div>
                            <p className="text-xs text-muted-foreground">With research consent</p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card hover:scale-[1.02] transition-all duration-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Data Points</CardTitle>
                            <Database className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-400">{accessibleRecords.length}</div>
                            <p className="text-xs text-muted-foreground">Anonymized records</p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card hover:scale-[1.02] transition-all duration-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Status</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-400">Active</div>
                            <p className="text-xs text-muted-foreground">Research access</p>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-2">Data Overview</h2>
                    <p className="text-sm text-muted-foreground mb-4">Anonymized medical records for research purposes</p>

                    <div className="grid gap-4 md:grid-cols-2 mb-6">
                        {Object.entries(recordTypeStats).map(([type, count]) => (
                            <Card key={type} className="glass-card hover:scale-[1.02] transition-all duration-200">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center justify-between">
                                        {type.replace('_', ' ')}
                                        <Badge variant="secondary">{count}</Badge>
                                    </CardTitle>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-2">Anonymized Records</h2>
                    <p className="text-sm text-muted-foreground mb-4">Patient identities are protected</p>

                    {anonymizedData.length === 0 ? (
                        <Card className="glass-card">
                            <CardContent className="pt-6">
                                <div className="text-center py-8 text-muted-foreground">
                                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No data available</p>
                                    <p className="text-xs mt-2">Patients need to grant research consent</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {anonymizedData.map((data) => (
                                <Card key={data.id} className="glass-card hover:scale-[1.01] transition-all duration-200">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-base">Record ID: {data.id}</CardTitle>
                                                <CardDescription className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                                                        {data.type.replace('_', ' ')}
                                                    </Badge>
                                                    <span className="text-xs">{new Date(data.date).toLocaleDateString()}</span>
                                                </CardDescription>
                                            </div>
                                            <Badge className="bg-yellow-500/10 text-yellow-400 text-xs">
                                                ANONYMIZED
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">{data.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
