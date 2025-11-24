'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRecordStore } from '@/stores/recordStore';
import { useUserStore } from '@/stores/userStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { toast } from 'sonner';
import { Upload, Loader2 } from 'lucide-react';
import { RecordType } from '@/types';

const formSchema = z.object({
    type: z.enum(['LAB_REPORT', 'PRESCRIPTION', 'IMAGING', 'CLINICAL_NOTE', 'VACCINATION']),
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    file: z.any().optional(),
});

interface UploadRecordDialogProps {
    patientId: string;
    trigger?: React.ReactNode;
}

export function UploadRecordDialog({ patientId, trigger }: UploadRecordDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const uploadRecord = useRecordStore((state) => state.uploadRecord);
    const currentUser = useUserStore((state) => state.currentUser);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: 'CLINICAL_NOTE',
            title: '',
            description: '',
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Limit file size to 5MB
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }
            setSelectedFile(file);
        }
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!currentUser) return;

        setIsLoading(true);

        try {
            let fileData: string | undefined;
            let fileName: string | undefined;
            let fileType: string | undefined;

            if (selectedFile) {
                // Convert file to base64
                const reader = new FileReader();
                fileData = await new Promise((resolve) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.readAsDataURL(selectedFile);
                });
                fileName = selectedFile.name;
                fileType = selectedFile.type;
            }

            await uploadRecord(
                patientId,
                currentUser.id,
                values.type as RecordType,
                values.title,
                values.description,
                fileData,
                fileName,
                fileType
            );

            toast.success('Record uploaded successfully and encrypted');
            form.reset();
            setSelectedFile(null);
            setOpen(false);
        } catch (error) {
            toast.error('Failed to upload record');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-primary hover:bg-primary/90">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Record
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 max-w-md">
                <DialogHeader>
                    <DialogTitle>Upload Medical Record</DialogTitle>
                    <DialogDescription>
                        Add a new encrypted medical record to the blockchain
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Record Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-secondary/50 border-white/10">
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="LAB_REPORT">Lab Report</SelectItem>
                                            <SelectItem value="PRESCRIPTION">Prescription</SelectItem>
                                            <SelectItem value="IMAGING">Imaging</SelectItem>
                                            <SelectItem value="CLINICAL_NOTE">Clinical Note</SelectItem>
                                            <SelectItem value="VACCINATION">Vaccination</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., Blood Test Results"
                                            {...field}
                                            className="bg-secondary/50 border-white/10"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Provide details about this record..."
                                            {...field}
                                            className="bg-secondary/50 border-white/10 min-h-[80px]"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div>
                            <label className="text-sm font-medium">File (Optional)</label>
                            <Input
                                type="file"
                                onChange={handleFileChange}
                                className="bg-secondary/50 border-white/10 mt-2"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            />
                            {selectedFile && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                                </p>
                            )}
                        </div>

                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Encrypting...
                                </>
                            ) : (
                                'Upload Record'
                            )}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
