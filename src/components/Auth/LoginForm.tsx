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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Role } from '@/types';

const formSchema = z.object({
    email: z.string().email(),
    role: z.enum(['ADMIN', 'DOCTOR', 'PATIENT', 'LAB', 'PHARMACIST', 'INSURER', 'RESEARCHER']),
});

export function LoginForm() {
    const router = useRouter();
    const login = useUserStore((state) => state.login);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            role: 'PATIENT',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const success = login(values.email, values.role as Role);

        if (success) {
            toast.success('Logged in successfully');
            // Redirect based on role
            switch (values.role) {
                case 'ADMIN': router.push('/admin'); break;
                case 'DOCTOR': router.push('/doctor'); break;
                case 'PATIENT': router.push('/patient'); break;
                case 'LAB': router.push('/lab'); break;
                case 'PHARMACIST': router.push('/pharmacist'); break;
                case 'RESEARCHER': router.push('/researcher'); break;
                case 'INSURER': router.push('/insurer'); break;
                default: router.push('/');
            }
        } else {
            toast.error('Invalid credentials or account not active');
        }
        setIsLoading(false);
    }

    const fillDemo = (email: string, role: Role) => {
        form.setValue('email', email);
        form.setValue('role', role);
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center text-foreground">Welcome Back</CardTitle>
                <CardDescription className="text-center text-muted-foreground">
                    Login to access your secure health records
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                            <SelectItem value="ADMIN">Admin</SelectItem>
                                            <SelectItem value="DOCTOR">Doctor</SelectItem>
                                            <SelectItem value="PATIENT">Patient</SelectItem>
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
                            Login
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <div className="text-xs text-muted-foreground text-center mb-2">Demo Credentials:</div>
                <div className="flex gap-2 w-full">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-xs border-border hover:bg-accent hover:text-accent-foreground" 
                        onClick={() => fillDemo('admin@medchain.com', 'ADMIN')}
                    >
                        Admin
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-xs border-border hover:bg-accent hover:text-accent-foreground" 
                        onClick={() => fillDemo('doctor@medchain.com', 'DOCTOR')}
                    >
                        Doctor
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-xs border-border hover:bg-accent hover:text-accent-foreground" 
                        onClick={() => fillDemo('patient@medchain.com', 'PATIENT')}
                    >
                        Patient
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
