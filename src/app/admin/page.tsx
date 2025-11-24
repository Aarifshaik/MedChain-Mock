'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import { UserManagement } from '@/components/Admin/UserManagement';
import { EmergencyAccessManagement } from '@/components/Admin/EmergencyAccessManagement';
import { useUserStore } from '@/stores/userStore';
import { useConsentStore } from '@/stores/consentStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, ShieldAlert } from 'lucide-react';

export default function AdminDashboard() {
    const { users } = useUserStore();
    const { emergencyRequests } = useConsentStore();

    const pendingCount = users.filter(u => u.status === 'PENDING').length;
    const activeCount = users.filter(u => u.status === 'ACTIVE').length;
    const emergencyCount = emergencyRequests.filter(r => r.status === 'PENDING').length;

    return (
        <DashboardLayout role="ADMIN">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">System administration and access control</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="glass-card hover:scale-[1.02] transition-all duration-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{users.length}</div>
                            <p className="text-xs text-muted-foreground">Across all roles</p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card hover:scale-[1.02] transition-all duration-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                            <UserPlus className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-accent">{pendingCount}</div>
                            <p className="text-xs text-muted-foreground">Requires attention</p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card hover:scale-[1.02] transition-all duration-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Emergency Access</CardTitle>
                            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-destructive">{emergencyCount}</div>
                            <p className="text-xs text-muted-foreground">Active requests</p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="users" className="space-y-4">
                    <TabsList className="glass">
                        <TabsTrigger value="users" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-200">User Management</TabsTrigger>
                        <TabsTrigger value="emergency" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-200">
                            Emergency Access
                            {emergencyCount > 0 && (
                                <span className="ml-2 bg-destructive text-destructive-foreground rounded-full px-2 py-0.5 text-xs">
                                    {emergencyCount}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="users">
                        <UserManagement />
                    </TabsContent>

                    <TabsContent value="emergency">
                        <EmergencyAccessManagement />
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
