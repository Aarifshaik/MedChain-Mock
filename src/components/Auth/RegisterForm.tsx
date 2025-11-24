'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Role } from '@/types';

const formSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email(),
    role: z.enum(['PATIENT', 'DOCTOR', 'LAB', 'PHARMACIST', 'RESEARCHER', 'INSURER']),
});

export function RegisterForm() {
    const router = useRouter();
    const register = useUserStore((state) => state.register);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            role: 'PATIENT',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        register(values.name, values.email, values.role as Role);

        toast.success('Registration successful! Please wait for Admin approval.');
        router.push('/login');
        setIsLoading(false);
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center text-foreground">Create Account</CardTitle>
                <CardDescription className="text-center text-muted-foreground">
                    Join the secure healthcare network
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-foreground">Full Name</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="John Doe" 
                                            {...field} 
                                            className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-destructive" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-foreground">Email</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="name@example.com" 
                                            {...field} 
                                            className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-destructive" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-foreground">Role</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-input border-border text-foreground">
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="PATIENT">Patient</SelectItem>
                                            <SelectItem value="DOCTOR">Doctor</SelectItem>
                                            <SelectItem value="LAB">Lab Technician</SelectItem>
                                            <SelectItem value="PHARMACIST">Pharmacist</SelectItem>
                                            <SelectItem value="RESEARCHER">Researcher</SelectItem>
                                            <SelectItem value="INSURER">Insurer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="text-destructive" />
                                </FormItem>
                            )}
                        />

                        <Button 
                            type="submit" 
                            className="w-full shadow-lg shadow-primary/25" 
                            loading={isLoading}
                        >
                            Register
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
