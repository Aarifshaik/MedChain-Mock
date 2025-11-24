'use client';

import { useRecordStore } from '@/stores/recordStore';
import { useConsentStore } from '@/stores/consentStore';
import { useUserStore } from '@/stores/userStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Lock } from 'lucide-react';
import { RecordType } from '@/types';
import { useMemo } from 'react';
import { toast } from 'sonner';

interface RecordListProps {
    patientId: string;
    viewerId: string;
}

export function RecordList({ patientId, viewerId }: RecordListProps) {
    const allRecords = useRecordStore((state) => state.records);
    const { hasConsent } = useConsentStore();
    const currentUser = useUserStore((state) => state.currentUser);

    const records = useMemo(() => {
        return allRecords.filter((r) => r.patientId === patientId);
    }, [allRecords, patientId]);

    const canView = (recordType: RecordType) => {
        if (viewerId === patientId) return true;
        return hasConsent(patientId, viewerId, recordType);
    };

    const getRecordIcon = (type: RecordType) => {
        const icons = {
            LAB_REPORT: '🧪',
            PRESCRIPTION: '💊',
            IMAGING: '📷',
            CLINICAL_NOTE: '📝',
            VACCINATION: '💉',
        };
        return icons[type] || '📄';
    };

    const handleDownload = (record: any) => {
        if (!record.fileData) {
            toast.error('No file attached to this record');
            return;
        }

        try {
            const link = document.createElement('a');
            link.href = record.fileData;
            link.download = record.fileName || `${record.title}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('File downloaded successfully');
        } catch (error) {
            toast.error('Failed to download file');
        }
    };

    if (records.length === 0) {
        return (
            <Card className="glass-card border-white/10">
                <CardContent className="pt-6">
                    <div className="text-center py-8 text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No medical records found</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {records.map((record) => {
                const hasAccess = canView(record.type);

                return (
                    <Card key={record.id} className="glass-card border-white/10">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{getRecordIcon(record.type)}</span>
                                    <div>
                                        <CardTitle className="text-lg">{record.title}</CardTitle>
                                        <CardDescription className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                                                {record.type.replace('_', ' ')}
                                            </Badge>
                                            <span className="text-xs">{new Date(record.date).toLocaleDateString()}</span>
                                        </CardDescription>
                                    </div>
                                </div>
                                {!hasAccess && (
                                    <Lock className="w-5 h-5 text-destructive" />
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {hasAccess ? (
                                <>
                                    <p className="text-sm text-muted-foreground mb-3">{record.description}</p>
                                    {record.fileName && (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                                            <FileText className="w-4 h-4" />
                                            <span>{record.fileName}</span>
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-primary/30 text-primary"
                                            onClick={() => handleDownload(record)}
                                            disabled={!record.fileData}
                                        >
                                            <Download className="w-3 h-3 mr-2" />
                                            Download
                                        </Button>
                                        <Badge variant="secondary" className="bg-green-500/10 text-green-400 hover:bg-green-500/20 text-xs">
                                            🔐 Encrypted
                                        </Badge>
                                    </div>
                                </>
                            ) : (
                                <div className="py-4 px-4 rounded-lg bg-destructive/10 border border-destructive/20">
                                    <p className="text-sm text-destructive flex items-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        Access Denied - Consent Required
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
