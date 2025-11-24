# MedChain: DLT-Based Healthcare Data Exchange (Mock)

## Overview
MedChain is a pure-frontend, single-organization mock of a Hyperledger Fabric-based healthcare data exchange system. It is designed to simulate Distributed Ledger Technology (DLT) behavior, identity management, and quantum-safe cryptographic flows entirely in the browser.

**Key Capabilities:**
- **Zero Backend**: Runs entirely in the browser using LocalStorage and IndexedDB.
- **Fabric Simulation**: Mocks Hyperledger Fabric flows including transaction submission, block generation, and chaincode events.
- **Quantum-Safe Mock**: Simulates Post-Quantum Cryptography (PQC) Key Encapsulation Mechanisms (KEM) for future-proofing.
- **Migration Ready**: Uses an Adapter pattern to allow easy swapping of mock components with real Fabric SDKs and IPFS nodes.

---

## Features

### 1. Role-Based Identity Management
- **Admin**: Registers professional users (Doctor, Lab, Researcher, Insurer, Pharmacist).
- **Doctor**: Registers Patients, uploads records, issues referrals, and writes prescriptions.
- **Patient**: Accepts registration, manages consent, views records, and controls access.
- **Pharmacist**: Views and fulfills e-prescriptions.
- **Third Parties**: Labs, Insurers, and Researchers request and access data based on consent.

### 2. Advanced Healthcare Workflows
- **"Break-Glass" Emergency Access**: Allows doctors to access patient records without active consent in emergencies. Triggers a high-priority audit log and immediate patient notification.
- **Doctor Referrals**: Enables a doctor to grant temporary access to another specialist for a second opinion.
- **E-Prescriptions**: Secure, immutable prescription issuance and fulfillment tracking between Doctors and Pharmacists.
- **FHIR Compatibility**: Data models are designed to map to HL7 FHIR resources (Patient, Observation, MedicationRequest) for interoperability.

### 3. Mock DLT Network
- **Transaction Simulation**: `submitTransaction` simulates network latency, consensus, and block confirmation.
- **Block Explorer**: Visualizes simulated blocks, transactions, and events.
- **Immutable Audit Log**: Tracks all actions (Register, Upload, Share, Access, Revoke) with cryptographic linkage.

### 4. Secure Data Exchange
- **Client-Side Encryption**: Files are encrypted using AES-GCM (Web Crypto API) before "upload" (storage in IndexedDB).
- **Consent Tokens**: Access is granted via signed tokens containing scope and expiry.
- **Quantum-Safe Simulation**: Metadata indicates "Quantum-Wrapped" keys to simulate PQC workflows.

---

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Local Database**: `idb` (IndexedDB wrapper)
- **Cryptography**: Web Crypto API (Native browser standard)
- **Utilities**: `uuid`, `clsx`, `lucide-react`

---

## Project Structure

The project follows a modular architecture to separate UI from the mock DLT logic.

```
/src
  /app                 # Next.js App Router pages
    /(auth)            # Login & Registration
    /admin             # Admin Dashboard
    /doctor            # Doctor Dashboard
    /patient           # Patient Dashboard
    /lab               # Lab Dashboard
    /pharmacist        # Pharmacist Dashboard
    /researcher        # Researcher Dashboard
    /insurer           # Insurer Dashboard
    /audit             # Audit Log Viewer
    /dlt               # DLT Explorer
  
  /components
    /Auth              # Authentication forms
    /Records           # Record viewer & uploader
    /Consent           # Consent management UI
    /DLT               # Block & Transaction visualizers
    /UI                # Shared UI components (Buttons, Cards, Modals)

  /api                 # Adapter Interfaces & Implementations
    adapters.ts        # Central Dependency Injection
    /dlt               # Mock Fabric Adapter
    /storage           # Mock IPFS/Storage Adapter
    /crypto            # Web Crypto Adapter (Quantum Mock)
    /payment           # Mock Payment Adapter

  /stores              # Zustand State Stores
    userStore.ts       # Session & User State
    dltStore.ts        # Blockchain State (Blocks, Txs)
    recordStore.ts     # Metadata Cache

  /utils               # Helpers
    crypto.ts          # Low-level crypto helpers
    idb.ts             # IndexedDB setup
    mockData.ts        # Demo accounts & initial state
```

---

## Architecture: The Adapter Pattern

To ensure the frontend is ready for a real DLT backend, all external interactions are routed through **Adapters**.

### 1. DLT Adapter (`dltAdapter`)
Simulates the Hyperledger Fabric Gateway API.
- `submitTransaction(name, args)`: Returns a mock receipt `{ txId, blockNumber, status }`.
- `evaluateTransaction(name, args)`: Queries the mock world state.
- `getEvents(since)`: Returns simulated chaincode events.

### 2. Storage Adapter (`storageAdapter`)
Simulates IPFS or Off-chain storage.
- `upload(blob)`: Stores encrypted blob in IndexedDB, returns a CID (Content Identifier).
- `download(cid)`: Retrieves blob from IndexedDB.

### 3. Crypto Adapter (`cryptoAdapter`)
Handles all cryptographic operations.
- `generateKeyPair()`: Creates ECDSA keys.
- `encrypt()`: AES-GCM encryption.
- `sign()` / `verify()`: Digital signatures.
- **Quantum Mock**: Wraps keys with a simulated "PQC" tag to demonstrate hybrid encryption flows.

---

## Data Models

### User Identity
```typescript
interface User {
  id: string;
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT' | 'LAB' | 'RESEARCHER' | 'INSURER' | 'PHARMACIST';
  publicKey: string; // JWK or PEM
  status: 'PENDING' | 'ACTIVE';
}
```

### Medical Record (FHIR-aligned)
```typescript
interface MedicalRecord {
  id: string;
  patientId: string;
  type: 'LAB_REPORT' | 'PRESCRIPTION' | 'IMAGING' | 'CLINICAL_NOTE';
  fhirResourceType: 'Observation' | 'MedicationRequest' | 'DiagnosticReport';
  fileCid: string; // Mock IPFS Hash
  encryption: {
    iv: string;
    algorithm: 'AES-GCM';
    keyMeta: { type: 'QUANTUM_MOCK', wrappedKey: string };
  };
  metadata: {
    description: string;
    date: string;
    doctorName: string;
  };
}
```

### Consent Token & Audit
```typescript
interface AccessToken {
  issuer: string; // Patient
  grantee: string; // Doctor/Researcher
  scope: string[]; // e.g., ['READ_LABS', 'READ_PRESCRIPTIONS']
  expiry: number;
  signature: string; // Signed by Patient
  isEmergency?: boolean; // If true, bypasses standard checks but flags audit
}
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Reset Demo**
   - Use the "Reset Demo" button in the UI to clear LocalStorage and IndexedDB.

---

## Future Migration Path

To move to production:
1. **Replace `dltAdapter`**: Connect to a real Hyperledger Fabric peer using `fabric-network`.
2. **Replace `storageAdapter`**: Connect to a real IPFS node or S3 bucket.
3. **Replace `cryptoAdapter`**: Integrate with a hardware security module (HSM) or server-side wallet.