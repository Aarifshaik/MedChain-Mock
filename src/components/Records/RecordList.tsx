'use client';

import { useRecordStore } from '@/stores/recordStore';
import { useConsentStore } from '@/stores/consentStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Download, Lock } from 'lucide-react';
import { RecordType } from '@/types';
import { useMemo, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface RecordListProps {
    patientId: string;
    viewerId: string;
}

export function RecordList({ patientId, viewerId }: RecordListProps) {
    const allRecords = useRecordStore((state) => state.records);
    const { hasConsent } = useConsentStore();
    const [isLoading, setIsLoading] = useState(true);

    const records = useMemo(() => {
        return allRecords.filter((r) => r.patientId === patientId);
    }, [allRecords, patientId]);

    useEffect(() => {
        // Simulate async data loading
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [patientId]);

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

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="glass-card border-white/10">
                        <CardHeader>
                            <div className="flex items-start gap-3">
                                <Skeleton className="w-12 h-12 rounded-md" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-5 w-48" />
                                    <div className="flex gap-2">
                                        <Skeleton className="h-5 w-24" />
                                        <Skeleton className="h-5 w-32" />
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-3/4 mb-3" />
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-28" />
                                <Skeleton className="h-8 w-24" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

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
                    <Card 
                        key={record.id} 
                        className="glass-card border-white/10 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-primary/10"
                    >
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{getRecordIcon(record.type)}</span>
                                    <div>
                                        <CardTitle className="text-lg text-foreground">{record.title}</CardTitle>
                                        <CardDescription className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className="text-xs border-primary/40 text-primary bg-primary/10">
                                                {record.type.replace('_', ' ')}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">{new Date(record.date).toLocaleDateString()}</span>
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
                                    <p className="text-sm text-card-foreground mb-3">{record.description}</p>
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
                                            className="border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/60 transition-all duration-200"
                                            onClick={() => handleDownload(record)}
                                            disabled={!record.fileData}
                                        >
                                            <Download className="w-3 h-3 mr-2" />
                                            Download
                                        </Button>
                                        <Badge variant="secondary" className="bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs border border-green-500/30">
                                            🔐 Encrypted
                                        </Badge>
                                    </div>
                                </>
                            ) : (
                                <div className="py-4 px-4 rounded-lg bg-destructive/10 border border-destructive/30">
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
