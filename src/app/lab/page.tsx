'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useUserStore } from '@/stores/userStore';
import { useConsentStore } from '@/stores/consentStore';
import { useRecordStore } from '@/stores/recordStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileText, Activity, FlaskConical } from 'lucide-react';
import { UploadRecordDialog } from '@/components/Records/UploadRecordDialog';
import { RecordList } from '@/components/Records/RecordList';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';

export default function LabDashboard() {
    const { currentUser, users } = useUserStore();
    const router = useRouter();
    const { hasConsent } = useConsentStore();
    const allRecords = useRecordStore((state) => state.records);
    const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

    const patients = useMemo(() => {
        return users.filter((u) => u.role === 'PATIENT' && u.status === 'ACTIVE');
    }, [users]);

    const patientsWithConsent = useMemo(() => {
        return patients.filter((p) => hasConsent(p.id, currentUser?.id || ''));
    }, [patients, hasConsent, currentUser]);

    const labRecords = useMemo(() => {
        return allRecords.filter((r) => r.type === 'LAB_REPORT' && currentUser && hasConsent(r.patientId, currentUser.id));
    }, [allRecords, hasConsent, currentUser]);

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'LAB') {
            router.push('/login');
        }
    }, [currentUser, router]);

    if (!currentUser) return null;

    return (
        <DashboardLayout role="LAB">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Laboratory Portal</h1>
                    <p className="text-muted-foreground">Upload test results and manage patient records</p>
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
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-accent">{patientsWithConsent.length}</div>
                            <p className="text-xs text-muted-foreground">With access</p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-white/10">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Lab Reports</CardTitle>
                            <FlaskConical className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-400">{labRecords.length}</div>
                            <p className="text-xs text-muted-foreground">Total uploaded</p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="patients" className="space-y-4">
                    <TabsList className="glass border-white/10">
                        <TabsTrigger value="patients">My Patients</TabsTrigger>
                        <TabsTrigger value="upload">Upload Results</TabsTrigger>
                    </TabsList>

                    <TabsContent value="patients" className="space-y-4">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Patient List</h2>
                            <p className="text-sm text-muted-foreground">Patients who granted you access</p>
                        </div>

                        {patientsWithConsent.length === 0 ? (
                            <Card className="glass-card border-white/10">
                                <CardContent className="pt-6">
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>No patients with active consent</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {patientsWithConsent.map((patient) => (
                                    <Card key={patient.id} className="glass-card border-white/10">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="text-base">{patient.name}</CardTitle>
                                                    <p className="text-xs text-muted-foreground">{patient.email}</p>
                                                </div>
                                                <Badge className="bg-green-500/10 text-green-400 hover:bg-green-500/20 text-xs">
                                                    Access Granted
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <UploadRecordDialog
                                                patientId={patient.id}
                                                trigger={
                                                    <button className="w-full text-sm py-2 px-3 rounded-md border border-primary/30 text-primary hover:bg-primary/10 transition-colors">
                                                        Upload Lab Results
                                                    </button>
                                                }
                                            />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="upload" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold">Upload Lab Results</h2>
                                <p className="text-sm text-muted-foreground">
                                    {selectedPatient
                                        ? `Uploading for ${users.find(u => u.id === selectedPatient)?.name}`
                                        : 'Select a patient to upload results'
                                    }
                                </p>
                            </div>
                            {selectedPatient && (
                                <UploadRecordDialog patientId={selectedPatient} />
                            )}
                        </div>

                        {selectedPatient ? (
                            <RecordList patientId={selectedPatient} viewerId={currentUser.id} />
                        ) : (
                            <Card className="glass-card border-white/10">
                                <CardContent className="pt-6">
                                    <div className="text-center py-8 text-muted-foreground">
                                        <FlaskConical className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>Select a patient from &quot;My Patients&quot; tab to upload results</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
