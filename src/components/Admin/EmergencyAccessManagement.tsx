'use client';

import { useConsentStore } from '@/stores/consentStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserStore } from '@/stores/userStore';
import { Check, X, ShieldAlert, Clock } from 'lucide-react';
import { toast } from 'sonner';

export function EmergencyAccessManagement() {
    const { emergencyRequests, approveEmergencyAccess, rejectEmergencyAccess } = useConsentStore();
    const currentUser = useUserStore((state) => state.currentUser);

    const pendingRequests = emergencyRequests.filter((r) => r.status === 'PENDING');

    const handleApprove = (requestId: string, doctorName: string) => {
        if (!currentUser) return;
        approveEmergencyAccess(requestId, currentUser.id);
        toast.success(`Approved emergency access for Dr. ${doctorName}`);
    };

    const handleReject = (requestId: string, doctorName: string) => {
        if (!currentUser) return;
        rejectEmergencyAccess(requestId, currentUser.id);
        toast.error(`Rejected emergency access for Dr. ${doctorName}`);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-destructive" />
                <h2 className="text-2xl font-bold">Emergency Access Requests</h2>
            </div>

            {pendingRequests.length === 0 ? (
                <Card className="glass-card border-white/10">
                    <CardContent className="pt-6">
                        <div className="text-center py-8 text-muted-foreground">
                            <ShieldAlert className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No pending emergency access requests</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {pendingRequests.map((request) => (
                        <Card key={request.id} className="glass-card border-white/10 border-l-4 border-l-destructive">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            Dr. {request.doctorName}
                                            <Badge variant="destructive" className="text-xs">
                                                URGENT
                                            </Badge>
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            Requesting access to: <span className="text-foreground font-medium">{request.patientName}</span>
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Clock className="w-3 h-3" />
                                        {new Date(request.requestedAt).toLocaleString()}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground mb-1">Reason:</p>
                                        <p className="text-sm bg-secondary/30 p-3 rounded-lg">{request.reason}</p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/10"
                                            onClick={() => handleApprove(request.id, request.doctorName)}
                                        >
                                            <Check className="w-4 h-4 mr-2" />
                                            Approve
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
                                            onClick={() => handleReject(request.id, request.doctorName)}
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Recent Decisions</h3>
                <div className="space-y-2">
                    {emergencyRequests
                        .filter((r) => r.status !== 'PENDING')
                        .slice(0, 5)
                        .map((request) => (
                            <Card key={request.id} className="glass-card border-white/10">
                                <CardContent className="pt-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <div>
                                            <span className="font-medium">Dr. {request.doctorName}</span>
                                            <span className="text-muted-foreground"> → {request.patientName}</span>
                                        </div>
                                        <Badge
                                            className={
                                                request.status === 'APPROVED'
                                                    ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                                    : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                                            }
                                        >
                                            {request.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                </div>
            </div>
        </div>
    );
}
