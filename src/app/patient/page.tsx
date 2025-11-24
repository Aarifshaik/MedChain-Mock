'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useUserStore } from '@/stores/userStore';
import { useRecordStore } from '@/stores/recordStore';
import { useConsentStore } from '@/stores/consentStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Shield, Activity } from 'lucide-react';
import { UploadRecordDialog } from '@/components/Records/UploadRecordDialog';
import { RecordList } from '@/components/Records/RecordList';
import { GrantConsentDialog } from '@/components/Consent/GrantConsentDialog';
import { ConsentList } from '@/components/Consent/ConsentList';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

export default function PatientDashboard() {
    const { currentUser } = useUserStore();
    const router = useRouter();
    const allRecords = useRecordStore((state) => state.records);
    const allConsents = useConsentStore((state) => state.consents);

    const records = useMemo(() => {
        if (!currentUser) return [];
        return allRecords.filter((r) => r.patientId === currentUser.id);
    }, [allRecords, currentUser]);

    const consents = useMemo(() => {
        if (!currentUser) return [];
        return allConsents.filter((c) => c.patientId === currentUser.id);
    }, [allConsents, currentUser]);

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'PATIENT') {
            router.push('/login');
        }
    }, [currentUser, router]);

    if (!currentUser) return null;

    const activeConsents = consents.filter((c) => c.status === 'ACTIVE' && c.expiry > Date.now());

    return (
        <DashboardLayout role="PATIENT">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Patient Portal</h1>
                    <p className="text-muted-foreground">Manage your health records and access permissions</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="glass-card border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">My Records</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{records.length}</div>
                            <p className="text-xs text-muted-foreground">Encrypted and secure</p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Consents</CardTitle>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-accent">{activeConsents.length}</div>
                            <p className="text-xs text-muted-foreground">Providers with access</p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-400">Active</div>
                            <p className="text-xs text-muted-foreground">Blockchain verified</p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="records" className="space-y-4">
                    <TabsList className="glass border-white/10">
                        <TabsTrigger value="records">Medical Records</TabsTrigger>
                        <TabsTrigger value="consent">Consent Management</TabsTrigger>
                    </TabsList>

                    <TabsContent value="records" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold">Medical Records</h2>
                                <p className="text-sm text-muted-foreground">Upload and manage your health data</p>
                            </div>
                            <UploadRecordDialog patientId={currentUser.id} />
                        </div>
                        <RecordList patientId={currentUser.id} viewerId={currentUser.id} />
                    </TabsContent>

                    <TabsContent value="consent" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold">Consent Management</h2>
                                <p className="text-sm text-muted-foreground">Control who can access your records</p>
                            </div>
                            <GrantConsentDialog patientId={currentUser.id} />
                        </div>
                        <ConsentList patientId={currentUser.id} />
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
