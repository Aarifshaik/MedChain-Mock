'use client';

import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShieldCheck, Database, Activity, Lock } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center pt-24 px-6 text-center relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-white/10 text-sm text-primary mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Live DLT Simulation
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            The Future of <br />
            <span className="text-gradient">Secure Healthcare</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A Quantum-Safe, DLT-powered ecosystem for immutable patient records,
            consent management, and secure data exchange.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/register">
              <Button size="lg" className="h-12 px-8 text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25">
                Start Demo
              </Button>
            </Link>
            <Link href="/dlt">
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg border-white/10 hover:bg-white/5">
                View Block Explorer
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-6xl w-full px-4">
          <FeatureCard
            icon={<ShieldCheck className="w-8 h-8 text-teal-400" />}
            title="Quantum-Safe"
            description="Simulating Post-Quantum Cryptography (Kyber-1024) for future-proof data protection."
            delay={0.2}
          />
          <FeatureCard
            icon={<Database className="w-8 h-8 text-cyan-400" />}
            title="Hyperledger Fabric"
            description="Mock DLT network with immutable ledger, smart contracts, and consensus simulation."
            delay={0.4}
          />
          <FeatureCard
            icon={<Lock className="w-8 h-8 text-indigo-400" />}
            title="Patient Control"
            description="Granular consent management. Patients own their data and control access via signed tokens."
            delay={0.6}
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-card p-6 flex flex-col items-center text-center space-y-4"
    >
      <div className="p-3 bg-white/5 rounded-xl border border-white/10">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}
