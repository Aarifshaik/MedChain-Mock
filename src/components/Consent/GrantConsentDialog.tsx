'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useConsentStore } from '@/stores/consentStore';
import { useUserStore } from '@/stores/userStore';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Shield, Loader2 } from 'lucide-react';
import { RecordType } from '@/types';

const formSchema = z.object({
    granteeId: z.string().min(1, 'Please select a user'),
    scope: z.array(z.string()).min(1, 'Select at least one record type'),
    expiryDays: z.string(),
});

interface GrantConsentDialogProps {
    patientId: string;
}

const RECORD_TYPES: { label: string; value: RecordType }[] = [
    { label: 'Lab Reports', value: 'LAB_REPORT' },
    { label: 'Prescriptions', value: 'PRESCRIPTION' },
    { label: 'Imaging', value: 'IMAGING' },
    { label: 'Clinical Notes', value: 'CLINICAL_NOTE' },
    { label: 'Vaccinations', value: 'VACCINATION' },
];

export function GrantConsentDialog({ patientId }: GrantConsentDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const grantConsent = useConsentStore((state) => state.grantConsent);
    const users = useUserStore((state) => state.users);

    // Get active doctors and other healthcare providers
    const eligibleUsers = users.filter(
        (u) => u.status === 'ACTIVE' && u.id !== patientId && ['DOCTOR', 'LAB', 'RESEARCHER', 'INSURER'].includes(u.role)
    );

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            granteeId: '',
            scope: [],
            expiryDays: '30',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);

        try {
            const selectedUser = users.find((u) => u.id === values.granteeId);
            if (!selectedUser) throw new Error('User not found');

            grantConsent(
                patientId,
                values.granteeId,
                selectedUser.name,
                selectedUser.role,
                values.scope as RecordType[],
                parseInt(values.expiryDays)
            );

            toast.success(`Consent granted to ${selectedUser.name}`);
            form.reset();
            setOpen(false);
        } catch (error) {
            toast.error('Failed to grant consent');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                    <Shield className="w-4 h-4 mr-2" />
                    Grant Consent
                </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 max-w-md">
                <DialogHeader>
                    <DialogTitle>Grant Access Consent</DialogTitle>
                    <DialogDescription>
                        Allow a healthcare provider to access your medical records
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="granteeId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Healthcare Provider</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-secondary/50 border-white/10">
                                                <SelectValue placeholder="Select provider" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {eligibleUsers.map((user) => (
                                                <SelectItem key={user.id} value={user.id}>
                                                    {user.name} ({user.role})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="scope"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Record Types</FormLabel>
                                    <div className="space-y-2">
                                        {RECORD_TYPES.map((type) => (
                                            <div key={type.value} className="flex items-center space-x-3">
                                                <Checkbox
                                                    checked={field.value?.includes(type.value)}
                                                    onCheckedChange={(checked) => {
                                                        return checked
                                                            ? field.onChange([...field.value, type.value])
                                                            : field.onChange(field.value?.filter((v) => v !== type.value));
                                                    }}
                                                />
                                                <label className="text-sm font-normal cursor-pointer">
                                                    {type.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="expiryDays"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Consent Duration</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-secondary/50 border-white/10">
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="7">7 Days</SelectItem>
                                            <SelectItem value="30">30 Days</SelectItem>
                                            <SelectItem value="90">90 Days</SelectItem>
                                            <SelectItem value="365">1 Year</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Granting...
                                </>
                            ) : (
                                'Grant Consent'
                            )}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
