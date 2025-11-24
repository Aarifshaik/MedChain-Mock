import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Block, Transaction } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface DLTState {
    blocks: Block[];
    pendingTransactions: Transaction[];

    addTransaction: (functionName: string, args: string[], callerId: string) => void;
    mineBlock: () => void; // Manually trigger block creation for demo
    getLatestBlock: () => Block | null;
}

const GENESIS_BLOCK: Block = {
    number: 0,
    hash: '0x0000000000000000000000000000000000000000',
    previousHash: '0x0',
    transactions: [],
    timestamp: Date.now(),
};

export const useDLTStore = create<DLTState>()(
    persist(
        (set, get) => ({
            blocks: [GENESIS_BLOCK],
            pendingTransactions: [],

            addTransaction: (functionName, args, callerId) => {
                const newTx: Transaction = {
                    txId: uuidv4(),
                    functionName,
                    args,
                    callerId,
                    timestamp: Date.now(),
                    status: 'VALID',
                };
                set((state) => ({
                    pendingTransactions: [...state.pendingTransactions, newTx],
                }));
                // Auto-mine for smoother demo experience, or keep manual?
                // Let's auto-mine after a short delay in the Adapter, but here just state update.
            },

            mineBlock: () => {
                const { blocks, pendingTransactions } = get();
                if (pendingTransactions.length === 0) return;

                const previousBlock = blocks[blocks.length - 1];
                const newBlock: Block = {
                    number: previousBlock.number + 1,
                    hash: `0x${Math.random().toString(16).substr(2, 40)}`, // Mock hash
                    previousHash: previousBlock.hash,
                    transactions: [...pendingTransactions],
                    timestamp: Date.now(),
                };

                set({
                    blocks: [...blocks, newBlock],
                    pendingTransactions: [],
                });
            },

            getLatestBlock: () => {
                const { blocks } = get();
                return blocks[blocks.length - 1];
            },
        }),
        {
            name: 'medchain-dlt-storage',
        }
    )
);
