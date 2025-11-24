export const mockQuantum = {
    generateKeyPair: async () => {
        // Simulate PQC Key Generation (Kyber-1024)
        return {
            publicKey: `pq-pk-${Math.random().toString(36).substring(7)}`,
            privateKey: `pq-sk-${Math.random().toString(36).substring(7)}`,
            algorithm: 'CRYSTALS-Kyber-1024',
        };
    },

    encrypt: async (data: string, recipientPublicKey: string) => {
        // 1. Generate a random symmetric key (AES-256)
        const key = await window.crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );

        // 2. Encrypt the data with AES
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encodedData = new TextEncoder().encode(data);
        const encryptedContent = await window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            encodedData
        );

        // 3. "Encapsulate" the AES key using the recipient's PQC public key (Mock)
        // In reality, we'd export the AES key and encrypt it with the PQC KEM.
        const exportedKey = await window.crypto.subtle.exportKey('raw', key);
        const wrappedKey = `[QUANTUM-ENCAPSULATED-KEY-FOR-${recipientPublicKey}]`;

        return {
            encryptedContent: Array.from(new Uint8Array(encryptedContent)), // Store as array for JSON serialization
            iv: Array.from(iv),
            keyMeta: {
                type: 'QUANTUM_MOCK',
                algorithm: 'CRYSTALS-Kyber-1024',
                wrappedKey,
            },
        };
    },

    decrypt: async (encryptedData: unknown, privateKey: string) => {
        // Mock decryption
        // In reality, we'd decapsulate the AES key using the PQC private key.
        return "Decrypted Content (Mock)";
    }
};
