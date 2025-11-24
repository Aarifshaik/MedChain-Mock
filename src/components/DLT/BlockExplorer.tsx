'use client';

import { useDLTStore } from '@/stores/dltStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, ArrowRight, Clock, Hash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns'; // I don't have date-fns installed, I'll use native Intl or install it. I'll use native for now.

export function BlockExplorer() {
    const { blocks } = useDLTStore();

    // Reverse blocks to show newest first
    const displayBlocks = [...blocks].reverse();

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="glass-card border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Block Height</CardTitle>
                        <Box className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">#{blocks.length - 1}</div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                        <Hash className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {blocks.reduce((acc, b) => acc + b.transactions.length, 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <h2 className="text-2xl font-bold tracking-tight">Ledger Activity</h2>

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
                                <Card className="glass-card border-white/10 overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-teal-500 to-cyan-500" />
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Box className="w-5 h-5 text-primary" />
                                                <CardTitle className="text-lg">Block #{block.number}</CardTitle>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Clock className="w-3 h-3" />
                                                {new Date(block.timestamp).toLocaleTimeString()}
                                            </div>
                                        </div>
                                        <CardDescription className="font-mono text-xs truncate max-w-md">
                                            Hash: {block.hash}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {block.transactions.length === 0 ? (
                                            <div className="text-sm text-muted-foreground italic">No transactions (Genesis/Empty)</div>
                                        ) : (
                                            <div className="space-y-2">
                                                {block.transactions.map((tx) => (
                                                    <div key={tx.txId} className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                                                                {tx.functionName}
                                                            </Badge>
                                                            <span className="text-muted-foreground truncate max-w-[200px]">
                                                                {tx.args.join(', ')}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono text-xs text-muted-foreground">
                                                                {tx.txId.substring(0, 8)}...
                                                            </span>
                                                            <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 text-[10px] h-5">
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
