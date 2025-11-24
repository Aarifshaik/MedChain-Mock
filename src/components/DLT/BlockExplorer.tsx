'use client';

import { useDLTStore } from '@/stores/dltStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Clock, Hash } from 'lucide-react';
import { useState, useEffect } from 'react';

export function BlockExplorer() {
    const { blocks } = useDLTStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate async data loading
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    // Reverse blocks to show newest first
    const displayBlocks = [...blocks].reverse();

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2].map((i) => (
                        <Card key={i} className="glass-card border-white/10">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-4 rounded" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Skeleton className="h-8 w-48" />
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="glass-card border-white/10">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="w-5 h-5 rounded" />
                                        <Skeleton className="h-6 w-24" />
                                    </div>
                                    <Skeleton className="h-4 w-20" />
                                </div>
                                <Skeleton className="h-4 w-64 mt-2" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="glass-card border-white/10 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">Block Height</CardTitle>
                        <Box className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">#{blocks.length - 1}</div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-white/10 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">Total Transactions</CardTitle>
                        <Hash className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {blocks.reduce((acc, b) => acc + b.transactions.length, 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-foreground">Ledger Activity</h2>

            <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                    <AnimatePresence initial={false}>
                        {displayBlocks.map((block, index) => (
                            <motion.div
                                key={block.hash}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <Card className="glass-card border-white/10 overflow-hidden transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg hover:shadow-primary/10 cursor-pointer">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-teal-500 to-cyan-500" />
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Box className="w-5 h-5 text-primary" />
                                                <CardTitle className="text-lg text-foreground">Block #{block.number}</CardTitle>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Clock className="w-3 h-3" />
                                                <span className="font-mono">{new Date(block.timestamp).toLocaleTimeString()}</span>
                                            </div>
                                        </div>
                                        <CardDescription className="font-mono text-xs truncate max-w-md text-muted-foreground">
                                            Hash: {block.hash}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {block.transactions.length === 0 ? (
                                            <div className="text-sm text-muted-foreground italic">No transactions (Genesis/Empty)</div>
                                        ) : (
                                            <div className="space-y-2">
                                                {block.transactions.map((tx) => (
                                                    <div key={tx.txId} className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-colors duration-200">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="text-xs border-primary/40 text-primary bg-primary/10">
                                                                {tx.functionName}
                                                            </Badge>
                                                            <span className="text-card-foreground truncate max-w-[200px]">
                                                                {tx.args.join(', ')}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono text-xs text-muted-foreground">
                                                                {tx.txId.substring(0, 8)}...
                                                            </span>
                                                            <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 text-[10px] h-5 border border-green-500/40">
                                                                VALID
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </ScrollArea>
        </div>
    );
}
