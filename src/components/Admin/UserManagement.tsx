'use client';

import { useUserStore } from '@/stores/userStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';

export function UserManagement() {
    const { users, approveUser, rejectUser } = useUserStore();

    const pendingUsers = users.filter(u => u.status === 'PENDING');
    const activeUsers = users.filter(u => u.status === 'ACTIVE');

    const handleApprove = (id: string, name: string) => {
        approveUser(id);
        toast.success(`Approved user ${name}`);
    };

    const handleReject = (id: string, name: string) => {
        rejectUser(id);
        toast.error(`Rejected user ${name}`);
    };

    return (
        <div className="space-y-6">
            {/* Pending Approvals */}
            <Card className="glass-card border-white/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Pending Approvals
                        {pendingUsers.length > 0 && (
                            <Badge variant="destructive" className="rounded-full px-2">
                                {pendingUsers.length}
                            </Badge>
                        )}
                    </CardTitle>
                    <CardDescription>Review and approve new account requests</CardDescription>
                </CardHeader>
                <CardContent>
                    {pendingUsers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No pending approvals
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-white/10 hover:bg-white/5">
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingUsers.map((user) => (
                                    <TableRow key={user.id} className="border-white/10 hover:bg-white/5">
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="border-primary/50 text-primary">
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20" onClick={() => handleReject(user.id, user.name)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-400 hover:text-green-300 hover:bg-green-900/20" onClick={() => handleApprove(user.id, user.name)}>
                                                <Check className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Active Users */}
            <Card className="glass-card border-white/10">
                <CardHeader>
                    <CardTitle>Active Users</CardTitle>
                    <CardDescription>System users with active access</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/10 hover:bg-white/5">
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activeUsers.map((user) => (
                                <TableRow key={user.id} className="border-white/10 hover:bg-white/5">
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="border-primary/50 text-primary">
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-green-500/10 text-green-400 hover:bg-green-500/20">
                                            Active
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
