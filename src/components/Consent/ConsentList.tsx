'use client';

import { useConsentStore } from '@/stores/consentStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, X, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useMemo, useState, useEffect } from 'react';

interface ConsentListProps {
    patientId: string;
}

export function ConsentList({ patientId }: ConsentListProps) {
    const allConsents = useConsentStore((state) => state.consents);
    const revokeConsent = useConsentStore((state) => state.revokeConsent);
    const [isLoading, setIsLoading] = useState(true);

    const patientConsents = useMemo(() => {
        return allConsents.filter((c) => c.patientId === patientId);
    }, [allConsents, patientId]);

    useEffect(() => {
        // Simulate async data loading
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [patientId]);

    const handleRevoke = (consentId: string, granteeName: string, isEmergency?: boolean) => {
        revokeConsent(consentId, patientId);
        if (isEmergency) {
            toast.success(`Emergency consent revoked for ${granteeName}`, {
                description: 'Access has been immediately terminated',
            });
        } else {
            toast.success(`Revoked consent for ${granteeName}`);
        }
    };

    const isExpired = (expiry: number) => expiry < Date.now();
    const daysUntilExpiry = (expiry: number) => Math.floor((expiry - Date.now()) / (1000 * 60 * 60 * 24));

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2].map((i) => (
                    <Card key={i} className="glass-card border-white/10">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-6 w-40" />
                                    <div className="flex gap-2">
                                        <Skeleton className="h-5 w-20" />
                                        <Skeleton className="h-5 w-16" />
                                    </div>
                                </div>
                                <Skeleton className="h-8 w-20" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div>
                                    <Skeleton className="h-3 w-20 mb-2" />
                                    <div className="flex flex-wrap gap-2">
                                        <Skeleton className="h-5 w-24" />
                                        <Skeleton className="h-5 w-28" />
                                        <Skeleton className="h-5 w-20" />
                                    </div>
                                </div>
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (patientConsents.length === 0) {
        return (
            <Card className="glass-card border-white/10">
                <CardContent className="pt-6">
                    <div className="text-center py-8 text-muted-foreground">
                        <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No consent records</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {patientConsents.map((consent) => {
                const expired = isExpired(consent.expiry);
                const isActive = consent.status === 'ACTIVE' && !expired;

                return (
                    <Card 
                        key={consent.id} 
                        className="glass-card border-white/10 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-primary/10"
                    >
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                                        {consent.granteeName}
                                        {consent.isEmergency && (
                                            <Badge variant="destructive" className="text-xs bg-destructive/20 text-destructive border border-destructive/40">
                                                EMERGENCY
                                            </Badge>
                                        )}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className="text-xs border-primary/40 text-primary bg-primary/10">
                                            {consent.granteeRole}
                                        </Badge>
                                        {isActive ? (
                                            <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs border border-green-500/40">
                                                ● Active
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="text-xs bg-red-500/20 text-red-400 border border-red-500/40">
                                                {expired ? '● Expired' : '● Revoked'}
                                            </Badge>
                                        )}
                                    </CardDescription>
                                </div>
                                {isActive && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/20 transition-all duration-200"
                                        onClick={() => handleRevoke(consent.id, consent.granteeName, consent.isEmergency)}
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        Revoke
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-2">Access to:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {consent.scope.map((s) => (
                                            <Badge key={s} variant="secondary" className="text-xs bg-secondary/50 text-secondary-foreground">
                                                {s.replace('_', ' ')}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    {isActive ? (
                                        <span>Expires in {daysUntilExpiry(consent.expiry)} days</span>
                                    ) : (
                                        <span>Granted on {new Date(consent.createdAt).toLocaleDateString()}</span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
