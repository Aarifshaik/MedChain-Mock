'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useConsentStore } from '@/stores/consentStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ShieldAlert } from 'lucide-react';

const formSchema = z.object({
    reason: z.string().min(20, 'Reason must be at least 20 characters'),
});

interface EmergencyAccessDialogProps {
    doctorId: string;
    doctorName: string;
    patientId: string;
    patientName: string;
}

export function EmergencyAccessDialog({
    doctorId,
    doctorName,
    patientId,
    patientName,
}: EmergencyAccessDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const requestEmergencyAccess = useConsentStore((state) => state.requestEmergencyAccess);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            reason: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);

        try {
            requestEmergencyAccess(doctorId, doctorName, patientId, patientName, values.reason);

            toast.success('Emergency access request submitted to Admin', {
                description: 'You will be notified once approved',
            });
            form.reset();
            setOpen(false);
        } catch (error) {
            toast.error('Failed to submit request');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="w-full border-destructive/30 text-destructive">
                    <ShieldAlert className="w-3 h-3 mr-2" />
                    Request Emergency Access
                </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 max-w-md border-l-4 border-l-destructive relative">
                <LoadingOverlay isLoading={isLoading} message="Submitting emergency request..." />
                
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <ShieldAlert className="w-5 h-5" />
                        Emergency Access Request
                    </DialogTitle>
                    <DialogDescription>
                        Request immediate access to <span className="text-foreground font-medium">{patientName}</span>&apos;s medical records
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm">
                            <p className="text-destructive font-medium mb-1">⚠️ Break-Glass Access</p>
                            <p className="text-muted-foreground text-xs">
                                This request will be sent to the system administrator for approval. Use only in genuine medical emergencies.
                            </p>
                        </div>

                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Emergency Reason</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Provide detailed justification for emergency access (minimum 20 characters)..."
                                            {...field}
                                            className="bg-secondary/50 border-white/10 min-h-[100px]"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full bg-destructive hover:bg-destructive/90"
                            loading={isLoading}
                        >
                            <ShieldAlert className="mr-2 h-4 w-4" />
                            Submit Emergency Request
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
