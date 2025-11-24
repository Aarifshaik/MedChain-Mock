'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { useUserStore } from '@/stores/userStore';
import { useConsentStore } from '@/stores/consentStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, FileText, Activity } from 'lucide-react';
import { UploadRecordDialog } from '@/components/Records/UploadRecordDialog';
import { RecordList } from '@/components/Records/RecordList';
import { EmergencyAccessDialog } from '@/components/Doctor/EmergencyAccessDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DoctorDashboard() {
    const { currentUser, users } = useUserStore();
    const router = useRouter();
    const { hasConsent } = useConsentStore();
    const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'DOCTOR') {
            router.push('/login');
        }
    }, [currentUser, router]);

    if (!currentUser) return null;

    const patients = users.filter((u) => u.role === 'PATIENT' && u.status === 'ACTIVE');
    const patientsWithConsent = patients.filter((p) => hasConsent(p.id, currentUser.id));

    return (
        <DashboardLayout role="DOCTOR">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Doctor Portal</h1>
                    <p className="text-muted-foreground">Manage patient care and medical records</p>
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
                            <CardTitle className="text-sm font-medium">Status</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-400">Active</div>
                            <p className="text-xs text-muted-foreground">Verified</p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="patients" className="space-y-4">
                    <TabsList className="glass border-white/10">
                        <TabsTrigger value="patients">My Patients</TabsTrigger>
                        <TabsTrigger value="records">Patient Records</TabsTrigger>
                    </TabsList>

                    <TabsContent value="patients" className="space-y-4">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Patient List</h2>
                            <p className="text-sm text-muted-foreground">View and manage your patients</p>
                        </div>

                        {patients.length === 0 ? (
                            <Card className="glass-card border-white/10">
                                <CardContent className="pt-6">
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>No patients registered yet</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {patients.map((patient) => {
                                    const accessGranted = hasConsent(patient.id, currentUser.id);

                                    return (
                                        <Card key={patient.id} className="glass-card border-white/10">
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <CardTitle className="text-base">{patient.name}</CardTitle>
                                                        <CardDescription className="text-xs">{patient.email}</CardDescription>
                                                    </div>
                                                    {accessGranted ? (
                                                        <Badge className="bg-green-500/10 text-green-400 hover:bg-green-500/20 text-xs">
                                                            Access Granted
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="text-xs">
                                                            No Access
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                {accessGranted ? (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="w-full border-primary/30 text-primary"
                                                        onClick={() => setSelectedPatient(patient.id)}
                                                    >
                                                        View Records
                                                    </Button>
                                                ) : (
                                                    <EmergencyAccessDialog
                                                        doctorId={currentUser.id}
                                                        doctorName={currentUser.name}
                                                        patientId={patient.id}
                                                        patientName={patient.name}
                                                    />
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="records" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold">Patient Records</h2>
                                <p className="text-sm text-muted-foreground">
                                    {selectedPatient
                                        ? `Viewing records for ${users.find(u => u.id === selectedPatient)?.name}`
                                        : 'Select a patient to view records'
                                    }
                                </p>
                            </div>
                            {selectedPatient && hasConsent(selectedPatient, currentUser.id) && (
                                <UploadRecordDialog patientId={selectedPatient} />
                            )}
                        </div>

                        {selectedPatient ? (
                            <RecordList patientId={selectedPatient} viewerId={currentUser.id} />
                        ) : (
                            <Card className="glass-card border-white/10">
                                <CardContent className="pt-6">
                                    <div className="text-center py-8 text-muted-foreground">
                                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>Select a patient from the &quot;My Patients&quot; tab to view their records</p>
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
