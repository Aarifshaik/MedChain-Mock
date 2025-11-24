import { useDLTStore } from '@/stores/dltStore';

const NETWORK_DELAY_MS = 1500; // Simulate consensus time

export const mockFabric = {
    submitTransaction: async (functionName: string, args: string[], callerId: string) => {
        console.log(`[Fabric] Submitting transaction: ${functionName}`, args);

        // Simulate network latency
        await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS));

        // Add to store
        useDLTStore.getState().addTransaction(functionName, args, callerId);

        // Auto-mine block for immediate feedback in this mock
        useDLTStore.getState().mineBlock();

        return {
            status: 'SUCCESS',
            txId: 'mock-tx-id', // In a real app we'd get the actual ID from the store
        };
    },

    queryState: async (key: string) => {
        // In a real mock, we might query the World State (IndexedDB). 
        // For now, we rely on the Stores to hold the "World State".
        return null;
    }
};
